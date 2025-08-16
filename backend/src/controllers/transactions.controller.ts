import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';
import { asyncHandler } from '../middleware/error.middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TransactionsController {
  /**
   * Get all transactions for a user
   */
  getTransactions = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const { 
      page = '1', 
      limit = '50', 
      category, 
      type, 
      fromDate, 
      toDate,
      accountId 
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    try {
      // Build where clause
      const where: any = { userId: req.user.id };
      
      if (category) where.category = category;
      if (type) where.transactionType = type;
      if (accountId) where.connectedAccountId = accountId;
      
      if (fromDate || toDate) {
        where.date = {};
        if (fromDate) where.date.gte = new Date(fromDate as string);
        if (toDate) where.date.lte = new Date(toDate as string);
      }

      // Get transactions with pagination
      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
          where,
          include: {
            connectedAccount: {
              select: {
                accountName: true,
                bankName: true
              }
            }
          },
          orderBy: { date: 'desc' },
          skip,
          take: limitNum
        }),
        prisma.transaction.count({ where })
      ]);

      logger.info(`Retrieved ${transactions.length} transactions for user ${req.user.id}`);

      return res.json({
        transactions: transactions.map(transaction => ({
          ...transaction,
          amount: Number(transaction.amount),
          date: transaction.date.toISOString()
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      logger.error(`Failed to get transactions for user ${req.user.id}:`, error);
      return res.status(500).json({
        error: 'Failed to retrieve transactions',
        message: 'Internal server error'
      });
    }
  });

  /**
   * Get a specific transaction
   */
  getTransaction = asyncHandler(async (req: AuthRequest, res: Response) => {
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

      logger.info(`Retrieved transaction ${transactionId} for user ${req.user.id}`);

      return res.json({
        transaction: {
          ...transaction,
          amount: Number(transaction.amount),
          date: transaction.date.toISOString()
        }
      });
    } catch (error) {
      logger.error(`Failed to get transaction ${transactionId} for user ${req.user.id}:`, error);
      return res.status(500).json({
        error: 'Failed to retrieve transaction',
        message: 'Internal server error'
      });
    }
  });

  /**
   * Create a new transaction (manual entry)
   */
  createTransaction = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const { description, amount, currency, category, transactionType, date, connectedAccountId } = req.body;

    // Validate required fields
    if (!description || !amount || !transactionType || !date) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Description, amount, transaction type, and date are required'
      });
    }

    try {
      // If connectedAccountId is provided, verify it belongs to the user
      if (connectedAccountId) {
        const account = await prisma.connectedAccount.findFirst({
          where: {
            id: connectedAccountId,
            userId: req.user.id,
            isActive: true
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

      logger.info(`Created transaction ${transaction.id} for user ${req.user.id}`);

      return res.status(201).json({
        message: 'Transaction created successfully',
        transaction: {
          ...transaction,
          amount: Number(transaction.amount),
          date: transaction.date.toISOString()
        }
      });
    } catch (error) {
      logger.error(`Failed to create transaction for user ${req.user.id}:`, error);
      return res.status(500).json({
        error: 'Failed to create transaction',
        message: 'Internal server error'
      });
    }
  });

  /**
   * Update a transaction
   */
  updateTransaction = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const { transactionId } = req.params;
    const { description, amount, currency, category, transactionType, date } = req.body;

    try {
      // Find transaction and verify ownership
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

      // Don't allow updating imported transactions
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

      logger.info(`Updated transaction ${transactionId} for user ${req.user.id}`);

      return res.json({
        message: 'Transaction updated successfully',
        transaction: {
          ...transaction,
          amount: Number(transaction.amount),
          date: transaction.date.toISOString()
        }
      });
    } catch (error) {
      logger.error(`Failed to update transaction ${transactionId} for user ${req.user.id}:`, error);
      return res.status(500).json({
        error: 'Failed to update transaction',
        message: 'Internal server error'
      });
    }
  });

  /**
   * Delete a transaction
   */
  deleteTransaction = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const { transactionId } = req.params;

    try {
      // Find transaction and verify ownership
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

      // Don't allow deleting imported transactions
      if (transaction.isImported) {
        return res.status(400).json({
          error: 'Cannot delete imported transaction',
          message: 'Imported transactions cannot be deleted'
        });
      }

      await prisma.transaction.delete({
        where: { id: transactionId }
      });

      logger.info(`Deleted transaction ${transactionId} for user ${req.user.id}`);

      return res.json({
        message: 'Transaction deleted successfully'
      });
    } catch (error) {
      logger.error(`Failed to delete transaction ${transactionId} for user ${req.user.id}:`, error);
      return res.status(500).json({
        error: 'Failed to delete transaction',
        message: 'Internal server error'
      });
    }
  });

  /**
   * Get transaction statistics
   */
  getTransactionStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const { fromDate, toDate } = req.query;

    try {
      // Build where clause
      const where: any = { userId: req.user.id };
      
      if (fromDate || toDate) {
        where.date = {};
        if (fromDate) where.date.gte = new Date(fromDate as string);
        if (toDate) where.date.lte = new Date(toDate as string);
      }

      // Get transaction statistics
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

      logger.info(`Retrieved transaction stats for user ${req.user.id}`);

      return res.json(stats);
    } catch (error) {
      logger.error(`Failed to get transaction stats for user ${req.user.id}:`, error);
      return res.status(500).json({
        error: 'Failed to retrieve transaction statistics',
        message: 'Internal server error'
      });
    }
  });
}

export const transactionsController = new TransactionsController();
