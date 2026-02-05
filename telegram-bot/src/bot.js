// src/bot.js
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = process.env.TELEGRAM_BOT_TOKEN;
const apiUrl = process.env.API_URL || 'http://localhost:4000';

if (!token) {
  console.error('❌ TELEGRAM_BOT_TOKEN not found in .env');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// Хранилище сессий пользователей
const userSessions = new Map();

// Rate limiting per user: track message timestamps
const userRateLimits = new Map();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_MESSAGES_PER_HOUR = 50;

// Check rate limit for a user
function checkRateLimit(chatId) {
  const now = Date.now();
  const userTimestamps = userRateLimits.get(chatId) || [];
  
  // Remove timestamps older than the window
  const recentTimestamps = userTimestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW);
  
  if (recentTimestamps.length >= MAX_MESSAGES_PER_HOUR) {
    return false; // Rate limit exceeded
  }
  
  // Add current timestamp and update
  recentTimestamps.push(now);
  userRateLimits.set(chatId, recentTimestamps);
  return true;
}

// Clean up old rate limit entries periodically (every 10 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [chatId, timestamps] of userRateLimits.entries()) {
    const recentTimestamps = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW);
    if (recentTimestamps.length === 0) {
      userRateLimits.delete(chatId);
    } else {
      userRateLimits.set(chatId, recentTimestamps);
    }
  }
  
  // Also clean up old sessions (inactive for 24 hours)
  const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;
  for (const [chatId, session] of userSessions.entries()) {
    if (session.lastActivity && now - session.lastActivity > SESSION_TIMEOUT) {
      userSessions.delete(chatId);
    }
  }
}, 10 * 60 * 1000);

console.log('🤖 Telegram бот "Репетитор Под Рукой" запущен!');

// Команда /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const user = msg.from;
  
  const welcomeMessage = `👋 Привет, ${user.first_name}!

Я *Репетитор Под Рукой* — твой личный AI-учитель! 🎓

Я помогу тебе с любым школьным предметом:
📐 Математика
📖 Русский язык  
🇬🇧 Английский язык
⚡ Физика
🧪 Химия
🧬 Биология
🌍 История
📚 Литература
🇫🇷 Французский язык

*Выбери предмет для начала:*`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '📐 Математика', callback_data: 'subject_math' },
        { text: '📖 Русский', callback_data: 'subject_russian' }
      ],
      [
        { text: '🇬🇧 Английский', callback_data: 'subject_english' },
        { text: '⚡ Физика', callback_data: 'subject_physics' }
      ],
      [
        { text: '🧪 Химия', callback_data: 'subject_chemistry' },
        { text: '🧬 Биология', callback_data: 'subject_biology' }
      ],
      [
        { text: '🌍 История', callback_data: 'subject_history' },
        { text: '📚 Литература', callback_data: 'subject_literature' }
      ]
    ]
  };

  await bot.sendMessage(chatId, welcomeMessage, {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
});

// Обработка выбора предмета
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  
  if (data.startsWith('subject_')) {
    const subjectMap = {
      'subject_math': { name: 'Математика', emoji: '📐' },
      'subject_russian': { name: 'Русский язык', emoji: '📖' },
      'subject_english': { name: 'Английский язык', emoji: '🇬🇧' },
      'subject_physics': { name: 'Физика', emoji: '⚡' },
      'subject_chemistry': { name: 'Химия', emoji: '🧪' },
      'subject_biology': { name: 'Биология', emoji: '🧬' },
      'subject_history': { name: 'История', emoji: '🌍' },
      'subject_literature': { name: 'Литература', emoji: '📚' }
    };
    
    const subject = subjectMap[data];
    
    if (subject) {
      // Сохранить выбранный предмет
      userSessions.set(chatId, {
        subject: subject.name,
        grade: 7, // По умолчанию, можно спросить
        conversationHistory: []
      });
      
      await bot.answerCallbackQuery(query.id);
      
      await bot.sendMessage(chatId, 
        `${subject.emoji} Отлично! Выбран предмет: *${subject.name}*\n\n` +
        `Задавай любые вопросы! Я помогу тебе разобраться. 😊\n\n` +
        `💡 Ты можешь писать текстом или отправить голосовое сообщение!`,
        { parse_mode: 'Markdown' }
      );
    }
  }
});

// Обработка текстовых сообщений
bot.on('message', async (msg) => {
  if (msg.text && !msg.text.startsWith('/')) {
    const chatId = msg.chat.id;
    const userMessage = msg.text;
    
    // Check rate limit first
    if (!checkRateLimit(chatId)) {
      await bot.sendMessage(chatId,
        '⏳ Вы отправили слишком много сообщений. Попробуйте через час.\n\n' +
        '💡 Лимит: 50 сообщений в час.',
        { parse_mode: 'Markdown' }
      );
      return;
    }
    
    // Validate message length
    if (userMessage.length > 2000) {
      await bot.sendMessage(chatId,
        '❗ Сообщение слишком длинное. Максимум 2000 символов.',
        { parse_mode: 'Markdown' }
      );
      return;
    }
    
    // Получить сессию
    const session = userSessions.get(chatId);
    
    if (!session) {
      await bot.sendMessage(chatId, 
        '❗ Сначала выбери предмет! Используй /start',
        {
          reply_markup: {
            inline_keyboard: [[
              { text: '🎓 Выбрать предмет', callback_data: 'start' }
            ]]
          }
        }
      );
      return;
    }
    
    // Update last activity timestamp
    session.lastActivity = Date.now();
    
    // Показать "печатает..."
    await bot.sendChatAction(chatId, 'typing');
    
    try {
      // Вызвать AI через API (демо без авторизации)
      const aiResponse = getAIResponse(userMessage, session.subject);
      
      // В продакшне здесь будет реальный вызов API:
      // const response = await axios.post(`${apiUrl}/api/ai/chat`, {
      //   message: userMessage,
      //   subject: session.subject,
      //   grade: session.grade,
      //   outputMode: 'text'
      // }, {
      //   headers: { Authorization: `Bearer ${session.token}` }
      // });
      
      // Отправить ответ
      await bot.sendMessage(chatId, 
        `🤖 *AI-Репетитор (${session.subject}):*\n\n${aiResponse}`,
        { parse_mode: 'Markdown' }
      );
      
      // Сохранить в историю
      session.conversationHistory.push(
        { role: 'user', content: userMessage },
        { role: 'assistant', content: aiResponse }
      );
      
    } catch (error) {
      console.error('Error:', error);
      await bot.sendMessage(chatId, 
        '❌ Извини, произошла ошибка. Попробуй ещё раз!'
      );
    }
  }
});

// Обработка голосовых сообщений
bot.on('voice', async (msg) => {
  const chatId = msg.chat.id;
  
  await bot.sendMessage(chatId,
    '🎤 Получил твоё голосовое сообщение!\n\n' +
    '💡 *В MVP версии* распознавание голоса будет добавлено в следующей версии.\n\n' +
    'А пока напиши вопрос текстом! 😊',
    { parse_mode: 'Markdown' }
  );
});

// Обработка фото (домашка)
bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  
  await bot.sendMessage(chatId,
    '📸 Получил твоё фото!\n\n' +
    '💡 *В MVP версии* проверка домашки по фото будет добавлена в следующей версии.\n\n' +
    'А пока задай вопрос текстом! 😊',
    { parse_mode: 'Markdown' }
  );
});

// Команда /help
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  
  const helpMessage = `🆘 *Справка - Репетитор Под Рукой*

*Что я умею:*
✅ Помогать с домашними заданиями
✅ Объяснять сложные темы
✅ Отвечать на вопросы по 9 предметам
✅ Работать 24/7

*Команды:*
/start - Начать работу и выбрать предмет
/help - Эта справка
/change - Сменить предмет

*Как пользоваться:*
1️⃣ Выбери предмет командой /start
2️⃣ Задавай вопросы текстом
3️⃣ Получай ответы от AI-репетитора!

💡 *Совет:* Задавай конкретные вопросы для лучших ответов!

📱 *Веб-версия:* repetitor-pod-rukoy.ru
`;

  await bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

// Команда /change - сменить предмет
bot.onText(/\/change/, async (msg) => {
  const chatId = msg.chat.id;
  
  const keyboard = {
    inline_keyboard: [
      [
        { text: '📐 Математика', callback_data: 'subject_math' },
        { text: '📖 Русский', callback_data: 'subject_russian' }
      ],
      [
        { text: '🇬🇧 Английский', callback_data: 'subject_english' },
        { text: '⚡ Физика', callback_data: 'subject_physics' }
      ],
      [
        { text: '🧪 Химия', callback_data: 'subject_chemistry' },
        { text: '🧬 Биология', callback_data: 'subject_biology' }
      ]
    ]
  };

  await bot.sendMessage(chatId, 
    '📚 Выбери новый предмет:',
    { reply_markup: keyboard }
  );
});

// Демо AI ответы (в продакшне будет реальный Claude API)
function getAIResponse(question, subject) {
  const responses = {
    'Математика': [
      'Отличный вопрос! Давай разберём это пошагово. Что у нас дано в условии?',
      'Хорошо! Для решения этой задачи нам понадобится... Какую формулу мы можем использовать?',
      'Давай подумаем вместе! Что нам нужно найти в этой задаче?'
    ],
    'Русский язык': [
      'Хороший вопрос! Это правило легко запомнить. Давай разберём примеры.',
      'Отлично! Попробуем разобрать это на конкретных примерах. Составь предложение!',
      'Интересный вопрос! Эту тему легко понять, если знать один секрет...'
    ],
    'Английский язык': [
      'Great question! Let me explain this in a simple way... (Отличный вопрос! Объясню просто...)',
      'Good! Давай разберём это правило на примерах.',
      'Excellent! This is an important topic. Let\'s practice together!'
    ]
  };
  
  const subjectResponses = responses[subject] || [
    'Отличный вопрос! Давай разберёмся вместе.',
    'Хорошо! Это интересная тема. Начнём с основ.',
    'Понял! Сейчас объясню простым языком.'
  ];
  
  return subjectResponses[Math.floor(Math.random() * subjectResponses.length)];
}

// Обработка ошибок
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

process.on('SIGINT', () => {
  console.log('\n👋 Бот остановлен');
  bot.stopPolling();
  process.exit();
});
