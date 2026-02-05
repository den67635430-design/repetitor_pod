// src/routes/parent.routes.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth.middleware');
const { param, body, validationResult } = require('express-validator');

const prisma = new PrismaClient();

// GET /api/parent/children - Получить список детей
router.get('/children', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'PARENT') {
      return res.status(403).json({ error: 'Доступно только для родителей' });
    }

    const children = await prisma.child.findMany({
      where: { parentId: req.user.id },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({ children });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Children Error:', error);
    }
    res.status(500).json({ error: 'Не удалось загрузить детей' });
  }
});

// GET /api/parent/activity/:childId - Получить активность ребёнка
router.get('/activity/:childId',
  authenticate,
  param('childId').isUUID().withMessage('Invalid childId format'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (req.user.role !== 'PARENT') {
        return res.status(403).json({ error: 'Доступно только для родителей' });
      }

      const { childId } = req.params;

      // Проверить что это ребёнок этого родителя
      const child = await prisma.child.findFirst({
        where: {
          userId: childId,
          parentId: req.user.id
        }
      });

      if (!child) {
        return res.status(404).json({ error: 'Ребёнок не найден' });
      }

      // Получить активность за последние 30 дней
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const interactions = await prisma.aIInteraction.findMany({
        where: {
          userId: childId,
          timestamp: { gte: thirtyDaysAgo }
        },
        orderBy: { timestamp: 'desc' }
      });

      const progress = await prisma.progress.findMany({
        where: { userId: childId },
        include: {
          lesson: {
            include: {
              subject: true
            }
          }
        }
      });

      // Статистика
      const totalTime = interactions.reduce((sum, int) => sum + (int.timeSpent || 0), 0);
      const subjectsStudied = [...new Set(interactions.map(int => int.subject))];

      res.json({
        child: {
          id: child.userId,
          name: child.name,
          grade: child.grade
        },
        stats: {
          totalInteractions: interactions.length,
          totalTime: totalTime,
          subjectsStudied: subjectsStudied.length,
          subjects: subjectsStudied
        },
        recentActivity: interactions.slice(0, 20),
        progress
      });

    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Activity Error:', error);
      }
      res.status(500).json({ error: 'Не удалось загрузить активность' });
    }
  }
);

// POST /api/parent/link-child - Привязать ребёнка
router.post('/link-child',
  authenticate,
  [
    body('childUserId').isUUID().withMessage('Invalid childUserId format'),
    body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
    body('grade').isInt({ min: 1, max: 11 }).withMessage('Grade must be between 1 and 11')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (req.user.role !== 'PARENT') {
        return res.status(403).json({ error: 'Доступно только для родителей' });
      }

      const { childUserId, name, grade } = req.body;

      // Verify that childUserId exists and is a STUDENT
      const childUser = await prisma.user.findUnique({
        where: { id: childUserId }
      });

      if (!childUser) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      if (childUser.role !== 'STUDENT') {
        return res.status(400).json({ error: 'Можно привязать только ученика' });
      }

      // Check if already linked
      const existingLink = await prisma.child.findFirst({
        where: {
          parentId: req.user.id,
          userId: childUserId
        }
      });

      if (existingLink) {
        return res.status(409).json({ error: 'Ребёнок уже привязан' });
      }

      // Создать связь с pending consent
      const child = await prisma.child.create({
        data: {
          parentId: req.user.id,
          userId: childUserId,
          name,
          grade,
          consentStatus: 'PENDING',
          childNotified: true,
          notifiedAt: new Date()
        }
      });

      // TODO: Send notification to child about monitoring request
      // This would integrate with your notification system

      res.status(201).json({ 
        child,
        message: 'Запрос на привязку отправлен. Ребёнок должен подтвердить.'
      });

    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Link Child Error:', error);
      }
      res.status(500).json({ error: 'Не удалось привязать ребёнка' });
    }
  }
);

// POST /api/parent/consent/:childId - Child responds to monitoring request
router.post('/consent/:childId',
  authenticate,
  [
    param('childId').isUUID().withMessage('Invalid childId format'),
    body('consent').isIn(['approve', 'decline']).withMessage('Consent must be approve or decline')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { childId } = req.params;
      const { consent } = req.body;
      const userId = req.user.id;

      // Verify this is the child being linked
      const childLink = await prisma.child.findFirst({
        where: {
          userId: childId,
          consentStatus: 'PENDING'
        }
      });

      if (!childLink) {
        return res.status(404).json({ error: 'Запрос на привязку не найден' });
      }

      // Verify the authenticated user is the child
      if (userId !== childId) {
        return res.status(403).json({ error: 'Только ребёнок может подтвердить запрос' });
      }

      if (consent === 'approve') {
        await prisma.child.update({
          where: { id: childLink.id },
          data: {
            consentStatus: 'APPROVED',
            consentedAt: new Date()
          }
        });
        res.json({ message: 'Мониторинг одобрен' });
      } else {
        await prisma.child.delete({
          where: { id: childLink.id }
        });
        res.json({ message: 'Запрос на мониторинг отклонён' });
      }

    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Consent Error:', error);
      }
      res.status(500).json({ error: 'Не удалось обработать согласие' });
    }
  }
);

// GET /api/parent/pending-consents - Get pending consent requests for a child
router.get('/pending-consents', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find pending link requests where this user is the child
    const pendingRequests = await prisma.child.findMany({
      where: {
        userId,
        consentStatus: 'PENDING'
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({ 
      pendingRequests: pendingRequests.map(r => ({
        id: r.id,
        parentName: r.parent.name,
        parentEmail: r.parent.email,
        requestedAt: r.createdAt,
        dataShared: [
          'Активность обучения',
          'Взаимодействия с AI репетитором',
          'Прогресс по предметам'
        ]
      }))
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Pending Consents Error:', error);
    }
    res.status(500).json({ error: 'Не удалось загрузить запросы' });
  }
});

module.exports = router;