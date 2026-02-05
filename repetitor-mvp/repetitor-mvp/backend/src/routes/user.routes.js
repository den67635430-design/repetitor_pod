// src/routes/user.routes.js
// GDPR-compliant user data management endpoints

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth.middleware');

const prisma = new PrismaClient();

// GET /api/user/export-data - Export all user data (GDPR Article 20)
router.get('/export-data', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all user data
    const [
      user,
      profile,
      subscription,
      children,
      parent,
      aiInteractions,
      supportMessages,
      progress,
      tokenUsage,
      achievements,
      stats
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          telegramId: true,
          telegramUsername: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.profile.findUnique({ where: { userId } }),
      prisma.subscription.findUnique({ where: { userId } }),
      prisma.child.findMany({ where: { parentId: userId } }),
      prisma.parent.findUnique({ where: { userId } }),
      prisma.aIInteraction.findMany({ 
        where: { userId },
        orderBy: { timestamp: 'desc' }
      }),
      prisma.supportMessage.findMany({ 
        where: { userId },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.progress.findMany({ 
        where: { userId },
        include: { lesson: { include: { subject: true } } }
      }),
      prisma.tokenUsage.findMany({ 
        where: { userId },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.userAchievement.findMany({
        where: { userId },
        include: { achievement: true }
      }),
      prisma.userStats.findUnique({ where: { userId } })
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      user,
      profile,
      subscription,
      children,
      parent,
      aiInteractions,
      supportMessages,
      progress,
      tokenUsage,
      achievements,
      stats
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="user-data-${userId}-${Date.now()}.json"`);
    res.json(exportData);

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Export Data Error:', error);
    }
    res.status(500).json({ error: 'Не удалось экспортировать данные' });
  }
});

// DELETE /api/user/account - Delete user account and all data (GDPR Article 17)
router.delete('/account', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete in order to respect foreign key constraints
    // Most tables have onDelete: Cascade, but we'll be explicit
    await prisma.$transaction(async (tx) => {
      // Delete user achievements
      await tx.userAchievement.deleteMany({ where: { userId } });
      
      // Delete user stats
      await tx.userStats.deleteMany({ where: { userId } });
      
      // Delete token usage
      await tx.tokenUsage.deleteMany({ where: { userId } });
      await tx.monthlyTokenQuota.deleteMany({ where: { userId } });
      
      // Delete AI interactions
      await tx.aIInteraction.deleteMany({ where: { userId } });
      
      // Delete support data
      await tx.supportMessage.deleteMany({ where: { userId } });
      await tx.supportTicket.updateMany({
        where: { userId },
        data: {
          userName: '[Deleted]',
          userEmail: '[Deleted]',
          problem: '[User data deleted per GDPR request]',
          conversationHistory: {}
        }
      });
      
      // Delete progress
      await tx.progress.deleteMany({ where: { userId } });
      
      // Delete children links
      await tx.child.deleteMany({ where: { parentId: userId } });
      
      // Delete parent config
      await tx.parent.deleteMany({ where: { userId } });
      
      // Delete profile
      await tx.profile.deleteMany({ where: { userId } });
      
      // Delete subscription
      await tx.subscription.deleteMany({ where: { userId } });
      
      // Finally delete the user
      await tx.user.delete({ where: { id: userId } });
    });

    res.json({ 
      success: true, 
      message: 'Аккаунт и все данные удалены' 
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Delete Account Error:', error);
    }
    res.status(500).json({ error: 'Не удалось удалить аккаунт' });
  }
});

// GET /api/user/privacy-status - Get privacy and monitoring status
router.get('/privacy-status', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = req.user;

    let monitoringStatus = null;

    if (user.role === 'STUDENT') {
      // Check if this student is being monitored by any parent
      const childLink = await prisma.child.findFirst({
        where: { userId },
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

      if (childLink) {
        monitoringStatus = {
          isMonitored: true,
          linkedAt: childLink.createdAt,
          parent: {
            name: childLink.parent.name,
            email: childLink.parent.email
          },
          consentStatus: childLink.consentStatus || 'PENDING',
          dataShared: [
            'Активность обучения',
            'Взаимодействия с AI репетитором',
            'Прогресс по предметам',
            'Время, проведённое в обучении'
          ]
        };
      } else {
        monitoringStatus = {
          isMonitored: false
        };
      }
    }

    res.json({
      userId,
      role: user.role,
      monitoringStatus,
      dataRetention: {
        aiConversations: '90 дней',
        supportMessages: '90 дней',
        progressData: 'До удаления аккаунта'
      },
      rights: {
        exportData: '/api/user/export-data',
        deleteAccount: '/api/user/account'
      }
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Privacy Status Error:', error);
    }
    res.status(500).json({ error: 'Не удалось получить статус' });
  }
});

module.exports = router;
