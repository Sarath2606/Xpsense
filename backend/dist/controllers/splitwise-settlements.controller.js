"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SplitwiseSettlementsController = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class SplitwiseSettlementsController {
    static async createSettlement(req, res) {
        try {
            const { groupId } = req.params;
            const { fromUserId, toUserId, amount, currency = "AUD", method, note } = req.body;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: "Authentication required" });
            }
            if (!fromUserId || !toUserId || !amount) {
                return res.status(400).json({
                    error: "fromUserId, toUserId, and amount are required"
                });
            }
            if (fromUserId === toUserId) {
                return res.status(400).json({
                    error: "Cannot settle with yourself"
                });
            }
            if (amount <= 0) {
                return res.status(400).json({
                    error: "Amount must be greater than 0"
                });
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
            const [fromMembership, toMembership] = await Promise.all([
                prisma.splitwiseGroupMember.findUnique({
                    where: {
                        groupId_userId: {
                            groupId,
                            userId: fromUserId
                        }
                    }
                }),
                prisma.splitwiseGroupMember.findUnique({
                    where: {
                        groupId_userId: {
                            groupId,
                            userId: toUserId
                        }
                    }
                })
            ]);
            if (!fromMembership || !toMembership) {
                return res.status(400).json({
                    error: "Both users must be members of the group"
                });
            }
            const settlement = await prisma.$transaction(async (tx) => {
                const sett = await tx.splitwiseSettlement.create({
                    data: {
                        groupId,
                        fromUserId,
                        toUserId,
                        amount,
                        currencyCode: currency.toUpperCase(),
                        method: method?.trim(),
                        note: note?.trim()
                    }
                });
                await tx.splitwiseActivityLog.create({
                    data: {
                        groupId,
                        actorId: userId,
                        type: "SETTLEMENT_RECORDED",
                        refId: sett.id,
                        snapshotJson: {
                            fromUserId,
                            toUserId,
                            amount,
                            currency,
                            method,
                            note
                        }
                    }
                });
                return sett;
            });
            const settlementWithDetails = await prisma.splitwiseSettlement.findUnique({
                where: { id: settlement.id },
                include: {
                    fromUser: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    toUser: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            });
            res.status(201).json({
                message: "Settlement recorded successfully",
                settlement: settlementWithDetails
            });
        }
        catch (error) {
            console.error("Create settlement error:", error);
            res.status(500).json({ error: "Failed to record settlement" });
        }
    }
    static async getGroupSettlements(req, res) {
        try {
            const { groupId } = req.params;
            const { page = 1, limit = 20, sortBy = "createdAt", sortOrder = "desc" } = req.query;
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
            const [settlements, total] = await Promise.all([
                prisma.splitwiseSettlement.findMany({
                    where: { groupId },
                    include: {
                        fromUser: {
                            select: {
                                id: true,
                                name: true
                            }
                        },
                        toUser: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    },
                    orderBy: { [sortBy]: sortOrder },
                    skip,
                    take
                }),
                prisma.splitwiseSettlement.count({
                    where: { groupId }
                })
            ]);
            res.json({
                settlements,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit))
                }
            });
        }
        catch (error) {
            console.error("Get settlements error:", error);
            res.status(500).json({ error: "Failed to fetch settlements" });
        }
    }
    static async getSettlement(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: "Authentication required" });
            }
            const settlement = await prisma.splitwiseSettlement.findUnique({
                where: { id },
                include: {
                    group: {
                        select: {
                            id: true,
                            name: true,
                            currencyCode: true
                        }
                    },
                    fromUser: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    toUser: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            });
            if (!settlement) {
                return res.status(404).json({ error: "Settlement not found" });
            }
            const membership = await prisma.splitwiseGroupMember.findUnique({
                where: {
                    groupId_userId: {
                        groupId: settlement.groupId,
                        userId
                    }
                }
            });
            if (!membership) {
                return res.status(403).json({ error: "Not a member of this group" });
            }
            res.json({ settlement });
        }
        catch (error) {
            console.error("Get settlement error:", error);
            res.status(500).json({ error: "Failed to fetch settlement" });
        }
    }
    static async updateSettlement(req, res) {
        try {
            const { id } = req.params;
            const { amount, currency, method, note } = req.body;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: "Authentication required" });
            }
            const existingSettlement = await prisma.splitwiseSettlement.findUnique({
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
            if (!existingSettlement) {
                return res.status(404).json({ error: "Settlement not found" });
            }
            const membership = await prisma.splitwiseGroupMember.findUnique({
                where: {
                    groupId_userId: {
                        groupId: existingSettlement.groupId,
                        userId
                    }
                }
            });
            if (!membership) {
                return res.status(403).json({ error: "Not a member of this group" });
            }
            if (membership.role !== "admin") {
                return res.status(403).json({ error: "Only group admins can update settlements" });
            }
            if (amount !== undefined && amount <= 0) {
                return res.status(400).json({ error: "Amount must be greater than 0" });
            }
            const updatedSettlement = await prisma.$transaction(async (tx) => {
                const sett = await tx.splitwiseSettlement.update({
                    where: { id },
                    data: {
                        ...(amount !== undefined && { amount }),
                        ...(currency && { currencyCode: currency.toUpperCase() }),
                        ...(method !== undefined && { method: method?.trim() }),
                        ...(note !== undefined && { note: note?.trim() })
                    }
                });
                await tx.splitwiseActivityLog.create({
                    data: {
                        groupId: existingSettlement.groupId,
                        actorId: userId,
                        type: "SETTLEMENT_UPDATED",
                        refId: id,
                        snapshotJson: {
                            amount: amount || existingSettlement.amount,
                            currency: currency || existingSettlement.currencyCode,
                            method: method || existingSettlement.method,
                            note: note || existingSettlement.note
                        }
                    }
                });
                return sett;
            });
            const settlementWithDetails = await prisma.splitwiseSettlement.findUnique({
                where: { id },
                include: {
                    fromUser: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    toUser: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            });
            res.json({
                message: "Settlement updated successfully",
                settlement: settlementWithDetails
            });
        }
        catch (error) {
            console.error("Update settlement error:", error);
            res.status(500).json({ error: "Failed to update settlement" });
        }
    }
    static async deleteSettlement(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: "Authentication required" });
            }
            const settlement = await prisma.splitwiseSettlement.findUnique({
                where: { id },
                include: {
                    group: {
                        select: {
                            id: true
                        }
                    }
                }
            });
            if (!settlement) {
                return res.status(404).json({ error: "Settlement not found" });
            }
            const membership = await prisma.splitwiseGroupMember.findUnique({
                where: {
                    groupId_userId: {
                        groupId: settlement.groupId,
                        userId
                    }
                }
            });
            if (!membership) {
                return res.status(403).json({ error: "Not a member of this group" });
            }
            if (membership.role !== "admin") {
                return res.status(403).json({ error: "Only group admins can delete settlements" });
            }
            await prisma.$transaction(async (tx) => {
                await tx.splitwiseActivityLog.create({
                    data: {
                        groupId: settlement.groupId,
                        actorId: userId,
                        type: "SETTLEMENT_DELETED",
                        refId: id,
                        snapshotJson: {
                            fromUserId: settlement.fromUserId,
                            toUserId: settlement.toUserId,
                            amount: settlement.amount,
                            currency: settlement.currencyCode,
                            method: settlement.method,
                            note: settlement.note
                        }
                    }
                });
                await tx.splitwiseSettlement.delete({
                    where: { id }
                });
            });
            res.json({ message: "Settlement deleted successfully" });
        }
        catch (error) {
            console.error("Delete settlement error:", error);
            res.status(500).json({ error: "Failed to delete settlement" });
        }
    }
    static async getUserSettlements(req, res) {
        try {
            const { groupId, userId: targetUserId } = req.params;
            const { page = 1, limit = 20 } = req.query;
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
            const [settlements, total] = await Promise.all([
                prisma.splitwiseSettlement.findMany({
                    where: {
                        groupId,
                        OR: [
                            { fromUserId: targetUserId },
                            { toUserId: targetUserId }
                        ]
                    },
                    include: {
                        fromUser: {
                            select: {
                                id: true,
                                name: true
                            }
                        },
                        toUser: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    },
                    orderBy: { createdAt: "desc" },
                    skip,
                    take
                }),
                prisma.splitwiseSettlement.count({
                    where: {
                        groupId,
                        OR: [
                            { fromUserId: targetUserId },
                            { toUserId: targetUserId }
                        ]
                    }
                })
            ]);
            res.json({
                settlements,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit))
                }
            });
        }
        catch (error) {
            console.error("Get user settlements error:", error);
            res.status(500).json({ error: "Failed to fetch user settlements" });
        }
    }
}
exports.SplitwiseSettlementsController = SplitwiseSettlementsController;
//# sourceMappingURL=splitwise-settlements.controller.js.map