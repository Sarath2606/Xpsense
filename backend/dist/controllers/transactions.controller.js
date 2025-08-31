"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionsController = exports.TransactionsController = void 0;
const logger_1 = require("../utils/logger");
const error_middleware_1 = require("../middleware/error.middleware");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class TransactionsController {
    constructor() {
        this.getAllTransactions = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            if (!req.user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'User not authenticated'
                });
            }
            try {
                const transactions = await prisma.transaction.findMany({
                    where: { userId: req.user.id },
                    orderBy: { date: 'desc' },
                    take: 50
                });
                logger_1.logger.info(`Retrieved ${transactions.length} transactions for user ${req.user.id}`);
                return res.json({
                    transactions: transactions.map(transaction => ({
                        ...transaction,
                        amount: Number(transaction.amount),
                        date: transaction.date.toISOString()
                    }))
                });
            }
            catch (error) {
                logger_1.logger.error(`Failed to get transactions for user ${req.user.id}:`, error);
                return res.status(500).json({
                    error: 'Failed to retrieve transactions',
                    message: 'Internal server error'
                });
            }
        });
        this.getTransaction = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            if (!req.user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'User not authenticated'
                });
            }
            const { transactionId } = req.params;
            try {
                const transaction = await prisma.transaction.findFirst({
                    where: {
                        id: transactionId,
                        userId: req.user.id
                    },
                    include: {
                        connectedAccount: {
                            select: {
                                accountName: true,
                                bankName: true
                            }
                        }
                    }
                });
                if (!transaction) {
                    return res.status(404).json({
                        error: 'Transaction not found',
                        message: 'Transaction not found'
                    });
                }
                logger_1.logger.info(`Retrieved transaction ${transactionId} for user ${req.user.id}`);
                return res.json({
                    transaction: {
                        ...transaction,
                        amount: Number(transaction.amount),
                        date: transaction.date.toISOString()
                    }
                });
            }
            catch (error) {
                logger_1.logger.error(`Failed to get transaction ${transactionId} for user ${req.user.id}:`, error);
                return res.status(500).json({
                    error: 'Failed to retrieve transaction',
                    message: 'Internal server error'
                });
            }
        });
        this.createTransaction = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            if (!req.user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'User not authenticated'
                });
            }
            const { description, amount, currency, category, transactionType, date, connectedAccountId } = req.body;
            if (!description || !amount || !transactionType || !date) {
                return res.status(400).json({
                    error: 'Missing required fields',
                    message: 'Description, amount, transaction type, and date are required'
                });
            }
            try {
                if (connectedAccountId) {
                    const account = await prisma.connectedAccount.findFirst({
                        where: {
                            id: connectedAccountId,
                            userId: req.user.id,
                            status: 'ACTIVE'
                        }
                    });
                    if (!account) {
                        return res.status(400).json({
                            error: 'Invalid account',
                            message: 'Connected account not found or not accessible'
                        });
                    }
                }
                const transaction = await prisma.transaction.create({
                    data: {
                        userId: req.user.id,
                        description,
                        amount,
                        currency: currency || 'USD',
                        category,
                        transactionType,
                        date: new Date(date),
                        isImported: false,
                        connectedAccountId
                    },
                    include: {
                        connectedAccount: {
                            select: {
                                accountName: true,
                                bankName: true
                            }
                        }
                    }
                });
                logger_1.logger.info(`Created transaction ${transaction.id} for user ${req.user.id}`);
                return res.status(201).json({
                    message: 'Transaction created successfully',
                    transaction: {
                        ...transaction,
                        amount: Number(transaction.amount),
                        date: transaction.date.toISOString()
                    }
                });
            }
            catch (error) {
                logger_1.logger.error(`Failed to create transaction for user ${req.user.id}:`, error);
                return res.status(500).json({
                    error: 'Failed to create transaction',
                    message: 'Internal server error'
                });
            }
        });
        this.updateTransaction = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            if (!req.user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'User not authenticated'
                });
            }
            const { transactionId } = req.params;
            const { description, amount, currency, category, transactionType, date } = req.body;
            try {
                const existingTransaction = await prisma.transaction.findFirst({
                    where: {
                        id: transactionId,
                        userId: req.user.id
                    }
                });
                if (!existingTransaction) {
                    return res.status(404).json({
                        error: 'Transaction not found',
                        message: 'Transaction not found'
                    });
                }
                if (existingTransaction.isImported) {
                    return res.status(400).json({
                        error: 'Cannot update imported transaction',
                        message: 'Imported transactions cannot be modified'
                    });
                }
                const transaction = await prisma.transaction.update({
                    where: { id: transactionId },
                    data: {
                        description,
                        amount,
                        currency,
                        category,
                        transactionType,
                        date: date ? new Date(date) : undefined
                    },
                    include: {
                        connectedAccount: {
                            select: {
                                accountName: true,
                                bankName: true
                            }
                        }
                    }
                });
                logger_1.logger.info(`Updated transaction ${transactionId} for user ${req.user.id}`);
                return res.json({
                    message: 'Transaction updated successfully',
                    transaction: {
                        ...transaction,
                        amount: Number(transaction.amount),
                        date: transaction.date.toISOString()
                    }
                });
            }
            catch (error) {
                logger_1.logger.error(`Failed to update transaction ${transactionId} for user ${req.user.id}:`, error);
                return res.status(500).json({
                    error: 'Failed to update transaction',
                    message: 'Internal server error'
                });
            }
        });
        this.deleteTransaction = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            if (!req.user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'User not authenticated'
                });
            }
            const { transactionId } = req.params;
            try {
                const transaction = await prisma.transaction.findFirst({
                    where: {
                        id: transactionId,
                        userId: req.user.id
                    }
                });
                if (!transaction) {
                    return res.status(404).json({
                        error: 'Transaction not found',
                        message: 'Transaction not found'
                    });
                }
                if (transaction.isImported) {
                    return res.status(400).json({
                        error: 'Cannot delete imported transaction',
                        message: 'Imported transactions cannot be deleted'
                    });
                }
                await prisma.transaction.delete({
                    where: { id: transactionId }
                });
                logger_1.logger.info(`Deleted transaction ${transactionId} for user ${req.user.id}`);
                return res.json({
                    message: 'Transaction deleted successfully'
                });
            }
            catch (error) {
                logger_1.logger.error(`Failed to delete transaction ${transactionId} for user ${req.user.id}:`, error);
                return res.status(500).json({
                    error: 'Failed to delete transaction',
                    message: 'Internal server error'
                });
            }
        });
        this.getTransactionStats = (0, error_middleware_1.asyncHandler)(async (req, res) => {
            if (!req.user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'User not authenticated'
                });
            }
            const { fromDate, toDate } = req.query;
            try {
                const where = { userId: req.user.id };
                if (fromDate || toDate) {
                    where.date = {};
                    if (fromDate)
                        where.date.gte = new Date(fromDate);
                    if (toDate)
                        where.date.lte = new Date(toDate);
                }
                const [totalTransactions, totalIncome, totalExpenses, categoryStats] = await Promise.all([
                    prisma.transaction.count({ where }),
                    prisma.transaction.aggregate({
                        where: { ...where, transactionType: 'CREDIT' },
                        _sum: { amount: true }
                    }),
                    prisma.transaction.aggregate({
                        where: { ...where, transactionType: 'DEBIT' },
                        _sum: { amount: true }
                    }),
                    prisma.transaction.groupBy({
                        by: ['category'],
                        where,
                        _sum: { amount: true },
                        _count: true
                    })
                ]);
                const stats = {
                    totalTransactions,
                    totalIncome: Number(totalIncome._sum.amount || 0),
                    totalExpenses: Number(totalExpenses._sum.amount || 0),
                    netAmount: Number(totalIncome._sum.amount || 0) - Number(totalExpenses._sum.amount || 0),
                    categoryBreakdown: categoryStats.map(stat => ({
                        category: stat.category,
                        totalAmount: Number(stat._sum.amount || 0),
                        count: stat._count
                    }))
                };
                logger_1.logger.info(`Retrieved transaction stats for user ${req.user.id}`);
                return res.json(stats);
            }
            catch (error) {
                logger_1.logger.error(`Failed to get transaction stats for user ${req.user.id}:`, error);
                return res.status(500).json({
                    error: 'Failed to retrieve transaction statistics',
                    message: 'Internal server error'
                });
            }
        });
    }
}
exports.TransactionsController = TransactionsController;
exports.transactionsController = new TransactionsController();
//# sourceMappingURL=transactions.controller.js.map