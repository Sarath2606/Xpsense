/**
 * Splitwise Expenses Controller
 * Handles expense creation, management, and calculations
 */

import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { io } from '../app';
import { FirebaseAuthRequest } from '../middleware/firebase-auth.middleware';
import { SplitwiseSplitService } from '../services/splitwise-split.service';

const prisma = new PrismaClient();

export class SplitwiseExpensesController {
  /**
   * Create a new expense in a group
   * POST /api/splitwise/groups/:groupId/expenses
   */
  static async createExpense(req: FirebaseAuthRequest, res: Response) {
    try {
      const { groupId } = req.params;
      const {
        payerId: incomingPayerId,
        amount,
        currency = "AUD",
        description,
        splitType,
        participants: incomingParticipants,
        shares,
        percents,
        date = new Date()
      } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Validate group membership
      const membership = await prisma.splitwiseGroupMember.findUnique({
        where: { 
          groupId_userId: { 
            groupId, 
            userId 
          } 
        }
      });

      if (!membership) {
        return res.status(403).json({ error: "Not a member of this group" });
      }

      // Normalize payer and participants: allow 'current_user' and missing payer
      const resolvedPayerId = (!incomingPayerId || incomingPayerId === 'current_user') ? userId : incomingPayerId;
      const participants = (Array.isArray(incomingParticipants) ? incomingParticipants : [])
        .map((p: string) => (p === 'current_user' ? userId : p))
        .filter(Boolean);

      // Validate input
      const validationErrors = SplitwiseSplitService.validateSplitInput({
        splitType,
        amount,
        participants,
        shares,
        percents
      });

      if (validationErrors.length > 0) {
        return res.status(400).json({ 
          error: "Invalid expense data", 
          details: validationErrors 
        });
      }

      // Validate that payer is a group member
      const payerMembership = await prisma.splitwiseGroupMember.findUnique({
        where: { 
          groupId_userId: { 
            groupId, 
            userId: resolvedPayerId 
          } 
        }
      });

      if (!payerMembership) {
        return res.status(400).json({ error: "Payer must be a group member" });
      }

      // Validate that all participants are group members
      const groupMembers = await prisma.splitwiseGroupMember.findMany({
        where: { groupId },
        select: { userId: true }
      });

      const memberIds = groupMembers.map(m => m.userId);
      const invalidParticipants = participants.filter((p: string) => !memberIds.includes(p));
      
      if (invalidParticipants.length > 0) {
        return res.status(400).json({ 
          error: "Some participants are not group members",
          invalidParticipants 
        });
      }

      // Compute expense shares
      const splitResults = SplitwiseSplitService.computeShares({
        splitType,
        amount,
        participants,
        shares,
        percents
      });

      // Create expense in transaction
      const expense = await prisma.$transaction(async (tx) => {
        // Create the expense
        const exp = await tx.splitwiseExpense.create({
          data: {
            groupId,
            payerId: resolvedPayerId,
            amount,
            currencyCode: currency.toUpperCase(),
            description: description?.trim(),
            splitType,
            date: new Date(date),
            createdBy: userId
          }
        });

        // Create expense shares
        await tx.splitwiseExpenseShare.createMany({
          data: splitResults.map(result => ({
            expenseId: exp.id,
            userId: result.participantId,
            shareAmount: result.shareAmount / 100, // Convert cents back to dollars for storage
            shareWeight: shares?.[participants.indexOf(result.participantId)] || null
          }))
        });

        // Log activity
        await tx.splitwiseActivityLog.create({
          data: {
            groupId,
            actorId: userId,
            type: "EXPENSE_CREATED",
            refId: exp.id,
            snapshotJson: {
              amount,
              description,
              splitType,
              participants,
              shares: splitResults.map(r => r.shareAmount),
              payerId: resolvedPayerId
            }
          }
        });

        return exp;
      });

      // Get the created expense with full details
      const expenseWithDetails = await prisma.splitwiseExpense.findUnique({
        where: { id: expense.id },
        include: {
          payer: { 
            select: { 
              id: true, 
              name: true 
            } 
          },
          creator: { 
            select: { 
              id: true, 
              name: true 
            } 
          },
          shares: {
            include: {
              user: { 
                select: { 
                  id: true, 
                  name: true 
                } 
              }
            }
          }
        }
      });

      // Emit realtime events to group room
      io.to(`group:${groupId}`).emit('expense:created', {
        message: "Expense created successfully",
        expense: {
          id: expenseWithDetails?.id,
          amount: Number(expenseWithDetails?.amount),
          currency: expenseWithDetails?.currencyCode,
          description: expenseWithDetails?.description,
          date: expenseWithDetails?.date,
          paidBy: expenseWithDetails?.payerId,
          groupId: expenseWithDetails?.groupId,
          splits: (expenseWithDetails?.shares || []).map((s: any) => ({ userId: s.userId, amount: Number(s.shareAmount) })),
          createdBy: expenseWithDetails?.createdBy
        }
      });
      io.to(`group:${groupId}`).emit('balances:updated', { groupId });

      res.status(201).json({
        message: "Expense created successfully",
        expense: expenseWithDetails
      });
    } catch (error) {
      console.error("Create expense error:", error);
      res.status(500).json({ error: "Failed to create expense" });
    }
  }

  /**
   * Get all expenses for a group
   * GET /api/splitwise/groups/:groupId/expenses
   */
  static async getGroupExpenses(req: FirebaseAuthRequest, res: Response) {
    try {
      const { groupId } = req.params;
      const { page = 1, limit = 20, sortBy = "date", sortOrder = "desc" } = req.query;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Validate group membership
      const membership = await prisma.splitwiseGroupMember.findUnique({
        where: { 
          groupId_userId: { 
            groupId, 
            userId 
          } 
        }
      });

      if (!membership) {
        return res.status(403).json({ error: "Not a member of this group" });
      }

      // Calculate pagination
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // Get expenses with pagination
      const [expenses, total] = await Promise.all([
        prisma.splitwiseExpense.findMany({
          where: { groupId },
          include: {
            payer: { 
              select: { 
                id: true, 
                name: true 
              } 
            },
            creator: { 
              select: { 
                id: true, 
                name: true 
              } 
            },
            shares: {
              include: {
                user: { 
                  select: { 
                    id: true, 
                    name: true 
                  } 
                }
              }
            }
          },
          orderBy: { [sortBy as string]: sortOrder },
          skip,
          take
        }),
        prisma.splitwiseExpense.count({
          where: { groupId }
        })
      ]);

      res.json({
        expenses,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error("Get expenses error:", error);
      res.status(500).json({ error: "Failed to fetch expenses" });
    }
  }

  /**
   * Get a specific expense by ID
   * GET /api/splitwise/expenses/:id
   */
  static async getExpense(req: FirebaseAuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const expense = await prisma.splitwiseExpense.findUnique({
        where: { id },
        include: {
          group: {
            select: {
              id: true,
              name: true,
              currencyCode: true
            }
          },
          payer: { 
            select: { 
              id: true, 
              name: true 
            } 
          },
          creator: { 
            select: { 
              id: true, 
              name: true 
            } 
          },
          shares: {
            include: {
              user: { 
                select: { 
                  id: true, 
                  name: true 
                } 
              }
            }
          }
        }
      });

      if (!expense) {
        return res.status(404).json({ error: "Expense not found" });
      }

      // Check if user is a member of the group
      const membership = await prisma.splitwiseGroupMember.findUnique({
        where: { 
          groupId_userId: { 
            groupId: expense.groupId, 
            userId 
          } 
        }
      });

      if (!membership) {
        return res.status(403).json({ error: "Not a member of this group" });
      }

      res.json({ expense });
    } catch (error) {
      console.error("Get expense error:", error);
      res.status(500).json({ error: "Failed to fetch expense" });
    }
  }

  /**
   * Update an existing expense
   * PUT /api/splitwise/expenses/:id
   */
  static async updateExpense(req: FirebaseAuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const {
        payerId,
        amount,
        currency,
        description,
        splitType,
        participants,
        shares,
        percents,
        date
      } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Get the expense
      const existingExpense = await prisma.splitwiseExpense.findUnique({
        where: { id },
        include: {
          group: {
            select: {
              id: true,
              currencyCode: true
            }
          }
        }
      });

      if (!existingExpense) {
        return res.status(404).json({ error: "Expense not found" });
      }

      // Check if user is a member of the group
      const membership = await prisma.splitwiseGroupMember.findUnique({
        where: { 
          groupId_userId: { 
            groupId: existingExpense.groupId, 
            userId 
          } 
        }
      });

      if (!membership) {
        return res.status(403).json({ error: "Not a member of this group" });
      }

      // Only creator or admin can update expense
      if (existingExpense.createdBy !== userId && membership.role !== "admin") {
        return res.status(403).json({ error: "Only the creator or admin can update this expense" });
      }

      // Validate input if provided
      if (amount || participants || splitType) {
        const validationErrors = SplitwiseSplitService.validateSplitInput({
          splitType: splitType || existingExpense.splitType,
          amount: amount || existingExpense.amount,
          participants: participants || [],
          shares,
          percents
        });

        if (validationErrors.length > 0) {
          return res.status(400).json({ 
            error: "Invalid expense data", 
            details: validationErrors 
          });
        }
      }

      // Update expense in transaction
      const updatedExpense = await prisma.$transaction(async (tx) => {
        // Update the expense
        const exp = await tx.splitwiseExpense.update({
          where: { id },
          data: {
            ...(payerId && { payerId }),
            ...(amount && { amount }),
            ...(currency && { currencyCode: currency.toUpperCase() }),
            ...(description !== undefined && { description: description?.trim() }),
            ...(splitType && { splitType }),
            ...(date && { date: new Date(date) })
          }
        });

        // If participants or split type changed, update shares
        if (participants || splitType || amount) {
          // Delete existing shares
          await tx.splitwiseExpenseShare.deleteMany({
            where: { expenseId: id }
          });

          // Compute new shares
          const splitResults = SplitwiseSplitService.computeShares({
            splitType: splitType || existingExpense.splitType,
            amount: amount || existingExpense.amount,
            participants: participants || [],
            shares,
            percents
          });

          // Create new shares
          await tx.splitwiseExpenseShare.createMany({
            data: splitResults.map(result => ({
              expenseId: id,
              userId: result.participantId,
              shareAmount: result.shareAmount / 100,
              shareWeight: shares?.[participants.indexOf(result.participantId)] || null
            }))
          });
        }

        // Log activity
        await tx.splitwiseActivityLog.create({
          data: {
            groupId: existingExpense.groupId,
            actorId: userId,
            type: "EXPENSE_UPDATED",
            refId: id,
            snapshotJson: {
              amount: amount || existingExpense.amount,
              description: description || existingExpense.description,
              splitType: splitType || existingExpense.splitType,
              participants: participants || [],
              payerId: payerId || existingExpense.payerId
            }
          }
        });

        return exp;
      });

      // Get updated expense with details
      const expenseWithDetails = await prisma.splitwiseExpense.findUnique({
        where: { id },
        include: {
          payer: { 
            select: { 
              id: true, 
              name: true 
            } 
          },
          creator: { 
            select: { 
              id: true, 
              name: true 
            } 
          },
          shares: {
            include: {
              user: { 
                select: { 
                  id: true, 
                  name: true 
                } 
              }
            }
          }
        }
      });

      res.json({
        message: "Expense updated successfully",
        expense: expenseWithDetails
      });
    } catch (error) {
      console.error("Update expense error:", error);
      res.status(500).json({ error: "Failed to update expense" });
    }
  }

  /**
   * Delete an expense
   * DELETE /api/splitwise/expenses/:id
   */
  static async deleteExpense(req: FirebaseAuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Get the expense
      const expense = await prisma.splitwiseExpense.findUnique({
        where: { id },
        include: {
          group: {
            select: {
              id: true
            }
          }
        }
      });

      if (!expense) {
        return res.status(404).json({ error: "Expense not found" });
      }

      // Check if user is a member of the group
      const membership = await prisma.splitwiseGroupMember.findUnique({
        where: { 
          groupId_userId: { 
            groupId: expense.groupId, 
            userId 
          } 
        }
      });

      if (!membership) {
        return res.status(403).json({ error: "Not a member of this group" });
      }

      // Only creator or admin can delete expense
      if (expense.createdBy !== userId && membership.role !== "admin") {
        return res.status(403).json({ error: "Only the creator or admin can delete this expense" });
      }

      // Delete expense in transaction
      await prisma.$transaction(async (tx) => {
        // Log activity before deletion
        await tx.splitwiseActivityLog.create({
          data: {
            groupId: expense.groupId,
            actorId: userId,
            type: "EXPENSE_DELETED",
            refId: id,
            snapshotJson: {
              amount: expense.amount,
              description: expense.description,
              splitType: expense.splitType,
              payerId: expense.payerId
            }
          }
        });

        // Delete the expense (cascade will handle shares)
        await tx.splitwiseExpense.delete({
          where: { id }
        });
      });

      res.json({ message: "Expense deleted successfully" });
    } catch (error) {
      console.error("Delete expense error:", error);
      res.status(500).json({ error: "Failed to delete expense" });
    }
  }

  /**
   * Get split type options for UI
   * GET /api/splitwise/expenses/split-types
   */
  static async getSplitTypes(req: FirebaseAuthRequest, res: Response) {
    try {
      const splitTypes = SplitwiseSplitService.getSplitTypeOptions();
      res.json({ splitTypes });
    } catch (error) {
      console.error("Get split types error:", error);
      res.status(500).json({ error: "Failed to fetch split types" });
    }
  }
}
