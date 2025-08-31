import { PrismaClient } from '@prisma/client';
import { mastercardApiService, CDR_SCOPES } from './mastercard-api.service';
import { logger } from '../utils/logger';
import { Encryption } from '../utils/encryption';
import { addDays, subDays, format } from 'date-fns';
import crypto from 'crypto';

const prisma = new PrismaClient();

export interface SyncResult {
  success: boolean;
  accountsSynced: number;
  transactionsSynced: number;
  balancesSynced: number;
  errors: string[];
}

export class SyncService {
  /**
   * Initial sync after consent is granted
   */
  async performInitialSync(consentId: string): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      accountsSynced: 0,
      transactionsSynced: 0,
      balancesSynced: 0,
      errors: []
    };

    let consent: any = null;

    try {
      // Get consent and token
      consent = await prisma.consent.findUnique({
        where: { id: consentId },
        include: { tokens: true, user: true }
      });

      if (!consent || !consent.tokens) {
        throw new Error('Consent or token not found');
      }

      // Decrypt access token
      const accessToken = Encryption.decrypt(consent.tokens.accessToken);
      
      // Log audit event
      await this.logAuditEvent(consent.userId, 'INITIAL_SYNC_START', {
        consentId,
        scopes: consent.scopes
      });

      // Sync accounts
      const accounts = await mastercardApiService.getAccounts(accessToken);
      result.accountsSynced = await this.syncAccounts(consentId, consent.userId, accounts);

      // Sync balances and transactions for each account
      for (const account of accounts) {
        try {
          // Sync balances
          const balances = await mastercardApiService.getAccountBalances(accessToken, account.accountId);
          result.balancesSynced += await this.syncBalances(account.accountId, balances);

          // Sync transactions (last 90 days)
          const fromDate = format(subDays(new Date(), 90), 'yyyy-MM-dd');
          result.transactionsSynced += await this.syncTransactions(
            accessToken,
            account.accountId,
            fromDate
          );
        } catch (error) {
          logger.error(`Error syncing account ${account.accountId}:`, error);
          result.errors.push(`Account ${account.accountName}: ${(error as Error).message}`);
        }
      }

      // Update consent status
      await prisma.consent.update({
        where: { id: consentId },
        data: { status: 'ACTIVE' }
      });

      result.success = true;

      // Log successful sync
      await this.logAuditEvent(consent.userId, 'INITIAL_SYNC_COMPLETE', {
        consentId,
        accountsSynced: result.accountsSynced,
        transactionsSynced: result.transactionsSynced,
        balancesSynced: result.balancesSynced
      });

    } catch (error) {
      logger.error('Initial sync failed:', error);
      result.errors.push((error as Error).message);
      
      // Log failed sync
      if (consent?.userId) {
        await this.logAuditEvent(consent.userId, 'INITIAL_SYNC_FAILED', {
          consentId,
          error: (error as Error).message
        });
      }
    }

    return result;
  }

  /**
   * Sync accounts from Mastercard API
   */
  private async syncAccounts(
    consentId: string,
    userId: string,
    accounts: any[]
  ): Promise<number> {
    let syncedCount = 0;

    for (const account of accounts) {
      try {
        await prisma.connectedAccount.upsert({
          where: {
            userId_accountId: {
              userId,
              accountId: account.accountId
            }
          },
          update: {
            accountName: account.accountName,
            accountType: account.accountType,
            bankName: account.bankName,
            accountNumber: account.maskedNumber,
            currency: account.currency,
            status: account.status === 'OPEN' ? 'ACTIVE' : 'CLOSED',
            lastSyncAt: new Date(),
            consentId
          },
          create: {
            userId,
            consentId,
            accountId: account.accountId,
            accountName: account.accountName,
            accountType: account.accountType,
            bankName: account.bankName,
            accountNumber: account.maskedNumber,
            currency: account.currency,
            status: account.status === 'OPEN' ? 'ACTIVE' : 'CLOSED',
            balance: 0,
            lastSyncAt: new Date()
          }
        });

        syncedCount++;
      } catch (error) {
        logger.error(`Error syncing account ${account.accountId}:`, error);
        throw error;
      }
    }

    return syncedCount;
  }

  /**
   * Sync balances for an account
   */
  private async syncBalances(accountId: string, balances: any[]): Promise<number> {
    let syncedCount = 0;

    for (const balance of balances) {
      try {
        await prisma.balance.create({
          data: {
            accountId,
            asAt: new Date(balance.asAt),
            current: parseFloat(balance.current),
            available: balance.available ? parseFloat(balance.available) : null,
            creditLimit: balance.creditLimit ? parseFloat(balance.creditLimit) : null,
            currency: balance.currency
          }
        });

        // Update account balance
        await prisma.connectedAccount.update({
          where: { id: accountId },
          data: {
            balance: parseFloat(balance.current),
            availableBalance: balance.available ? parseFloat(balance.available) : null,
            lastSyncAt: new Date()
          }
        });

        syncedCount++;
      } catch (error) {
        logger.error(`Error syncing balance for account ${accountId}:`, error);
        throw error;
      }
    }

    return syncedCount;
  }

  /**
   * Sync transactions for an account with pagination
   */
  private async syncTransactions(
    accessToken: string,
    accountId: string,
    fromDate: string,
    toDate?: string
  ): Promise<number> {
    let totalSynced = 0;
    let nextPage: string | undefined;

    do {
      try {
        const response = await mastercardApiService.getTransactions(
          accessToken,
          accountId,
          fromDate,
          toDate,
          100,
          nextPage
        );

        for (const transaction of response.transactions) {
          try {
            await prisma.transaction.upsert({
              where: {
                id: transaction.transactionId || crypto.randomUUID()
              },
              update: {
                description: transaction.description,
                amount: parseFloat(transaction.amount),
                currency: transaction.currency,
                transactionType: transaction.type,
                category: transaction.category,
                date: new Date(transaction.postedAt),
                metadata: transaction.metadata
              },
              create: {
                userId: '', // Will be set by the account relationship
                connectedAccountId: accountId,
                transactionId: transaction.transactionId,
                description: transaction.description,
                amount: parseFloat(transaction.amount),
                currency: transaction.currency,
                transactionType: transaction.type,
                category: transaction.category,
                date: new Date(transaction.postedAt),
                isImported: true,
                metadata: transaction.metadata
              }
            });

            totalSynced++;
          } catch (error) {
            logger.error(`Error syncing transaction ${transaction.transactionId}:`, error);
            // Continue with other transactions
          }
        }

        nextPage = response.nextPage;
      } catch (error) {
        logger.error(`Error syncing transactions for account ${accountId}:`, error);
        throw error;
      }
    } while (nextPage);

    return totalSynced;
  }

  /**
   * Refresh tokens and perform incremental sync
   */
  async performIncrementalSync(consentId: string): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      accountsSynced: 0,
      transactionsSynced: 0,
      balancesSynced: 0,
      errors: []
    };

    try {
      const consent = await prisma.consent.findUnique({
        where: { id: consentId },
        include: { tokens: true, user: true, accounts: true }
      });

      if (!consent || !consent.tokens) {
        throw new Error('Consent or token not found');
      }

      // Check if token needs refresh
      const accessToken = await this.getFreshToken(consent.tokens);

      // Log audit event
      await this.logAuditEvent(consent.userId, 'INCREMENTAL_SYNC_START', {
        consentId
      });

      // Sync balances for all accounts
      for (const account of consent.accounts) {
        try {
          const balances = await mastercardApiService.getAccountBalances(accessToken, account.accountId);
          result.balancesSynced += await this.syncBalances(account.accountId, balances);

          // Sync recent transactions (last 7 days)
          const fromDate = format(subDays(new Date(), 7), 'yyyy-MM-dd');
          result.transactionsSynced += await this.syncTransactions(
            accessToken,
            account.accountId,
            fromDate
          );
        } catch (error) {
          logger.error(`Error in incremental sync for account ${account.accountId}:`, error);
          result.errors.push(`Account ${account.accountName}: ${(error as Error).message}`);
        }
      }

      result.success = true;

      // Log successful sync
      await this.logAuditEvent(consent.userId, 'INCREMENTAL_SYNC_COMPLETE', {
        consentId,
        transactionsSynced: result.transactionsSynced,
        balancesSynced: result.balancesSynced
      });

    } catch (error) {
      logger.error('Incremental sync failed:', error);
      result.errors.push((error as Error).message);
    }

    return result;
  }

  /**
   * Get fresh access token, refreshing if needed
   */
  private async getFreshToken(tokenRecord: any): Promise<string> {
    const now = new Date();
    const expiresAt = new Date(tokenRecord.expiresAt);
    
    // Refresh if token expires in the next 5 minutes
    if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
      try {
        const refreshToken = Encryption.decrypt(tokenRecord.refreshToken);
        const newTokenResponse = await mastercardApiService.refreshToken(refreshToken);

        // Update token in database
        await prisma.token.update({
          where: { id: tokenRecord.id },
          data: {
            accessToken: Encryption.encrypt(newTokenResponse.access_token),
            refreshToken: newTokenResponse.refresh_token 
              ? Encryption.encrypt(newTokenResponse.refresh_token)
              : tokenRecord.refreshToken,
            expiresAt: new Date(Date.now() + newTokenResponse.expires_in * 1000)
          }
        });

        return newTokenResponse.access_token;
      } catch (error) {
        logger.error('Failed to refresh token:', error);
        throw new Error('Token refresh failed');
      }
    }

    return Encryption.decrypt(tokenRecord.accessToken);
  }

  /**
   * Log audit event for CDR compliance
   */
  private async logAuditEvent(
    userId: string,
    action: string,
    details: any
  ): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId,
          action,
          details,
          ipAddress: 'system', // For system-generated events
          userAgent: 'sync-service'
        }
      });
    } catch (error) {
      logger.error('Failed to log audit event:', error);
    }
  }

  /**
   * Sync all accounts for a specific user
   */
  async syncUserAccounts(userId: string): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      accountsSynced: 0,
      transactionsSynced: 0,
      balancesSynced: 0,
      errors: []
    };

    try {
      // Get all active consents for the user
      const consents = await prisma.consent.findMany({
        where: {
          userId,
          status: 'ACTIVE'
        },
        include: { tokens: true, accounts: true }
      });

      if (consents.length === 0) {
        throw new Error('No active consents found for user');
      }

      // Log audit event
      await this.logAuditEvent(userId, 'USER_SYNC_START', {
        consentsCount: consents.length
      });

      for (const consent of consents) {
        try {
          // Perform incremental sync for each consent
          const consentResult = await this.performIncrementalSync(consent.id);
          
          result.accountsSynced += consentResult.accountsSynced;
          result.transactionsSynced += consentResult.transactionsSynced;
          result.balancesSynced += consentResult.balancesSynced;
          result.errors.push(...consentResult.errors);
        } catch (error) {
          logger.error(`Error syncing consent ${consent.id}:`, error);
          result.errors.push(`Consent ${consent.id}: ${(error as Error).message}`);
        }
      }

      result.success = result.errors.length === 0;

      // Log audit event
      await this.logAuditEvent(userId, 'USER_SYNC_COMPLETE', {
        accountsSynced: result.accountsSynced,
        transactionsSynced: result.transactionsSynced,
        balancesSynced: result.balancesSynced,
        errors: result.errors
      });

    } catch (error) {
      logger.error(`Failed to sync user accounts for user ${userId}:`, error);
      result.errors.push((error as Error).message);
      
      // Log failed sync
      await this.logAuditEvent(userId, 'USER_SYNC_FAILED', {
        error: (error as Error).message
      });
    }

    return result;
  }

  /**
   * Sync a specific account
   */
  async syncAccount(accountId: string): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      accountsSynced: 0,
      transactionsSynced: 0,
      balancesSynced: 0,
      errors: []
    };

    let account: any = null;

    try {
      // Get the account and its consent
      account = await prisma.connectedAccount.findFirst({
        where: { accountId },
        include: {
          consent: {
            include: { tokens: true }
          }
        }
      });

      if (!account) {
        throw new Error('Account not found');
      }

      if (!account.consent || !account.consent.tokens) {
        throw new Error('Account consent or tokens not found');
      }

      // Get fresh access token
      const accessToken = await this.getFreshToken(account.consent.tokens);

      // Log audit event
      await this.logAuditEvent(account.userId, 'ACCOUNT_SYNC_START', {
        accountId,
        consentId: account.consentId
      });

      // Sync balances
      const balances = await mastercardApiService.getAccountBalances(accessToken, accountId);
      result.balancesSynced = await this.syncBalances(accountId, balances);

      // Sync recent transactions (last 7 days)
      const fromDate = format(subDays(new Date(), 7), 'yyyy-MM-dd');
      result.transactionsSynced = await this.syncTransactions(
        accessToken,
        accountId,
        fromDate
      );

      result.success = true;

      // Log successful sync
      await this.logAuditEvent(account.userId, 'ACCOUNT_SYNC_COMPLETE', {
        accountId,
        transactionsSynced: result.transactionsSynced,
        balancesSynced: result.balancesSynced
      });

    } catch (error) {
      logger.error(`Failed to sync account ${accountId}:`, error);
      result.errors.push((error as Error).message);
      
      // Log failed sync
      if (account?.userId) {
        await this.logAuditEvent(account.userId, 'ACCOUNT_SYNC_FAILED', {
          accountId,
          error: (error as Error).message
        });
      }
    }

    return result;
  }

  /**
   * Clean up expired consents and associated data
   */
  async cleanupExpiredConsents(): Promise<void> {
    try {
      const expiredConsents = await prisma.consent.findMany({
        where: {
          expiresAt: {
            lt: new Date()
          },
          status: {
            in: ['ACTIVE', 'PENDING']
          }
        }
      });

      for (const consent of expiredConsents) {
        try {
          // Update consent status
          await prisma.consent.update({
            where: { id: consent.id },
            data: { status: 'EXPIRED' }
          });

          // Log audit event
          await this.logAuditEvent(consent.userId, 'CONSENT_EXPIRED', {
            consentId: consent.id
          });

          // Note: In production, you might want to de-identify data instead of deleting
          // This depends on your data retention policy
        } catch (error) {
          logger.error(`Error cleaning up expired consent ${consent.id}:`, error);
        }
      }
    } catch (error) {
      logger.error('Error in cleanup expired consents:', error);
    }
  }
}

export const syncService = new SyncService();
