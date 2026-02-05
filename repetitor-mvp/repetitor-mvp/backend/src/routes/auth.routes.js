// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

const prisma = new PrismaClient();

// Get JWT_SECRET from middleware (already validated)
const { JWT_SECRET } = require('../middleware/auth.middleware');

// Bcrypt rounds - configurable via environment, default 12 for better security
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');

// Strict rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  skipSuccessfulRequests: true,
  message: { error: 'Слишком много попыток. Попробуйте через 15 минут.' }
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 registrations per hour
  message: { error: 'Слишком много регистраций. Попробуйте позже.' }
});

// POST /api/auth/register - Регистрация
router.post('/register',
  registerLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6, max: 128 }),
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

      // Хешировать пароль with configurable rounds
      const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

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
        JWT_SECRET,
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
      if (process.env.NODE_ENV === 'development') {
        console.error('Registration Error:', error);
      }
      res.status(500).json({ error: 'Не удалось зарегистрироваться' });
    }
  }
);

// POST /api/auth/login - Вход
router.post('/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').exists().isLength({ max: 128 })
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
        JWT_SECRET,
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
      if (process.env.NODE_ENV === 'development') {
        console.error('Login Error:', error);
      }
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

    const payload = jwt.verify(token, JWT_SECRET);

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
    if (process.env.NODE_ENV === 'development') {
      console.error('Auth Error:', error);
    }
    res.status(401).json({ error: 'Не авторизован' });
  }
});

module.exports = router;
