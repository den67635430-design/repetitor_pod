// src/routes/support.routes.js
const express = require('express');
const router = express.Router();
const supportService = require('../services/support.service');
const { authenticate } = require('../middleware/auth.middleware');
const { body, validationResult } = require('express-validator');

// POST /api/support/message - Отправить сообщение в поддержку
router.post('/message',
  authenticate,
  [
    body('message').trim().isLength({ min: 1, max: 2000 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { message } = req.body;
      const userId = req.user.id;

      // Получить историю поддержки
      const conversationHistory = await supportService.getSupportHistory(userId);

      // Обработать запрос
      const result = await supportService.handleSupportRequest({
        userId,
        message,
        conversationHistory: conversationHistory.reverse()
      });

      res.json({
        response: result.response,
        resolved: result.resolved,
        escalated: result.escalated
      });

    } catch (error) {
      console.error('Support Error:', error);
      res.status(500).json({ error: 'Не удалось обработать запрос' });
    }
  }
);

// GET /api/support/history - Получить историю поддержки
router.get('/history', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await supportService.getSupportHistory(userId, 50);

    res.json({ history });

  } catch (error) {
    console.error('Support History Error:', error);
    res.status(500).json({ error: 'Не удалось загрузить историю' });
  }
});

// GET /api/support/tickets - Получить тикеты пользователя
router.get('/tickets', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const tickets = await prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ tickets });

  } catch (error) {
    console.error('Tickets Error:', error);
    res.status(500).json({ error: 'Не удалось загрузить тикеты' });
  }
});

module.exports = router;
