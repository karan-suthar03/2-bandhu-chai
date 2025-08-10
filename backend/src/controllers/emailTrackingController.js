import emailTrackingService from '../services/emailTrackingService.js';
import { sendSuccess, sendBadRequest, sendNotFound, createPaginatedResponse, sendResponse } from '../utils/responseUtils.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import prisma from '../config/prisma.js';

const getEmailStats = asyncHandler(async (req, res) => {
    const { 
        startDate, 
        endDate, 
        type, 
        status 
    } = req.query;

    const filters = {};
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (type) filters.type = type;
    if (status) filters.status = status;

    const stats = await emailTrackingService.getEmailStats(filters);
    
    return sendSuccess(res, { 
        stats,
        filters 
    }, 'Email statistics retrieved successfully');
});

const getEmailLogs = asyncHandler(async (req, res) => {
    const { 
        page = 1, 
        limit = 50,
        type,
        status,
        orderId,
        recipient,
        _sort,
        _order = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const whereClause = {};
    if (type) whereClause.type = type;
    if (status) whereClause.status = status;
    if (orderId) whereClause.orderId = orderId;
    if (recipient) whereClause.recipient = { contains: recipient, mode: 'insensitive' };

    let orderBy = { createdAt: 'desc' };
    if (_sort) {
        const fieldMapping = {
            'id': 'id',
            'type': 'type',
            'sender': 'sender',
            'recipient': 'recipient',
            'subject': 'subject',
            'status': 'status',
            'orderId': 'orderId',
            'attempts': 'attempts',
            'errorMessage': 'errorMessage',
            'sentAt': 'sentAt',
            'createdAt': 'createdAt'
        };
        
        const mappedField = fieldMapping[_sort] || 'createdAt';
        orderBy = { [mappedField]: _order.toLowerCase() === 'asc' ? 'asc' : 'desc' };
    }

    const [emailLogs, total] = await Promise.all([
        prisma.emailLog.findMany({
            where: whereClause,
            include: {
                order: {
                    select: {
                        id: true,
                        customerName: true,
                        status: true,
                        finalTotal: true
                    }
                }
            },
            orderBy,
            skip,
            take: parseInt(limit)
        }),
        prisma.emailLog.count({ where: whereClause })
    ]);

    const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total
    };

    return sendResponse(res, 200, createPaginatedResponse(emailLogs, pagination));
});

const getOrderEmailLogs = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const emailLogs = await emailTrackingService.getOrderEmailLogs(orderId);
    
    return sendSuccess(res, { 
        emailLogs,
        orderId 
    }, 'Order email logs retrieved successfully');
});

const retryFailedEmails = asyncHandler(async (req, res) => {
    const { maxAttempts = 3 } = req.body;

    const failedEmails = await emailTrackingService.getFailedEmailsForRetry(maxAttempts);
    
    if (failedEmails.length === 0) {
        return sendSuccess(res, { 
            retriedCount: 0 
        }, 'No failed emails to retry');
    }

    let retriedCount = 0;
    const results = [];
    const { default: emailService } = await import('./emailService.js');

    for (const emailLog of failedEmails) {
        try {
            const mailOptions = {
                to: emailLog.recipient,
                subject: emailLog.subject,
            };

            const trackingData = {
                type: emailLog.type,
                recipient: emailLog.recipient,
                subject: emailLog.subject,
                orderId: emailLog.orderId,
                metadata: emailLog.metadata
            };

            await emailService.sendEmail(mailOptions, 1, trackingData);
            retriedCount++;
            results.push({
                emailLogId: emailLog.id,
                status: 'success'
            });
        } catch (error) {
            results.push({
                emailLogId: emailLog.id,
                status: 'failed',
                error: error.message
            });
        }
    }

    return sendSuccess(res, {
        retriedCount,
        totalAttempted: failedEmails.length,
        results
    }, `Retried ${retriedCount} out of ${failedEmails.length} failed emails`);
});

const cleanupEmailLogs = asyncHandler(async (req, res) => {
    const { daysToKeep = 90 } = req.body;

    const deletedCount = await emailTrackingService.cleanupOldLogs(daysToKeep);
    
    return sendSuccess(res, { 
        deletedCount,
        daysToKeep 
    }, `Cleaned up ${deletedCount} old email logs`);
});

const getEmailInsights = asyncHandler(async (req, res) => {
    const { period = '7' } = req.query; // days
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const typeStats = await Promise.all([
        'ORDER_CONFIRMATION',
        'ORDER_STATUS_UPDATE', 
        'ORDER_CANCELLATION',
        'CONTACT_FORM'
    ].map(async (type) => {
        const stats = await emailTrackingService.getEmailStats({
            startDate: startDate.toISOString(),
            type
        });
        return { type, ...stats };
    }));
    const dailyStats = [];
    for (let i = 0; i < parseInt(period); i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));

        const dayStats = await emailTrackingService.getEmailStats({
            startDate: startOfDay.toISOString(),
            endDate: endOfDay.toISOString()
        });

        dailyStats.unshift({
            date: startOfDay.toISOString().split('T')[0],
            ...dayStats
        });
    }

    const totalStats = await emailTrackingService.getEmailStats({
        startDate: startDate.toISOString()
    });

    return sendSuccess(res, {
        period: parseInt(period),
        totalStats,
        typeStats,
        dailyStats
    }, 'Email insights retrieved successfully');
});

export {
    getEmailStats,
    getEmailLogs,
    getOrderEmailLogs,
    retryFailedEmails,
    cleanupEmailLogs,
    getEmailInsights
};
