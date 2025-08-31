"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const logger_1 = require("../utils/logger");
const mastercard_api_service_1 = require("../services/mastercard-api.service");
const client_1 = require("@prisma/client");
const error_middleware_1 = require("../middleware/error.middleware");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.post('/mastercard', (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const signature = req.headers['x-mastercard-signature'];
    const payload = JSON.stringify(req.body);
    if (!mastercard_api_service_1.mastercardApiService.validateWebhookSignature(payload, signature)) {
        logger_1.logger.error('Invalid webhook signature received');
        return res.status(401).json({ error: 'Invalid signature' });
    }
    try {
        const { eventType, data } = req.body;
        await prisma.webhookEvent.create({
            data: {
                eventType,
                payload: req.body
            }
        });
        logger_1.logger.info(`Received webhook event: ${eventType}`);
        switch (eventType) {
            case 'account.balance.updated':
                await handleBalanceUpdate(data);
                break;
            case 'transaction.created':
                await handleTransactionCreated(data);
                break;
            case 'account.connected':
                await handleAccountConnected(data);
                break;
            case 'account.disconnected':
                await handleAccountDisconnected(data);
                break;
            default:
                logger_1.logger.warn(`Unhandled webhook event type: ${eventType}`);
        }
        return res.status(200).json({ status: 'success' });
    }
    catch (error) {
        logger_1.logger.error('Error processing webhook:', error);
        return res.status(500).json({ error: 'Webhook processing failed' });
    }
}));
async function handleBalanceUpdate(data) {
    try {
        const { accountId, balance, currency } = data;
        await prisma.connectedAccount.updateMany({
            where: { accountId },
            data: {
                balance,
                currency,
                lastSyncAt: new Date()
            }
        });
        logger_1.logger.info(`Updated balance for account ${accountId}: ${balance} ${currency}`);
    }
    catch (error) {
        logger_1.logger.error('Error handling balance update:', error);
    }
}
async function handleTransactionCreated(data) {
    try {
        const { accountId, transaction } = data;
        const connectedAccount = await prisma.connectedAccount.findFirst({
            where: { accountId }
        });
        if (!connectedAccount) {
            logger_1.logger.warn(`Connected account not found for transaction: ${accountId}`);
            return;
        }
        const existingTransaction = await prisma.transaction.findFirst({
            where: {
                transactionId: transaction.transactionId,
                connectedAccountId: connectedAccount.id
            }
        });
        if (!existingTransaction) {
            await prisma.transaction.create({
                data: {
                    userId: connectedAccount.userId,
                    connectedAccountId: connectedAccount.id,
                    transactionId: transaction.transactionId,
                    description: transaction.description,
                    amount: transaction.amount,
                    currency: transaction.currency,
                    category: transaction.category,
                    transactionType: transaction.type,
                    date: new Date(transaction.date),
                    isImported: true,
                    metadata: transaction.metadata
                }
            });
            logger_1.logger.info(`Created new transaction ${transaction.transactionId} for account ${accountId}`);
        }
    }
    catch (error) {
        logger_1.logger.error('Error handling transaction created:', error);
    }
}
async function handleAccountConnected(data) {
    try {
        const { accountId, userId } = data;
        logger_1.logger.info(`Account ${accountId} connected for user ${userId}`);
    }
    catch (error) {
        logger_1.logger.error('Error handling account connected:', error);
    }
}
async function handleAccountDisconnected(data) {
    try {
        const { accountId, userId } = data;
        await prisma.connectedAccount.updateMany({
            where: { accountId, userId },
            data: { status: 'INACTIVE' }
        });
        logger_1.logger.info(`Account ${accountId} disconnected for user ${userId}`);
    }
    catch (error) {
        logger_1.logger.error('Error handling account disconnected:', error);
    }
}
router.get('/events', (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { limit = '50', processed } = req.query;
    const where = {};
    if (processed !== undefined) {
        where.processed = processed === 'true';
    }
    const events = await prisma.webhookEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit)
    });
    return res.json({
        events: events.map(event => ({
            ...event,
            createdAt: event.createdAt.toISOString()
        }))
    });
}));
router.patch('/events/:eventId/processed', (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { eventId } = req.params;
    await prisma.webhookEvent.update({
        where: { id: eventId },
        data: { processed: true }
    });
    return res.json({ message: 'Event marked as processed' });
}));
exports.default = router;
//# sourceMappingURL=webhooks.routes.js.map