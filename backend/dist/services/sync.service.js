"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncService = exports.SyncService = void 0;
const client_1 = require("@prisma/client");
const mastercard_api_service_1 = require("./mastercard-api.service");
const logger_1 = require("../utils/logger");
const encryption_1 = require("../utils/encryption");
const date_fns_1 = require("date-fns");
const crypto_1 = __importDefault(require("crypto"));
const prisma = new client_1.PrismaClient();
class SyncService {
    async performInitialSync(consentId) {
        const result = {
            success: false,
            accountsSynced: 0,
            transactionsSynced: 0,
            balancesSynced: 0,
            errors: []
        };
        let consent = null;
        try {
            consent = await prisma.consent.findUnique({
                where: { id: consentId },
                include: { tokens: true, user: true }
            });
            if (!consent || !consent.tokens) {
                throw new Error('Consent or token not found');
            }
            const accessToken = encryption_1.Encryption.decrypt(consent.tokens.accessToken);
            await this.logAuditEvent(consent.userId, 'INITIAL_SYNC_START', {
                consentId,
                scopes: consent.scopes
            });
            const accounts = await mastercard_api_service_1.mastercardApiService.getAccounts(accessToken);
            result.accountsSynced = await this.syncAccounts(consentId, consent.userId, accounts);
            for (const account of accounts) {
                try {
                    const balances = await mastercard_api_service_1.mastercardApiService.getAccountBalances(accessToken, account.accountId);
                    result.balancesSynced += await this.syncBalances(account.accountId, balances);
                    const fromDate = (0, date_fns_1.format)((0, date_fns_1.subDays)(new Date(), 90), 'yyyy-MM-dd');
                    result.transactionsSynced += await this.syncTransactions(accessToken, account.accountId, fromDate);
                }
                catch (error) {
                    logger_1.logger.error(`Error syncing account ${account.accountId}:`, error);
                    result.errors.push(`Account ${account.accountName}: ${error.message}`);
                }
            }
            await prisma.consent.update({
                where: { id: consentId },
                data: { status: 'ACTIVE' }
            });
            result.success = true;
            await this.logAuditEvent(consent.userId, 'INITIAL_SYNC_COMPLETE', {
                consentId,
                accountsSynced: result.accountsSynced,
                transactionsSynced: result.transactionsSynced,
                balancesSynced: result.balancesSynced
            });
        }
        catch (error) {
            logger_1.logger.error('Initial sync failed:', error);
            result.errors.push(error.message);
            if (consent?.userId) {
                await this.logAuditEvent(consent.userId, 'INITIAL_SYNC_FAILED', {
                    consentId,
                    error: error.message
                });
            }
        }
        return result;
    }
    async syncAccounts(consentId, userId, accounts) {
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
            }
            catch (error) {
                logger_1.logger.error(`Error syncing account ${account.accountId}:`, error);
                throw error;
            }
        }
        return syncedCount;
    }
    async syncBalances(accountId, balances) {
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
                await prisma.connectedAccount.update({
                    where: { id: accountId },
                    data: {
                        balance: parseFloat(balance.current),
                        availableBalance: balance.available ? parseFloat(balance.available) : null,
                        lastSyncAt: new Date()
                    }
                });
                syncedCount++;
            }
            catch (error) {
                logger_1.logger.error(`Error syncing balance for account ${accountId}:`, error);
                throw error;
            }
        }
        return syncedCount;
    }
    async syncTransactions(accessToken, accountId, fromDate, toDate) {
        let totalSynced = 0;
        let nextPage;
        do {
            try {
                const response = await mastercard_api_service_1.mastercardApiService.getTransactions(accessToken, accountId, fromDate, toDate, 100, nextPage);
                for (const transaction of response.transactions) {
                    try {
                        await prisma.transaction.upsert({
                            where: {
                                id: transaction.transactionId || crypto_1.default.randomUUID()
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
                                userId: '',
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
                    }
                    catch (error) {
                        logger_1.logger.error(`Error syncing transaction ${transaction.transactionId}:`, error);
                    }
                }
                nextPage = response.nextPage;
            }
            catch (error) {
                logger_1.logger.error(`Error syncing transactions for account ${accountId}:`, error);
                throw error;
            }
        } while (nextPage);
        return totalSynced;
    }
    async performIncrementalSync(consentId) {
        const result = {
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
            const accessToken = await this.getFreshToken(consent.tokens);
            await this.logAuditEvent(consent.userId, 'INCREMENTAL_SYNC_START', {
                consentId
            });
            for (const account of consent.accounts) {
                try {
                    const balances = await mastercard_api_service_1.mastercardApiService.getAccountBalances(accessToken, account.accountId);
                    result.balancesSynced += await this.syncBalances(account.accountId, balances);
                    const fromDate = (0, date_fns_1.format)((0, date_fns_1.subDays)(new Date(), 7), 'yyyy-MM-dd');
                    result.transactionsSynced += await this.syncTransactions(accessToken, account.accountId, fromDate);
                }
                catch (error) {
                    logger_1.logger.error(`Error in incremental sync for account ${account.accountId}:`, error);
                    result.errors.push(`Account ${account.accountName}: ${error.message}`);
                }
            }
            result.success = true;
            await this.logAuditEvent(consent.userId, 'INCREMENTAL_SYNC_COMPLETE', {
                consentId,
                transactionsSynced: result.transactionsSynced,
                balancesSynced: result.balancesSynced
            });
        }
        catch (error) {
            logger_1.logger.error('Incremental sync failed:', error);
            result.errors.push(error.message);
        }
        return result;
    }
    async getFreshToken(tokenRecord) {
        const now = new Date();
        const expiresAt = new Date(tokenRecord.expiresAt);
        if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
            try {
                const refreshToken = encryption_1.Encryption.decrypt(tokenRecord.refreshToken);
                const newTokenResponse = await mastercard_api_service_1.mastercardApiService.refreshToken(refreshToken);
                await prisma.token.update({
                    where: { id: tokenRecord.id },
                    data: {
                        accessToken: encryption_1.Encryption.encrypt(newTokenResponse.access_token),
                        refreshToken: newTokenResponse.refresh_token
                            ? encryption_1.Encryption.encrypt(newTokenResponse.refresh_token)
                            : tokenRecord.refreshToken,
                        expiresAt: new Date(Date.now() + newTokenResponse.expires_in * 1000)
                    }
                });
                return newTokenResponse.access_token;
            }
            catch (error) {
                logger_1.logger.error('Failed to refresh token:', error);
                throw new Error('Token refresh failed');
            }
        }
        return encryption_1.Encryption.decrypt(tokenRecord.accessToken);
    }
    async logAuditEvent(userId, action, details) {
        try {
            await prisma.auditLog.create({
                data: {
                    userId,
                    action,
                    details,
                    ipAddress: 'system',
                    userAgent: 'sync-service'
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to log audit event:', error);
        }
    }
    async syncUserAccounts(userId) {
        const result = {
            success: false,
            accountsSynced: 0,
            transactionsSynced: 0,
            balancesSynced: 0,
            errors: []
        };
        try {
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
            await this.logAuditEvent(userId, 'USER_SYNC_START', {
                consentsCount: consents.length
            });
            for (const consent of consents) {
                try {
                    const consentResult = await this.performIncrementalSync(consent.id);
                    result.accountsSynced += consentResult.accountsSynced;
                    result.transactionsSynced += consentResult.transactionsSynced;
                    result.balancesSynced += consentResult.balancesSynced;
                    result.errors.push(...consentResult.errors);
                }
                catch (error) {
                    logger_1.logger.error(`Error syncing consent ${consent.id}:`, error);
                    result.errors.push(`Consent ${consent.id}: ${error.message}`);
                }
            }
            result.success = result.errors.length === 0;
            await this.logAuditEvent(userId, 'USER_SYNC_COMPLETE', {
                accountsSynced: result.accountsSynced,
                transactionsSynced: result.transactionsSynced,
                balancesSynced: result.balancesSynced,
                errors: result.errors
            });
        }
        catch (error) {
            logger_1.logger.error(`Failed to sync user accounts for user ${userId}:`, error);
            result.errors.push(error.message);
            await this.logAuditEvent(userId, 'USER_SYNC_FAILED', {
                error: error.message
            });
        }
        return result;
    }
    async syncAccount(accountId) {
        const result = {
            success: false,
            accountsSynced: 0,
            transactionsSynced: 0,
            balancesSynced: 0,
            errors: []
        };
        let account = null;
        try {
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
            const accessToken = await this.getFreshToken(account.consent.tokens);
            await this.logAuditEvent(account.userId, 'ACCOUNT_SYNC_START', {
                accountId,
                consentId: account.consentId
            });
            const balances = await mastercard_api_service_1.mastercardApiService.getAccountBalances(accessToken, accountId);
            result.balancesSynced = await this.syncBalances(accountId, balances);
            const fromDate = (0, date_fns_1.format)((0, date_fns_1.subDays)(new Date(), 7), 'yyyy-MM-dd');
            result.transactionsSynced = await this.syncTransactions(accessToken, accountId, fromDate);
            result.success = true;
            await this.logAuditEvent(account.userId, 'ACCOUNT_SYNC_COMPLETE', {
                accountId,
                transactionsSynced: result.transactionsSynced,
                balancesSynced: result.balancesSynced
            });
        }
        catch (error) {
            logger_1.logger.error(`Failed to sync account ${accountId}:`, error);
            result.errors.push(error.message);
            if (account?.userId) {
                await this.logAuditEvent(account.userId, 'ACCOUNT_SYNC_FAILED', {
                    accountId,
                    error: error.message
                });
            }
        }
        return result;
    }
    async cleanupExpiredConsents() {
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
                    await prisma.consent.update({
                        where: { id: consent.id },
                        data: { status: 'EXPIRED' }
                    });
                    await this.logAuditEvent(consent.userId, 'CONSENT_EXPIRED', {
                        consentId: consent.id
                    });
                }
                catch (error) {
                    logger_1.logger.error(`Error cleaning up expired consent ${consent.id}:`, error);
                }
            }
        }
        catch (error) {
            logger_1.logger.error('Error in cleanup expired consents:', error);
        }
    }
}
exports.SyncService = SyncService;
exports.syncService = new SyncService();
//# sourceMappingURL=sync.service.js.map