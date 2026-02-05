// src/jobs/data-retention.job.js
// GDPR-compliant data retention job - deletes old data after 90 days

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Default retention period: 90 days
const RETENTION_DAYS = parseInt(process.env.DATA_RETENTION_DAYS || '90');

async function runDataRetentionJob() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

  console.log(`[Data Retention] Starting cleanup for data older than ${RETENTION_DAYS} days (before ${cutoffDate.toISOString()})`);

  try {
    // Delete old AI interactions
    const deletedInteractions = await prisma.aIInteraction.deleteMany({
      where: {
        timestamp: { lt: cutoffDate }
      }
    });
    console.log(`[Data Retention] Deleted ${deletedInteractions.count} old AI interactions`);

    // Delete old support messages (keep escalated ones longer)
    const deletedMessages = await prisma.supportMessage.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        escalated: false
      }
    });
    console.log(`[Data Retention] Deleted ${deletedMessages.count} old support messages`);

    // Delete old token usage records
    const deletedTokenUsage = await prisma.tokenUsage.deleteMany({
      where: {
        createdAt: { lt: cutoffDate }
      }
    });
    console.log(`[Data Retention] Deleted ${deletedTokenUsage.count} old token usage records`);

    // Anonymize old support tickets (keep for analytics but remove PII)
    const oldTicketsDate = new Date();
    oldTicketsDate.setDate(oldTicketsDate.getDate() - (RETENTION_DAYS * 2)); // 180 days for tickets

    const anonymizedTickets = await prisma.supportTicket.updateMany({
      where: {
        createdAt: { lt: oldTicketsDate },
        status: { in: ['RESOLVED', 'CLOSED'] }
      },
      data: {
        userName: '[Anonymized]',
        userEmail: '[Anonymized]',
        problem: '[Data anonymized per retention policy]',
        conversationHistory: {}
      }
    });
    console.log(`[Data Retention] Anonymized ${anonymizedTickets.count} old support tickets`);

    console.log('[Data Retention] Cleanup completed successfully');

    return {
      deletedInteractions: deletedInteractions.count,
      deletedMessages: deletedMessages.count,
      deletedTokenUsage: deletedTokenUsage.count,
      anonymizedTickets: anonymizedTickets.count
    };

  } catch (error) {
    console.error('[Data Retention] Error during cleanup:', error);
    throw error;
  }
}

// Run as standalone script or export for cron
if (require.main === module) {
  runDataRetentionJob()
    .then(result => {
      console.log('[Data Retention] Results:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('[Data Retention] Failed:', error);
      process.exit(1);
    });
}

module.exports = { runDataRetentionJob, RETENTION_DAYS };
