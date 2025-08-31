import { Router } from 'express';
import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { mastercardApiService } from '../services/mastercard-api.service';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();
const prisma = new PrismaClient();

/**
 * Handle incoming webhook events from Mastercard Open Banking
 */
router.post('/mastercard', asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers['x-mastercard-signature'] as string;
  const payload = JSON.stringify(req.body);

  // Validate webhook signature
  if (!mastercardApiService.validateWebhookSignature(payload, signature)) {
    logger.error('Invalid webhook signature received');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  try {
    const { eventType, data } = req.body;

    // Store webhook event
    await prisma.webhookEvent.create({
      data: {
        eventType,
        payload: req.body
      }
    });

    logger.info(`Received webhook event: ${eventType}`);

    // Handle different event types
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
        logger.warn(`Unhandled webhook event type: ${eventType}`);
    }

    return res.status(200).json({ status: 'success' });
  } catch (error) {
    logger.error('Error processing webhook:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}));

/**
 * Handle balance update events
 */
async function handleBalanceUpdate(data: any) {
  try {
    const { accountId, balance, currency } = data;
    
    // Find connected account and update balance
    await prisma.connectedAccount.updateMany({
      where: { accountId },
      data: {
        balance,
        currency,
        lastSyncAt: new Date()
      }
    });

    logger.info(`Updated balance for account ${accountId}: ${balance} ${currency}`);
  } catch (error) {
    logger.error('Error handling balance update:', error);
  }
}

/**
 * Handle new transaction events
 */
async function handleTransactionCreated(data: any) {
  try {
    const { accountId, transaction } = data;
    
    // Find connected account
    const connectedAccount = await prisma.connectedAccount.findFirst({
      where: { accountId }
    });

    if (!connectedAccount) {
      logger.warn(`Connected account not found for transaction: ${accountId}`);
      return;
    }

    // Check if transaction already exists
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        transactionId: transaction.transactionId,
        connectedAccountId: connectedAccount.id
      }
    });

    if (!existingTransaction) {
      // Create new transaction
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

      logger.info(`Created new transaction ${transaction.transactionId} for account ${accountId}`);
    }
  } catch (error) {
    logger.error('Error handling transaction created:', error);
  }
}

/**
 * Handle account connected events
 */
async function handleAccountConnected(data: any) {
  try {
    const { accountId, userId } = data;
    
    logger.info(`Account ${accountId} connected for user ${userId}`);
    // Additional logic for account connection can be added here
  } catch (error) {
    logger.error('Error handling account connected:', error);
  }
}

/**
 * Handle account disconnected events
 */
async function handleAccountDisconnected(data: any) {
  try {
    const { accountId, userId } = data;
    
    // Mark account as inactive
    await prisma.connectedAccount.updateMany({
      where: { accountId, userId },
      data: { status: 'INACTIVE' }
    });

    logger.info(`Account ${accountId} disconnected for user ${userId}`);
  } catch (error) {
    logger.error('Error handling account disconnected:', error);
  }
}

/**
 * Get webhook events (for debugging/monitoring)
 */
router.get('/events', asyncHandler(async (req: Request, res: Response) => {
  const { limit = '50', processed } = req.query;
  
  const where: any = {};
  if (processed !== undefined) {
    where.processed = processed === 'true';
  }

  const events = await prisma.webhookEvent.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: parseInt(limit as string)
  });

  return res.json({
    events: events.map(event => ({
      ...event,
      createdAt: event.createdAt.toISOString()
    }))
  });
}));

/**
 * Mark webhook event as processed
 */
router.patch('/events/:eventId/processed', asyncHandler(async (req: Request, res: Response) => {
  const { eventId } = req.params;

  await prisma.webhookEvent.update({
    where: { id: eventId },
    data: { processed: true }
  });

  return res.json({ message: 'Event marked as processed' });
}));

export default router;
