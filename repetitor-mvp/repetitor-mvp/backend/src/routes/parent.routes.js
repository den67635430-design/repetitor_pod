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

      // Создать связь
      const child = await prisma.child.create({
        data: {
          parentId: req.user.id,
          userId: childUserId,
          name,
          grade
        }
      });

      res.status(201).json({ child });

    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Link Child Error:', error);
      }
      res.status(500).json({ error: 'Не удалось привязать ребёнка' });
    }
  }
);

module.exports = router;