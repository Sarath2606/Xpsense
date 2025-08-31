import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { syncService } from '../services/sync.service';
import { logger } from '../utils/logger';
import { asyncHandler } from '../middleware/error.middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AccountsController {
  /**
   * Get all connected accounts for a user
   */
  getConnectedAccounts = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    try {
      const accounts = await prisma.connectedAccount.findMany({
        where: { userId: req.user.id, status: 'ACTIVE' },
        select: {
          id: true,
          accountId: true,
          accountName: true,
          accountType: true,
          bankName: true,
          accountNumber: true,
          balance: true,
          currency: true,
          lastSyncAt: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      });

      logger.info(`Retrieved ${accounts.length} connected accounts for user ${req.user.id}`);

      return res.json({
        accounts: accounts.map(account => ({
          ...account,
          lastSyncAt: account.lastSyncAt?.toISOString(),
          balance: Number(account.balance)
        }))
      });
    } catch (error) {
      logger.error(`Failed to get connected accounts for user ${req.user.id}:`, error);
      return res.status(500).json({
        error: 'Failed to retrieve connected accounts',
        message: 'Internal server error'
      });
    }
  });

  /**
   * Get a specific connected account
   */
  getConnectedAccount = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const { accountId } = req.params;

    try {
      const account = await prisma.connectedAccount.findFirst({
        where: {
          id: accountId,
          userId: req.user.id,
          status: 'ACTIVE'
        },
        select: {
          id: true,
          accountId: true,
          accountName: true,
          accountType: true,
          bankName: true,
          accountNumber: true,
          balance: true,
          currency: true,
          lastSyncAt: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!account) {
        return res.status(404).json({
          error: 'Account not found',
          message: 'Connected account not found'
        });
      }

      logger.info(`Retrieved connected account ${accountId} for user ${req.user.id}`);

      return res.json({
        account: {
          ...account,
          lastSyncAt: account.lastSyncAt?.toISOString(),
          balance: Number(account.balance)
        }
      });
    } catch (error) {
      logger.error(`Failed to get connected account ${accountId} for user ${req.user.id}:`, error);
      return res.status(500).json({
        error: 'Failed to retrieve connected account',
        message: 'Internal server error'
      });
    }
  });

  /**
   * Sync all connected accounts for a user
   */
  syncAllAccounts = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    try {
      // Start sync process
      await syncService.syncUserAccounts(req.user.id);

      logger.info(`Completed sync for all accounts of user ${req.user.id}`);

      return res.json({
        message: 'Account sync completed successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error(`Failed to sync accounts for user ${req.user.id}:`, error);
      return res.status(500).json({
        error: 'Failed to sync accounts',
        message: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  });

  /**
   * Sync a specific connected account
   */
  syncAccount = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const { accountId } = req.params;

    try {
      // Verify account belongs to user
      const account = await prisma.connectedAccount.findFirst({
        where: {
          id: accountId,
          userId: req.user.id,
          status: 'ACTIVE'
        }
      });

      if (!account) {
        return res.status(404).json({
          error: 'Account not found',
          message: 'Connected account not found'
        });
      }

      // Sync the account
      await syncService.syncAccount(accountId);

      logger.info(`Completed sync for account ${accountId} of user ${req.user.id}`);

      return res.json({
        message: 'Account sync completed successfully',
        accountId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error(`Failed to sync account ${accountId} for user ${req.user.id}:`, error);
      return res.status(500).json({
        error: 'Failed to sync account',
        message: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  });

  /**
   * Disconnect a bank account
   */
  disconnectAccount = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const { accountId } = req.params;

    try {
      // Verify account belongs to user
      const account = await prisma.connectedAccount.findFirst({
        where: {
          id: accountId,
          userId: req.user.id,
          status: 'ACTIVE'
        }
      });

      if (!account) {
        return res.status(404).json({
          error: 'Account not found',
          message: 'Connected account not found'
        });
      }

      // Mark account as inactive
      await prisma.connectedAccount.update({
        where: { id: accountId },
        data: { status: 'INACTIVE' }
      });

      logger.info(`Disconnected account ${accountId} for user ${req.user.id}`);

      return res.json({
        message: 'Account disconnected successfully',
        accountId
      });
    } catch (error) {
      logger.error(`Failed to disconnect account ${accountId} for user ${req.user.id}:`, error);
      return res.status(500).json({
        error: 'Failed to disconnect account',
        message: 'Internal server error'
      });
    }
  });

  /**
   * Get sync status for all accounts
   */
  getSyncStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    try {
      const accounts = await prisma.connectedAccount.findMany({
        where: { userId: req.user.id, status: 'ACTIVE' },
        select: {
          id: true,
          accountName: true,
          lastSyncAt: true,
          balance: true
        }
      });

      const syncStatus = accounts.map(account => ({
        accountId: account.id,
        accountName: account.accountName,
        lastSyncAt: account.lastSyncAt?.toISOString(),
        balance: Number(account.balance),
        isSynced: account.lastSyncAt !== null
      }));

      return res.json({
        syncStatus,
        totalAccounts: accounts.length,
        syncedAccounts: accounts.filter(a => a.lastSyncAt !== null).length
      });
    } catch (error) {
      logger.error(`Failed to get sync status for user ${req.user.id}:`, error);
      return res.status(500).json({
        error: 'Failed to get sync status',
        message: 'Internal server error'
      });
    }
  });

  /**
   * Get balance summary for all accounts
   */
  getBalanceSummary = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    try {
      const accounts = await prisma.connectedAccount.findMany({
        where: { userId: req.user.id, status: 'ACTIVE' },
        select: {
          balance: true,
          currency: true
        }
      });

      // Group by currency and sum balances
      const balanceByCurrency = accounts.reduce((acc, account) => {
        const currency = account.currency || 'USD';
        acc[currency] = (acc[currency] || 0) + Number(account.balance);
        return acc;
      }, {} as Record<string, number>);

      const totalBalance = Object.values(balanceByCurrency).reduce((sum, balance) => sum + balance, 0);

      return res.json({
        totalBalance,
        balanceByCurrency,
        accountCount: accounts.length
      });
    } catch (error) {
      logger.error(`Failed to get balance summary for user ${req.user.id}:`, error);
      return res.status(500).json({
        error: 'Failed to get balance summary',
        message: 'Internal server error'
      });
    }
  });
}

export const accountsController = new AccountsController();
