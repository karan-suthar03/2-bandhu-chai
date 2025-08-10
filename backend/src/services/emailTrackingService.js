import prisma from '../config/prisma.js';

class EmailTrackingService {

    async createEmailLog(emailData) {
        const {
            type,
            recipient,
            subject,
            orderId = null,
            metadata = {}
        } = emailData;

        try {
            const emailLog = await prisma.emailLog.create({
                data: {
                    type,
                    recipient,
                    subject,
                    orderId,
                    metadata,
                    status: 'PENDING',
                    attempts: 0
                }
            });

            console.log(`📧 Email log created: ID ${emailLog.id} for ${recipient}`);
            return emailLog;
        } catch (error) {
            console.error('❌ Failed to create email log:', error.message);
            throw error;
        }
    }

    async markEmailSent(emailLogId, messageId) {
        try {
            const emailLog = await prisma.emailLog.update({
                where: { id: emailLogId },
                data: {
                    status: 'SENT',
                    messageId,
                    sentAt: new Date(),
                    attempts: { increment: 1 },
                    lastAttempt: new Date()
                }
            });

            console.log(`✅ Email marked as sent: ID ${emailLogId}, MessageID: ${messageId}`);
            return emailLog;
        } catch (error) {
            console.error('❌ Failed to update email log as sent:', error.message);
            throw error;
        }
    }

    async markEmailFailed(emailLogId, errorMessage) {
        try {
            const emailLog = await prisma.emailLog.update({
                where: { id: emailLogId },
                data: {
                    status: 'FAILED',
                    errorMessage,
                    failedAt: new Date(),
                    attempts: { increment: 1 },
                    lastAttempt: new Date()
                }
            });

            console.log(`❌ Email marked as failed: ID ${emailLogId}, Error: ${errorMessage}`);
            return emailLog;
        } catch (error) {
            console.error('❌ Failed to update email log as failed:', error.message);
            throw error;
        }
    }

    async incrementAttempt(emailLogId) {
        try {
            const emailLog = await prisma.emailLog.update({
                where: { id: emailLogId },
                data: {
                    attempts: { increment: 1 },
                    lastAttempt: new Date()
                }
            });

            console.log(`🔄 Email attempt incremented: ID ${emailLogId}, Attempt: ${emailLog.attempts}`);
            return emailLog;
        } catch (error) {
            console.error('❌ Failed to increment email attempt:', error.message);
            throw error;
        }
    }

    async getOrderEmailLogs(orderId) {
        try {
            const emailLogs = await prisma.emailLog.findMany({
                where: { orderId },
                orderBy: { createdAt: 'desc' }
            });

            return emailLogs;
        } catch (error) {
            console.error('❌ Failed to get order email logs:', error.message);
            throw error;
        }
    }

    async getEmailStats(filters = {}) {
        try {
            const { 
                startDate,
                endDate,
                type,
                status
            } = filters;

            const whereClause = {};
            
            if (startDate || endDate) {
                whereClause.createdAt = {};
                if (startDate) whereClause.createdAt.gte = new Date(startDate);
                if (endDate) whereClause.createdAt.lte = new Date(endDate);
            }
            
            if (type) whereClause.type = type;
            if (status) whereClause.status = status;

            const [
                total,
                sent,
                failed,
                pending
            ] = await Promise.all([
                prisma.emailLog.count({ where: whereClause }),
                prisma.emailLog.count({ where: { ...whereClause, status: 'SENT' } }),
                prisma.emailLog.count({ where: { ...whereClause, status: 'FAILED' } }),
                prisma.emailLog.count({ where: { ...whereClause, status: 'PENDING' } })
            ]);

            const stats = {
                total,
                sent,
                failed,
                pending,
                successRate: total > 0 ? (sent / total * 100).toFixed(2) : 0,
                failureRate: total > 0 ? (failed / total * 100).toFixed(2) : 0
            };

            return stats;
        } catch (error) {
            console.error('❌ Failed to get email stats:', error.message);
            throw error;
        }
    }

    async getFailedEmailsForRetry(maxAttempts = 3) {
        try {
            const failedEmails = await prisma.emailLog.findMany({
                where: {
                    status: 'FAILED',
                    attempts: { lt: maxAttempts }
                },
                orderBy: { lastAttempt: 'asc' },
                take: 10
            });

            return failedEmails;
        } catch (error) {
            console.error('❌ Failed to get failed emails for retry:', error.message);
            throw error;
        }
    }

    async cleanupOldLogs(daysToKeep = 90) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

            const result = await prisma.emailLog.deleteMany({
                where: {
                    createdAt: { lt: cutoffDate },
                    status: { in: ['SENT', 'FAILED'] }
                }
            });

            console.log(`🧹 Cleaned up ${result.count} old email logs older than ${daysToKeep} days`);
            return result.count;
        } catch (error) {
            console.error('❌ Failed to cleanup old email logs:', error.message);
            throw error;
        }
    }
}

const emailTrackingService = new EmailTrackingService();
export default emailTrackingService;