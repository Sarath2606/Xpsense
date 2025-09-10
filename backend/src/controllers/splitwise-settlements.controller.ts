/**
 * Splitwise Settlements Controller
 * Handles settlement creation, management, and tracking
 */

import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { FirebaseAuthRequest } from '../middleware/firebase-auth.middleware';

const prisma = new PrismaClient();

export class SplitwiseSettlementsController {
  /**
   * Record a settlement (payment) between users
   * POST /api/splitwise/groups/:groupId/settlements
   */
  static async createSettlement(req: FirebaseAuthRequest, res: Response) {
    try {
      const { groupId } = req.params;
      const {
        fromUserId,
        toUserId,
        amount,
        currency = "AUD",
        method,
        note
      } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Validate input
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

      // Validate that both users are group members
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

      // Create settlement in transaction
      const settlement = await prisma.$transaction(async (tx) => {
        // Create the settlement
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

        // Log activity
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

      // Get settlement with user details
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
    } catch (error) {
      console.error("Create settlement error:", error);
      res.status(500).json({ error: "Failed to record settlement" });
    }
  }

  /**
   * Get all settlements for a group
   * GET /api/splitwise/groups/:groupId/settlements
   */
  static async getGroupSettlements(req: FirebaseAuthRequest, res: Response) {
    try {
      const { groupId } = req.params;
      const { page = 1, limit = 20, sortBy = "createdAt", sortOrder = "desc" } = req.query;
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

      // Get settlements with pagination
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
          orderBy: { [sortBy as string]: sortOrder },
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
    } catch (error) {
      console.error("Get settlements error:", error);
      res.status(500).json({ error: "Failed to fetch settlements" });
    }
  }

  /**
   * Get a specific settlement by ID
   * GET /api/splitwise/settlements/:id
   */
  static async getSettlement(req: FirebaseAuthRequest, res: Response) {
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

      // Check if user is a member of the group
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
    } catch (error) {
      console.error("Get settlement error:", error);
      res.status(500).json({ error: "Failed to fetch settlement" });
    }
  }

  /**
   * Update a settlement
   * PUT /api/splitwise/settlements/:id
   */
  static async updateSettlement(req: FirebaseAuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const {
        amount,
        currency,
        method,
        note
      } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Get the settlement
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

      // Check if user is a member of the group
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

      // Only admin can update settlements
      if (membership.role !== "admin") {
        return res.status(403).json({ error: "Only group admins can update settlements" });
      }

      // Validate amount if provided
      if (amount !== undefined && amount <= 0) {
        return res.status(400).json({ error: "Amount must be greater than 0" });
      }

      // Update settlement in transaction
      const updatedSettlement = await prisma.$transaction(async (tx) => {
        // Update the settlement
        const sett = await tx.splitwiseSettlement.update({
          where: { id },
          data: {
            ...(amount !== undefined && { amount }),
            ...(currency && { currencyCode: currency.toUpperCase() }),
            ...(method !== undefined && { method: method?.trim() }),
            ...(note !== undefined && { note: note?.trim() })
          }
        });

        // Log activity
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

      // Get updated settlement with details
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
    } catch (error) {
      console.error("Update settlement error:", error);
      res.status(500).json({ error: "Failed to update settlement" });
    }
  }

  /**
   * Delete a settlement
   * DELETE /api/splitwise/settlements/:id
   */
  static async deleteSettlement(req: FirebaseAuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Get the settlement
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

      // Check if user is a member of the group
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

      // Only admin can delete settlements
      if (membership.role !== "admin") {
        return res.status(403).json({ error: "Only group admins can delete settlements" });
      }

      // Delete settlement in transaction
      await prisma.$transaction(async (tx) => {
        // Log activity before deletion
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

        // Delete the settlement
        await tx.splitwiseSettlement.delete({
          where: { id }
        });
      });

      res.json({ message: "Settlement deleted successfully" });
    } catch (error) {
      console.error("Delete settlement error:", error);
      res.status(500).json({ error: "Failed to delete settlement" });
    }
  }

  /**
   * Get settlements involving a specific user
   * GET /api/splitwise/groups/:groupId/settlements/user/:userId
   */
  static async getUserSettlements(req: FirebaseAuthRequest, res: Response) {
    try {
      const { groupId, userId: targetUserId } = req.params;
      const { page = 1, limit = 20 } = req.query;
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

      // Get settlements involving the target user
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
    } catch (error) {
      console.error("Get user settlements error:", error);
      res.status(500).json({ error: "Failed to fetch user settlements" });
    }
  }
}
