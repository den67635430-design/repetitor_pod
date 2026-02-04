// src/services/support.service.js
const Anthropic = require('@anthropic-ai/sdk');
const { PrismaClient } = require('@prisma/client');
const TelegramBot = require('node-telegram-bot-api');

const prisma = new PrismaClient();

class AISupportService {
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
    
    // Telegram бот для отправки эскалаций
    this.telegramBot = process.env.TELEGRAM_BOT_TOKEN 
      ? new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false })
      : null;
      
    this.adminChatId = process.env.ADMIN_TELEGRAM_ID;
  }

  async handleSupportRequest({ userId, message, conversationHistory = [] }) {
    try {
      // Получить пользователя
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true }
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // AI пытается помочь
      const aiResponse = await this.generateSupportResponse({ message, conversationHistory, user });
      
      // Сохранить сообщения
      await this.saveSupportMessage(userId, 'USER', message);
      await this.saveSupportMessage(userId, 'ASSISTANT', aiResponse.response);
      
      // Проверить, нужна ли эскалация
      const shouldEscalate = this.shouldEscalate(message, aiResponse, user);
      
      if (shouldEscalate) {
        await this.escalateProblem({
          userId,
          userName: user.name,
          userEmail: user.email,
          message,
          conversationHistory,
          aiResponse: aiResponse.response
        });
        
        return {
          response: aiResponse.response + '\n\n✅ Ваша проблема передана специалисту. Мы свяжемся с вами в ближайшее время.',
          resolved: false,
          escalated: true
        };
      }
      
      return {
        response: aiResponse.response,
        resolved: aiResponse.canHelp,
        escalated: false
      };
      
    } catch (error) {
      console.error('Support Service Error:', error);
      throw error;
    }
  }

  async generateSupportResponse({ message, conversationHistory, user }) {
    const systemPrompt = `Ты - AI-специалист техподдержки образовательной платформы "Репетитор Под Рукой".

ТВОЯ РОЛЬ:
- Помогать пользователям решать проблемы быстро и эффективно
- Отвечать дружелюбно, по делу, без воды
- Если не знаешь ответа - честно признаться

ЧТО ТЫ МОЖЕШЬ РЕШИТЬ:
✅ Проблемы со входом в аккаунт (сброс пароля, восстановление)
✅ Вопросы по тарифам и подписке
✅ Технические вопросы (не работает голос, медленно загружается)
✅ Как пользоваться функциями платформы
✅ Общие вопросы о контенте и обучении

ЧТО ТЫ НЕ МОЖЕШЬ РЕШИТЬ (передай человеку):
❌ Возврат денег (требует решения администратора)
❌ Жалобы на неправильные ответы AI-репетитора (требует проверки)
❌ Серьёзные технические баги (требует разработчиков)
❌ Юридические вопросы
❌ Изменение условий подписки

ВАЖНО:
- Если не можешь помочь - скажи: "Я передам вашу проблему специалисту"
- Будь вежливым даже если пользователь груб
- Давай конкретные шаги решения
- Используй эмодзи для дружелюбности

ИНФОРМАЦИЯ О ПОЛЬЗОВАТЕЛЕ:
- Имя: ${user.name}
- Email: ${user.email}
- Подписка: ${user.subscription?.plan || 'FREE'}
- Статус: ${user.subscription?.status || 'Нет подписки'}`;

    const messages = [
      ...conversationHistory.map(msg => ({
        role: msg.role === 'USER' ? 'user' : 'assistant',
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: systemPrompt,
      messages: messages
    });

    const aiText = response.content[0].text;
    const confidence = this.analyzeConfidence(aiText);

    return {
      response: aiText,
      confidence,
      canHelp: confidence > 0.7
    };
  }

  analyzeConfidence(response) {
    const uncertainPhrases = [
      'не уверен',
      'не могу помочь',
      'передам специалисту',
      'к сожалению',
      'попробуйте связаться',
      'требует проверки',
      'свяжитесь с администратором'
    ];

    const hasUncertainty = uncertainPhrases.some(phrase =>
      response.toLowerCase().includes(phrase)
    );

    return hasUncertainty ? 0.3 : 0.9;
  }

  shouldEscalate(message, aiResponse, user) {
    // 1. AI не уверен
    if (aiResponse.confidence < 0.7) return true;

    // 2. Пользователь явно недоволен
    const frustrationKeywords = [
      'не работает',
      'уже третий раз',
      'верните деньги',
      'жалоба',
      'ужасно',
      'отвратительно',
      'возмутительно',
      'бред',
      'обман'
    ];
    if (frustrationKeywords.some(k => message.toLowerCase().includes(k))) {
      return true;
    }

    // 3. Финансовые вопросы
    const billingKeywords = ['возврат', 'деньги', 'списали', 'оплата', 'счёт'];
    if (billingKeywords.some(k => message.toLowerCase().includes(k))) {
      return true;
    }

    // 4. Серьёзные технические проблемы
    const technicalKeywords = ['не загружается', 'ошибка', 'вылетает', 'зависает', 'баг'];
    if (technicalKeywords.some(k => message.toLowerCase().includes(k))) {
      return true;
    }

    return false;
  }

  async escalateProblem({ userId, userName, userEmail, message, conversationHistory, aiResponse }) {
    const severity = this.determineSeverity(message);

    // Создать тикет в БД
    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        userName,
        userEmail,
        category: this.categorizeMessage(message),
        severity,
        status: 'OPEN',
        problem: message,
        conversationHistory: JSON.stringify([
          ...conversationHistory,
          { role: 'USER', content: message },
          { role: 'ASSISTANT', content: aiResponse }
        ])
      }
    });

    // Отправить в Telegram админу
    if (this.telegramBot && this.adminChatId) {
      await this.sendToAdminTelegram(ticket);
    } else {
      console.log('⚠️  Telegram bot not configured. Ticket created but not sent.');
      console.log('Ticket ID:', ticket.id);
      console.log('Problem:', message);
    }

    return ticket;
  }

  async sendToAdminTelegram(ticket) {
    const severityEmoji = {
      low: '🟢',
      medium: '🟡',
      high: '🔴'
    };

    const message = `
${severityEmoji[ticket.severity]} <b>НОВАЯ ПРОБЛЕМА #${ticket.id}</b>

👤 <b>Пользователь:</b> ${ticket.userName}
📧 <b>Email:</b> ${ticket.userEmail}
📂 <b>Категория:</b> ${ticket.category}
⏰ <b>Время:</b> ${new Date(ticket.createdAt).toLocaleString('ru-RU')}

💬 <b>Проблема:</b>
${ticket.problem}

🔗 <b>ID тикета:</b> ${ticket.id}
    `.trim();

    try {
      await this.telegramBot.sendMessage(this.adminChatId, message, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '✅ Взять в работу', callback_data: `take_${ticket.id}` },
              { text: '📧 Написать email', callback_data: `email_${ticket.id}` }
            ],
            [
              { text: '✓ Закрыть', callback_data: `close_${ticket.id}` }
            ]
          ]
        }
      });

      await prisma.supportTicket.update({
        where: { id: ticket.id },
        data: { telegramSent: true }
      });

      console.log(`✅ Escalation sent to Telegram for ticket #${ticket.id}`);
    } catch (error) {
      console.error('Failed to send Telegram message:', error);
    }
  }

  determineSeverity(message) {
    const urgentKeywords = ['срочно', 'деньги', 'не работает', 'верните', 'жалоба'];
    const hasUrgent = urgentKeywords.some(k => message.toLowerCase().includes(k));

    if (hasUrgent) return 'high';
    
    const billingKeywords = ['оплата', 'подписка', 'тариф'];
    const hasBilling = billingKeywords.some(k => message.toLowerCase().includes(k));
    
    if (hasBilling) return 'medium';
    
    return 'low';
  }

  categorizeMessage(message) {
    const msg = message.toLowerCase();

    if (msg.includes('пароль') || msg.includes('вход') || msg.includes('войти')) {
      return 'technical';
    }
    if (msg.includes('деньги') || msg.includes('оплата') || msg.includes('подписка')) {
      return 'billing';
    }
    if (msg.includes('неправильно') || msg.includes('ошибка') || msg.includes('не работает')) {
      return 'content';
    }

    return 'other';
  }

  async saveSupportMessage(userId, role, content) {
    try {
      await prisma.supportMessage.create({
        data: {
          userId,
          role,
          content
        }
      });
    } catch (error) {
      console.error('Failed to save support message:', error);
    }
  }

  async getSupportHistory(userId, limit = 10) {
    return await prisma.supportMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }
}

module.exports = new AISupportService();
