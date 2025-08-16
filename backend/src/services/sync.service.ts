import { PrismaClient } from '@prisma/client';
import { mastercardApiService, MastercardAccount, MastercardTransaction } from './mastercard-api.service';
import { Encryption } from '../utils/encryption';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class SyncService {
  /**
   * Sync all connected accounts for a user
   */
  async syncUserAccounts(userId: string): Promise<void> {
    try {
      const connectedAccounts = await prisma.connectedAccount.findMany({
        where: { userId, isActive: true }
      });

      for (const account of connectedAccounts) {
        await this.syncAccount(account.id);
      }

      logger.info(`Completed sync for user ${userId} with ${connectedAccounts.length} accounts`);
    } catch (error) {
      logger.error(`Failed to sync accounts for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Sync a specific connected account
   */
  async syncAccount(connectedAccountId: string): Promise<void> {
    try {
      const account = await prisma.connectedAccount.findUnique({
        where: { id: connectedAccountId },
        include: { user: true }
      });

      if (!account) {
        throw new Error('Connected account not found');
      }

      // Check if token is expired and refresh if needed
      const decryptedAccessToken = Encryption.decrypt(account.accessToken);
      let accessToken = decryptedAccessToken;

      if (account.tokenExpiresAt && account.tokenExpiresAt < new Date()) {
        if (account.refreshToken) {
          const decryptedRefreshToken = Encryption.decrypt(account.refreshToken);
          const tokenResponse = await mastercardApiService.refreshToken(decryptedRefreshToken);
          
          // Update tokens in database
          await prisma.connectedAccount.update({
            where: { id: connectedAccountId },
            data: {
              accessToken: Encryption.encrypt(tokenResponse.access_token),
              refreshToken: tokenResponse.refresh_token ? Encryption.encrypt(tokenResponse.refresh_token) : null,
              tokenExpiresAt: new Date(Date.now() + tokenResponse.expires_in * 1000)
            }
          });

          accessToken = tokenResponse.access_token;
        } else {
          throw new Error('Access token expired and no refresh token available');
        }
      }

      // Sync account balance
      await this.syncAccountBalance(account, accessToken);

      // Sync transactions
      await this.syncAccountTransactions(account, accessToken);

      // Update last sync timestamp
      await prisma.connectedAccount.update({
        where: { id: connectedAccountId },
        data: { lastSyncAt: new Date() }
      });

      logger.info(`Successfully synced account ${account.accountId}`);
    } catch (error) {
      logger.error(`Failed to sync account ${connectedAccountId}:`, error);
      throw error;
    }
  }

  /**
   * Sync account balance
   */
  private async syncAccountBalance(account: any, accessToken: string): Promise<void> {
    try {
      const balanceData = await mastercardApiService.getAccountBalance(accessToken, account.accountId);
      
      await prisma.connectedAccount.update({
        where: { id: account.id },
        data: {
          balance: balanceData.balance,
          currency: balanceData.currency
        }
      });

      logger.debug(`Updated balance for account ${account.accountId}: ${balanceData.balance} ${balanceData.currency}`);
    } catch (error) {
      logger.error(`Failed to sync balance for account ${account.accountId}:`, error);
      // Don't throw error to allow transaction sync to continue
    }
  }

  /**
   * Sync account transactions
   */
  private async syncAccountTransactions(account: any, accessToken: string): Promise<void> {
    try {
      // Get last transaction date to sync only new transactions
      const lastTransaction = await prisma.transaction.findFirst({
        where: { connectedAccountId: account.id },
        orderBy: { date: 'desc' }
      });

      const fromDate = lastTransaction ? lastTransaction.date.toISOString().split('T')[0] : undefined;
      
      // Get transactions from Mastercard API
      const transactions = await mastercardApiService.getTransactions(
        accessToken,
        account.accountId,
        fromDate
      );

      let newTransactionsCount = 0;
      for (const transaction of transactions) {
        // Check if transaction already exists
        const existingTransaction = await prisma.transaction.findFirst({
          where: {
            transactionId: transaction.transactionId,
            connectedAccountId: account.id
          }
        });

        if (!existingTransaction) {
          // Create new transaction
          await prisma.transaction.create({
            data: {
              userId: account.userId,
              connectedAccountId: account.id,
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

          newTransactionsCount++;
        }
      }

      logger.info(`Synced ${newTransactionsCount} new transactions for account ${account.accountId}`);
    } catch (error) {
      logger.error(`Failed to sync transactions for account ${account.accountId}:`, error);
      throw error;
    }
  }

  /**
   * Connect a new bank account
   */
  async connectBankAccount(
    userId: string,
    accountData: MastercardAccount,
    accessToken: string,
    refreshToken?: string,
    expiresIn?: number
  ): Promise<any> {
    try {
      // Check if account already exists
      const existingAccount = await prisma.connectedAccount.findFirst({
        where: {
          userId,
          accountId: accountData.accountId
        }
      });

      if (existingAccount) {
        throw new Error('Account already connected');
      }

      // Create new connected account
      const connectedAccount = await prisma.connectedAccount.create({
        data: {
          userId,
          accountId: accountData.accountId,
          accountName: accountData.accountName,
          accountType: accountData.accountType,
          bankName: accountData.bankName,
          accountNumber: accountData.accountNumber,
          balance: accountData.balance,
          currency: accountData.currency,
          accessToken: Encryption.encrypt(accessToken),
          refreshToken: refreshToken ? Encryption.encrypt(refreshToken) : null,
          tokenExpiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : null
        }
      });

      logger.info(`Successfully connected account ${accountData.accountId} for user ${userId}`);
      return connectedAccount;
    } catch (error) {
      logger.error(`Failed to connect account for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Disconnect a bank account
   */
  async disconnectBankAccount(userId: string, connectedAccountId: string): Promise<void> {
    try {
      const account = await prisma.connectedAccount.findFirst({
        where: {
          id: connectedAccountId,
          userId
        }
      });

      if (!account) {
        throw new Error('Connected account not found');
      }

      // Mark account as inactive
      await prisma.connectedAccount.update({
        where: { id: connectedAccountId },
        data: { isActive: false }
      });

      logger.info(`Successfully disconnected account ${account.accountId} for user ${userId}`);
    } catch (error) {
      logger.error(`Failed to disconnect account ${connectedAccountId} for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get sync status for a user
   */
  async getSyncStatus(userId: string): Promise<any> {
    try {
      const connectedAccounts = await prisma.connectedAccount.findMany({
        where: { userId, isActive: true },
        select: {
          id: true,
          accountName: true,
          bankName: true,
          lastSyncAt: true,
          balance: true,
          currency: true
        }
      });

      return {
        totalAccounts: connectedAccounts.length,
        accounts: connectedAccounts.map(account => ({
          ...account,
          lastSyncAt: account.lastSyncAt?.toISOString(),
          syncStatus: account.lastSyncAt ? 'synced' : 'pending'
        }))
      };
    } catch (error) {
      logger.error(`Failed to get sync status for user ${userId}:`, error);
      throw error;
    }
  }
}

export const syncService = new SyncService();
