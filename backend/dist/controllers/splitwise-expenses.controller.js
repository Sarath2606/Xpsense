"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SplitwiseExpensesController = void 0;
const client_1 = require("@prisma/client");
const app_1 = require("../app");
const splitwise_split_service_1 = require("../services/splitwise-split.service");
const prisma = new client_1.PrismaClient();
class SplitwiseExpensesController {
    static async createExpense(req, res) {
        try {
            const { groupId } = req.params;
            const { payerId: incomingPayerId, amount, currency = "AUD", description, splitType, participants: incomingParticipants, shares, percents, date = new Date() } = req.body;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: "Authentication required" });
            }
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
            const resolvedPayerId = (!incomingPayerId || incomingPayerId === 'current_user') ? userId : incomingPayerId;
            const participants = (Array.isArray(incomingParticipants) ? incomingParticipants : [])
                .map((p) => (p === 'current_user' ? userId : p))
                .filter(Boolean);
            const validationErrors = splitwise_split_service_1.SplitwiseSplitService.validateSplitInput({
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
            const groupMembers = await prisma.splitwiseGroupMember.findMany({
                where: { groupId },
                select: { userId: true }
            });
            const memberIds = groupMembers.map(m => m.userId);
            const invalidParticipants = participants.filter((p) => !memberIds.includes(p));
            if (invalidParticipants.length > 0) {
                return res.status(400).json({
                    error: "Some participants are not group members",
                    invalidParticipants
                });
            }
            const splitResults = splitwise_split_service_1.SplitwiseSplitService.computeShares({
                splitType,
                amount,
                participants,
                shares,
                percents
            });
            const expense = await prisma.$transaction(async (tx) => {
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
                await tx.splitwiseExpenseShare.createMany({
                    data: splitResults.map(result => ({
                        expenseId: exp.id,
                        userId: result.participantId,
                        shareAmount: result.shareAmount / 100,
                        shareWeight: shares?.[participants.indexOf(result.participantId)] || null
                    }))
                });
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
            app_1.io.to(`group:${groupId}`).emit('expense:created', {
                message: "Expense created successfully",
                expense: {
                    id: expenseWithDetails?.id,
                    amount: Number(expenseWithDetails?.amount),
                    currency: expenseWithDetails?.currencyCode,
                    description: expenseWithDetails?.description,
                    date: expenseWithDetails?.date,
                    paidBy: expenseWithDetails?.payerId,
                    groupId: expenseWithDetails?.groupId,
                    splits: (expenseWithDetails?.shares || []).map((s) => ({ userId: s.userId, amount: Number(s.shareAmount) })),
                    createdBy: expenseWithDetails?.createdBy
                }
            });
            app_1.io.to(`group:${groupId}`).emit('balances:updated', { groupId });
            res.status(201).json({
                message: "Expense created successfully",
                expense: expenseWithDetails
            });
        }
        catch (error) {
            console.error("Create expense error:", error);
            res.status(500).json({ error: "Failed to create expense" });
        }
    }
    static async getGroupExpenses(req, res) {
        try {
            const { groupId } = req.params;
            const { page = 1, limit = 20, sortBy = "date", sortOrder = "desc" } = req.query;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: "Authentication required" });
            }
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
            const skip = (Number(page) - 1) * Number(limit);
            const take = Number(limit);
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
                    orderBy: { [sortBy]: sortOrder },
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
        }
        catch (error) {
            console.error("Get expenses error:", error);
            res.status(500).json({ error: "Failed to fetch expenses" });
        }
    }
    static async getExpense(req, res) {
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
        }
        catch (error) {
            console.error("Get expense error:", error);
            res.status(500).json({ error: "Failed to fetch expense" });
        }
    }
    static async updateExpense(req, res) {
        try {
            const { id } = req.params;
            const { payerId, amount, currency, description, splitType, participants, shares, percents, date } = req.body;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: "Authentication required" });
            }
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
            if (existingExpense.createdBy !== userId && membership.role !== "admin") {
                return res.status(403).json({ error: "Only the creator or admin can update this expense" });
            }
            if (amount || participants || splitType) {
                const validationErrors = splitwise_split_service_1.SplitwiseSplitService.validateSplitInput({
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
            const updatedExpense = await prisma.$transaction(async (tx) => {
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
                if (participants || splitType || amount) {
                    await tx.splitwiseExpenseShare.deleteMany({
                        where: { expenseId: id }
                    });
                    const splitResults = splitwise_split_service_1.SplitwiseSplitService.computeShares({
                        splitType: splitType || existingExpense.splitType,
                        amount: amount || existingExpense.amount,
                        participants: participants || [],
                        shares,
                        percents
                    });
                    await tx.splitwiseExpenseShare.createMany({
                        data: splitResults.map(result => ({
                            expenseId: id,
                            userId: result.participantId,
                            shareAmount: result.shareAmount / 100,
                            shareWeight: shares?.[participants.indexOf(result.participantId)] || null
                        }))
                    });
                }
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
        }
        catch (error) {
            console.error("Update expense error:", error);
            res.status(500).json({ error: "Failed to update expense" });
        }
    }
    static async deleteExpense(req, res) {
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
                            id: true
                        }
                    }
                }
            });
            if (!expense) {
                return res.status(404).json({ error: "Expense not found" });
            }
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
            if (expense.createdBy !== userId && membership.role !== "admin") {
                return res.status(403).json({ error: "Only the creator or admin can delete this expense" });
            }
            await prisma.$transaction(async (tx) => {
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
                await tx.splitwiseExpense.delete({
                    where: { id }
                });
            });
            res.json({ message: "Expense deleted successfully" });
        }
        catch (error) {
            console.error("Delete expense error:", error);
            res.status(500).json({ error: "Failed to delete expense" });
        }
    }
    static async getSplitTypes(req, res) {
        try {
            const splitTypes = splitwise_split_service_1.SplitwiseSplitService.getSplitTypeOptions();
            res.json({ splitTypes });
        }
        catch (error) {
            console.error("Get split types error:", error);
            res.status(500).json({ error: "Failed to fetch split types" });
        }
    }
}
exports.SplitwiseExpensesController = SplitwiseExpensesController;
//# sourceMappingURL=splitwise-expenses.controller.js.map