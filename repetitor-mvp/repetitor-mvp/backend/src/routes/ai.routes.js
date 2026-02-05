// src/routes/ai.routes.js
const express = require('express');
const router = express.Router();
const aiService = require('../services/ai.service');
const { authenticate } = require('../middleware/auth.middleware');
const { body, param, validationResult } = require('express-validator');

// Valid subjects list
const VALID_SUBJECTS = ['math', 'russian', 'english', 'physics', 'chemistry', 'biology', 'history', 'literature', 'french'];

// POST /api/ai/chat - Отправить сообщение AI-репетитору
router.post('/chat',
  authenticate,
  [
    body('message').trim().isLength({ min: 1, max: 2000 }),
    body('subject').isString().isIn(VALID_SUBJECTS).withMessage('Invalid subject'),
    body('grade').isInt({ min: 0, max: 11 }),
    body('outputMode').isIn(['voice', 'text', 'both']).optional()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { message, subject, grade, outputMode = 'text' } = req.body;
      const userId = req.user.id;

      // Получить историю разговора (последние 10 сообщений)
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      const recentInteractions = await prisma.aIInteraction.findMany({
        where: { 
          userId,
          subject
        },
        orderBy: { timestamp: 'desc' },
        take: 10
      });

      const conversationHistory = recentInteractions.reverse().flatMap(interaction => [
        { role: 'user', content: interaction.userMessage },
        { role: 'assistant', content: interaction.aiResponse }
      ]);

      // Получить ответ от AI
      const response = await aiService.chat({
        message,
        subject,
        grade,
        userId,
        conversationHistory,
        outputMode
      });

      res.json({
        text: response.text,
        confidence: response.confidence,
        needsReview: response.needsReview
      });

    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('AI Chat Error:', error);
      }
      res.status(500).json({ error: 'Не удалось получить ответ от AI' });
    }
  }
);

// GET /api/ai/subjects - Получить список предметов
router.get('/subjects', async (req, res) => {
  const subjects = [
    { id: 'math', name: 'Математика', icon: '📐' },
    { id: 'russian', name: 'Русский язык', icon: '📖' },
    { id: 'english', name: 'Английский язык', icon: '🇬🇧' },
    { id: 'physics', name: 'Физика', icon: '⚡' },
    { id: 'chemistry', name: 'Химия', icon: '🧪' },
    { id: 'biology', name: 'Биология', icon: '🧬' },
    { id: 'history', name: 'История', icon: '🌍' },
    { id: 'literature', name: 'Литература', icon: '📚' },
    { id: 'french', name: 'Французский язык', icon: '🇫🇷' }
  ];

  res.json({ subjects });
});

// GET /api/ai/history/:subject - Получить историю по предмету
router.get('/history/:subject',
  authenticate,
  param('subject').isIn(VALID_SUBJECTS).withMessage('Invalid subject'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { subject } = req.params;
      const userId = req.user.id;

      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const history = await prisma.aIInteraction.findMany({
        where: {
          userId,
          subject
        },
        orderBy: { timestamp: 'desc' },
        take: 50
      });

      res.json({ history });

    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('History Error:', error);
      }
      res.status(500).json({ error: 'Не удалось загрузить историю' });
    }
  }
);

module.exports = router;
