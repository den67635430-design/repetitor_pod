// src/services/ai.service.js
const Anthropic = require('@anthropic-ai/sdk');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class AIService {
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
  }

  async chat({ message, subject, grade, userId, conversationHistory = [], outputMode = 'text' }) {
    try {
      // Построить system prompt
      const systemPrompt = this.buildSystemPrompt(subject, grade, outputMode);
      
      // Подготовить сообщения
      const messages = [
        ...conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: 'user',
          content: message
        }
      ];
      
      // Вызов Claude API
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: systemPrompt,
        messages: messages
      });
      
      const aiResponse = response.content[0].text;
      
      // Валидация ответа
      const validation = this.validateResponse(message, aiResponse, subject);
      
      // Сохранить в БД
      await this.logInteraction({
        userId,
        subject,
        grade,
        userMessage: message,
        aiResponse,
        confidence: validation.confidence,
        needsReview: validation.confidence < 0.7,
        inputMode: 'text',
        outputMode
      });
      
      return {
        text: aiResponse,
        confidence: validation.confidence,
        needsReview: validation.confidence < 0.7
      };
      
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error('Не удалось получить ответ от AI');
    }
  }

  buildSystemPrompt(subject, grade, outputMode) {
    const basePrompt = `Ты - AI-репетитор по предмету "${subject}" для ученика ${grade} класса.

ТВОЯ РОЛЬ:
- Помогай ученику понять материал, НЕ делай за него
- Используй сократовский метод: задавай наводящие вопросы
- Адаптируй объяснения под возраст ученика
- Будь дружелюбным и поддерживающим
- Хвали за правильные ответы, мотивируй при ошибках

ВАЖНО:
- Если ученик просит решить задачу - НЕ давай готовое решение
- Веди к решению через вопросы: "Что нам дано?", "Какую формулу применим?"
- Если ученик совсем не понимает - упрости объяснение
- Используй примеры из жизни для лучшего понимания

НИКОГДА:
- Не давай прямые ответы на домашние задания
- Не используй сложные термины без объяснения
- Не будь слишком формальным - общайся как друг`;

    const subjectInstructions = this.getSubjectInstructions(subject);
    const ageInstructions = this.getAgeInstructions(grade);
    const outputInstructions = outputMode === 'voice' 
      ? '\n\nФормат ответа: разговорный стиль, короткие предложения, без сложных терминов.'
      : '\n\nФормат ответа: структурированный текст с формулами и примерами.';
    
    return `${basePrompt}\n\n${subjectInstructions}\n\n${ageInstructions}${outputInstructions}`;
  }

  getSubjectInstructions(subject) {
    const instructions = {
      'Математика': `МАТЕМАТИКА:
- Всегда показывай решение пошагово
- Объясняй каждый шаг
- Используй примеры с конкретными числами
- Проверяй правильность вычислений`,
      
      'Русский язык': `РУССКИЙ ЯЗЫК:
- Объясняй правила простым языком
- Приводи примеры предложений
- Помогай запомнить через ассоциации
- Проверяй грамматику и пунктуацию`,
      
      'Английский язык': `АНГЛИЙСКИЙ ЯЗЫК:
- Объясняй грамматику с примерами
- Помогай с произношением (давай транскрипцию)
- Используй простую лексику для объяснений
- Поощряй попытки говорить на английском`,
      
      'Физика': `ФИЗИКА:
- Объясняй физические явления на примерах из жизни
- Используй аналогии для сложных концепций
- Помогай с формулами и расчётами
- Связывай теорию с практикой`,
      
      'Химия': `ХИМИЯ:
- Объясняй реакции и процессы понятным языком
- Используй визуальные описания
- Помогай с химическими уравнениями
- Подчёркивай практическое применение`,
      
      'Биология': `БИОЛОГИЯ:
- Объясняй биологические процессы простым языком
- Используй примеры из природы и жизни
- Помогай с терминологией
- Связывай с практическими примерами`
    };
    
    return instructions[subject] || 'Объясняй материал простым и понятным языком.';
  }

  getAgeInstructions(grade) {
    if (grade <= 4) {
      return `ВОЗРАСТ: Начальная школа (1-4 класс)
- Используй очень простой язык
- Больше примеров из жизни и игр
- Игровая подача материала
- Частая похвала и мотивация
- Короткие объяснения`;
    } else if (grade <= 9) {
      return `ВОЗРАСТ: Средняя школа (5-9 класс)
- Баланс между простотой и точностью
- Связь теории с практикой
- Поддержка мотивации
- Подготовка к ОГЭ (для 9 класса)`;
    } else {
      return `ВОЗРАСТ: Старшая школа (10-11 класс)
- Академический подход
- Глубокие объяснения
- Подготовка к ЕГЭ
- Акцент на понимание, не зубрёжку`;
    }
  }

  validateResponse(userMessage, aiResponse, subject) {
    let confidence = 1.0;
    const issues = [];
    
    // 1. Проверка длины
    if (aiResponse.length < 50) {
      issues.push('Ответ слишком короткий');
      confidence -= 0.2;
    }
    
    // 2. Для математики - проверка формул
    if (subject === 'Математика') {
      const hasFormula = /[+\-*/=]/.test(aiResponse);
      if (!hasFormula && (userMessage.includes('решить') || userMessage.includes('задач'))) {
        issues.push('Нет формул в математическом ответе');
        confidence -= 0.3;
      }
    }
    
    // 3. Проверка на готовое решение
    if (this.containsFullSolution(aiResponse, userMessage)) {
      issues.push('AI дал готовое решение');
      confidence -= 0.4;
    }
    
    // 4. Проверка дружелюбности
    if (!this.isFriendlyTone(aiResponse)) {
      issues.push('Недружелюбный тон');
      confidence -= 0.1;
    }
    
    return { confidence: Math.max(0, confidence), issues };
  }

  containsFullSolution(response, question) {
    if (question.toLowerCase().includes('реши')) {
      return /ответ:\s*[\d.]+/i.test(response);
    }
    return false;
  }

  isFriendlyTone(text) {
    const friendlyWords = ['отлично', 'молодец', 'хорошо', 'давай', 'попробуй', 'супер', 'здорово'];
    return friendlyWords.some(word => text.toLowerCase().includes(word));
  }

  async logInteraction(data) {
    try {
      await prisma.aIInteraction.create({
        data: {
          userId: data.userId,
          subject: data.subject,
          grade: data.grade,
          userMessage: data.userMessage,
          aiResponse: data.aiResponse,
          confidence: data.confidence,
          needsReview: data.needsReview,
          inputMode: data.inputMode,
          outputMode: data.outputMode,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('Failed to log interaction:', error);
    }
  }
}

module.exports = new AIService();
