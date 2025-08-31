"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountsController = exports.AccountsController = void 0;
const sync_service_1 = require("../services/sync.service");
const logger_1 = require("../utils/logger");
const error_middleware_1 = require("../middleware/error.middleware");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class AccountsController {
    constructor() {
        this.getConnectedAccounts = (0, error_middleware_1.asyncHandler)(async (req, res) => {
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
                logger_1.logger.info(`Retrieved ${accounts.length} connected accounts for user ${req.user.id}`);
                return res.json({
                    accounts: accounts.map(account => ({
                        ...account,
                        lastSyncAt: account.lastSyncAt?.toISOString(),
                        balance: Number(account.balance)
                    }))
                });
            }
            catch (error) {
                logger_1.logger.error(`Failed to get connected accounts for user ${req.user.id}:`, error);
                return res.status(500).json({
                    error: 'Failed to retrieve connected accounts',
                    message: 'Internal server error'
                });
            }
        });
        this.getConnectedAccount = (0, error_middleware_1.asyncHandler)(async (req, res) => {
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
                logger_1.logger.info(`Retrieved connected account ${accountId} for user ${req.user.id}`);
                return res.json({
                    account: {
                        ...account,
                        lastSyncAt: account.lastSyncAt?.toISOString(),
                        balance: Number(account.balance)
                    }
                });
            }
            catch (error) {
                logger_1.logger.error(`Failed to get connected account ${accountId} for user ${req.user.id}:`, error);
                return res.status(500).json({
                    error: 'Failed to retrieve connected account',
                    message: 'Internal server error'
                });
            }
        });
        this.syncAllAccounts = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            if (!req.user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'User not authenticated'
                });
            }
            try {
                await sync_service_1.syncService.syncUserAccounts(req.user.id);
                logger_1.logger.info(`Completed sync for all accounts of user ${req.user.id}`);
                return res.json({
                    message: 'Account sync completed successfully',
                    timestamp: new Date().toISOString()
                });
            }
            catch (error) {
                logger_1.logger.error(`Failed to sync accounts for user ${req.user.id}:`, error);
                return res.status(500).json({
                    error: 'Failed to sync accounts',
                    message: error instanceof Error ? error.message : 'Internal server error'
                });
            }
        });
        this.syncAccount = (0, error_middleware_1.asyncHandler)(async (req, res) => {
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
                    }
                });
                if (!account) {
                    return res.status(404).json({
                        error: 'Account not found',
                        message: 'Connected account not found'
                    });
                }
                await sync_service_1.syncService.syncAccount(accountId);
                logger_1.logger.info(`Completed sync for account ${accountId} of user ${req.user.id}`);
                return res.json({
                    message: 'Account sync completed successfully',
                    accountId,
                    timestamp: new Date().toISOString()
                });
            }
            catch (error) {
                logger_1.logger.error(`Failed to sync account ${accountId} for user ${req.user.id}:`, error);
                return res.status(500).json({
                    error: 'Failed to sync account',
                    message: error instanceof Error ? error.message : 'Internal server error'
                });
            }
        });
        this.disconnectAccount = (0, error_middleware_1.asyncHandler)(async (req, res) => {
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
                    }
                });
                if (!account) {
                    return res.status(404).json({
                        error: 'Account not found',
                        message: 'Connected account not found'
                    });
                }
                await prisma.connectedAccount.update({
                    where: { id: accountId },
                    data: { status: 'INACTIVE' }
                });
                logger_1.logger.info(`Disconnected account ${accountId} for user ${req.user.id}`);
                return res.json({
                    message: 'Account disconnected successfully',
                    accountId
                });
            }
            catch (error) {
                logger_1.logger.error(`Failed to disconnect account ${accountId} for user ${req.user.id}:`, error);
                return res.status(500).json({
                    error: 'Failed to disconnect account',
                    message: 'Internal server error'
                });
            }
        });
        this.getSyncStatus = (0, error_middleware_1.asyncHandler)(async (req, res) => {
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
            }
            catch (error) {
                logger_1.logger.error(`Failed to get sync status for user ${req.user.id}:`, error);
                return res.status(500).json({
                    error: 'Failed to get sync status',
                    message: 'Internal server error'
                });
            }
        });
        this.getBalanceSummary = (0, error_middleware_1.asyncHandler)(async (req, res) => {
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
                const balanceByCurrency = accounts.reduce((acc, account) => {
                    const currency = account.currency || 'USD';
                    acc[currency] = (acc[currency] || 0) + Number(account.balance);
                    return acc;
                }, {});
                const totalBalance = Object.values(balanceByCurrency).reduce((sum, balance) => sum + balance, 0);
                return res.json({
                    totalBalance,
                    balanceByCurrency,
                    accountCount: accounts.length
                });
            }
            catch (error) {
                logger_1.logger.error(`Failed to get balance summary for user ${req.user.id}:`, error);
                return res.status(500).json({
                    error: 'Failed to get balance summary',
                    message: 'Internal server error'
                });
            }
        });
    }
}
exports.AccountsController = AccountsController;
exports.accountsController = new AccountsController();
//# sourceMappingURL=accounts.controller.js.map