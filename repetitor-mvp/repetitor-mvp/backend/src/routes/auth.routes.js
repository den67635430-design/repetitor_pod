// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');

const prisma = new PrismaClient();

// POST /api/auth/register - Регистрация
router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().isLength({ min: 2, max: 100 }),
    body('role').isIn(['STUDENT', 'PARENT']).optional()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, name, role = 'STUDENT' } = req.body;

      // Проверить существование пользователя
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Email уже используется' });
      }

      // Хешировать пароль
      const passwordHash = await bcrypt.hash(password, 10);

      // Создать пользователя
      const user = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash,
          role,
          profile: {
            create: {
              grade: role === 'STUDENT' ? 1 : null
            }
          },
          subscription: {
            create: {
              plan: 'FREE',
              status: 'TRIAL',
              startDate: new Date(),
              endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 дней
              trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
          }
        },
        include: {
          profile: true,
          subscription: true
        }
      });

      // Создать токен
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '30d' }
      );

      res.status(201).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          profile: user.profile,
          subscription: user.subscription
        }
      });

    } catch (error) {
      console.error('Registration Error:', error);
      res.status(500).json({ error: 'Не удалось зарегистрироваться' });
    }
  }
);

// POST /api/auth/login - Вход
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').exists()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Найти пользователя
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          profile: true,
          subscription: true
        }
      });

      if (!user) {
        return res.status(401).json({ error: 'Неверный email или пароль' });
      }

      // Проверить пароль
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Неверный email или пароль' });
      }

      // Создать токен
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '30d' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          profile: user.profile,
          subscription: user.subscription
        }
      });

    } catch (error) {
      console.error('Login Error:', error);
      res.status(500).json({ error: 'Не удалось войти' });
    }
  }
);

// GET /api/auth/me - Получить текущего пользователя
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        profile: true,
        subscription: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Пользователь не найден' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profile: user.profile,
        subscription: user.subscription
      }
    });

  } catch (error) {
    console.error('Auth Error:', error);
    res.status(401).json({ error: 'Не авторизован' });
  }
});

module.exports = router;
