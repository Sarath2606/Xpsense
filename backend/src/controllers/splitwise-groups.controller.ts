/**
 * Splitwise Groups Controller
 * Handles group creation, management, and member operations
 */

import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { FirebaseAuthRequest } from '../middleware/firebase-auth.middleware';

const prisma = new PrismaClient();

export class SplitwiseGroupsController {
  /**
   * Create a new expense sharing group
   * POST /api/splitwise/groups
   */
  static async createGroup(req: FirebaseAuthRequest, res: Response) {
    try {
      const { name, description, currencyCode = "AUD", members = [] } = req.body;
      const userEmail = (req.user?.email || "").toLowerCase();
      const userDisplayName = req.user?.name || userEmail.split('@')[0] || "Xpenses User";
      const firebaseUid = (req.user as any)?.uid || (req.user as any)?.firebaseUid || undefined;

      if (!userEmail) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Validate input
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: "Group name is required" });
      }

      // Validate members array
      if (!Array.isArray(members)) {
        return res.status(400).json({ error: "Members must be an array" });
      }

      // Start a transaction to create group and add all members
      const result = await prisma.$transaction(async (tx) => {
        // Upsert creator inside the same transaction to satisfy FK reliably
        const creatorUser = await tx.user.upsert({
          where: { email: userEmail },
          update: {
            name: userDisplayName,
            firebaseUid
          },
          create: {
            email: userEmail,
            name: userDisplayName,
            firebaseUid
          }
        });

        // Safety check log
        console.log('[createGroup] creatorUser.id:', creatorUser.id, 'email:', creatorUser.email);

        // Create the group first (use the created user ID directly)
        const group = await tx.splitwiseGroup.create({
          data: {
            name: name.trim(),
            description: description?.trim(),
            currencyCode: currencyCode.toUpperCase(),
            createdBy: creatorUser.id
          }
        });

        // Prepare members to add (including the creator as admin)
        const membersToCreate = [
          {
            groupId: group.id,
            userId: creatorUser.id,
            role: "admin"
          }
        ];

        console.log('Creating group with members:', members);

        // Add other members if provided
        for (const member of members) {
          // Skip the current user if they're in the members array
          if (member.id === 'current_user' || member.email === req.user?.email || member.email === 'you@email.com') {
            console.log('Skipping current user:', member.email);
            continue;
          }

          console.log('Looking for user with email:', member.email);

          // Find user by email
          let user = await tx.user.findUnique({
            where: { email: member.email.toLowerCase() }
          });

          // If user doesn't exist, create a placeholder user for now
          // In a real app, you might want to send an invite instead
          if (!user) {
            console.log('User not found, creating placeholder user for:', member.email);
            user = await tx.user.create({
              data: {
                email: member.email.toLowerCase(),
                name: member.name || member.email.split('@')[0],
                firebaseUid: `placeholder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                // Add other required fields with defaults
                createdAt: new Date(),
                updatedAt: new Date()
              }
            });
          }

          if (user) {
            console.log('Adding user to group:', user.email);
            membersToCreate.push({
              groupId: group.id,
              userId: user.id,
              role: member.role || "member"
            });
          }
        }

        // Create all members
        console.log('Creating members:', membersToCreate.length, 'members');
        await tx.splitwiseGroupMember.createMany({
          data: membersToCreate,
          skipDuplicates: true
        });

        // Return the group with all members
        return await tx.splitwiseGroup.findUnique({
          where: { id: group.id },
          include: {
            members: {
              include: {
                user: {
                  select: { 
                    id: true, 
                    name: true, 
                    email: true, 
                    firebaseUid: true 
                  }
                }
              }
            },
            creator: {
              select: { 
                id: true, 
                name: true, 
                email: true 
              }
            }
          }
        });
      });

      res.status(201).json({
        message: "Group created successfully",
        group: result
      });
    } catch (error) {
      console.error("Create group error:", error);
      res.status(500).json({ error: "Failed to create group" });
    }
  }

  /**
   * Get all groups where the user is a member
   * GET /api/splitwise/groups
   */
  static async getMyGroups(req: FirebaseAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const groups = await prisma.splitwiseGroup.findMany({
        where: {
          members: {
            some: { userId }
          }
        },
        include: {
          members: {
            include: {
              user: {
                select: { 
                  id: true, 
                  name: true, 
                  email: true, 
                  firebaseUid: true 
                }
              }
            }
          },
          creator: {
            select: { 
              id: true, 
              name: true, 
              email: true 
            }
          },
          expenses: {
            select: {
              id: true,
              amount: true,
              description: true,
              payerId: true,
              date: true
            }
          },
          _count: {
            select: {
              expenses: true,
              members: true
            }
          }
        },
        orderBy: { updatedAt: "desc" }
      });

      res.json({
        groups,
        total: groups.length
      });
    } catch (error) {
      console.error("Get groups error:", error);
      res.status(500).json({ error: "Failed to fetch groups" });
    }
  }

  /**
   * Get detailed information about a specific group
   * GET /api/splitwise/groups/:id
   */
  static async getGroupDetails(req: FirebaseAuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Check if user is a member of the group
      const membership = await prisma.splitwiseGroupMember.findUnique({
        where: { 
          groupId_userId: { 
            groupId: id, 
            userId 
          } 
        }
      });

      if (!membership) {
        return res.status(403).json({ error: "Not a member of this group" });
      }

      const group = await prisma.splitwiseGroup.findUnique({
        where: { id },
        include: {
          members: {
            include: {
              user: {
                select: { 
                  id: true, 
                  name: true, 
                  email: true, 
                  firebaseUid: true 
                }
              }
            }
          },
          creator: {
            select: { 
              id: true, 
              name: true, 
              email: true 
            }
          },
          expenses: {
            include: {
              payer: { 
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
            orderBy: { date: "desc" },
            take: 10 // Limit to recent expenses
          },
          _count: {
            select: {
              expenses: true,
              members: true,
              settlements: true
            }
          }
        }
      });

      if (!group) {
        return res.status(404).json({ error: "Group not found" });
      }

      res.json({ group });
    } catch (error) {
      console.error("Get group details error:", error);
      res.status(500).json({ error: "Failed to fetch group details" });
    }
  }

  /**
   * Update group information (name, description, currency)
   * PUT /api/splitwise/groups/:id
   */
  static async updateGroup(req: FirebaseAuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, currencyCode } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Check if user is admin of the group
      const membership = await prisma.splitwiseGroupMember.findUnique({
        where: { 
          groupId_userId: { 
            groupId: id, 
            userId 
          } 
        }
      });

      if (!membership || membership.role !== "admin") {
        return res.status(403).json({ error: "Only group admins can update group details" });
      }

      // Validate input
      if (name !== undefined && (!name || name.trim().length === 0)) {
        return res.status(400).json({ error: "Group name cannot be empty" });
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name.trim();
      if (description !== undefined) updateData.description = description?.trim();
      if (currencyCode !== undefined) updateData.currencyCode = currencyCode.toUpperCase();

      const group = await prisma.splitwiseGroup.update({
        where: { id },
        data: updateData,
        include: {
          members: {
            include: {
              user: {
                select: { 
                  id: true, 
                  name: true, 
                  email: true, 
                  firebaseUid: true 
                }
              }
            }
          },
          creator: {
            select: { 
              id: true, 
              name: true, 
              email: true 
            }
          }
        }
      });

      res.json({
        message: "Group updated successfully",
        group
      });
    } catch (error) {
      console.error("Update group error:", error);
      res.status(500).json({ error: "Failed to update group" });
    }
  }

  /**
   * Delete a group (only by admin)
   * DELETE /api/splitwise/groups/:id
   */
  static async deleteGroup(req: FirebaseAuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Check if user is admin of the group
      const membership = await prisma.splitwiseGroupMember.findUnique({
        where: { 
          groupId_userId: { 
            groupId: id, 
            userId 
          } 
        }
      });

      if (!membership || membership.role !== "admin") {
        return res.status(403).json({ error: "Only group admins can delete the group" });
      }

      // Delete group (cascade will handle related records)
      await prisma.splitwiseGroup.delete({
        where: { id }
      });

      res.json({ message: "Group deleted successfully" });
    } catch (error) {
      console.error("Delete group error:", error);
      res.status(500).json({ error: "Failed to delete group" });
    }
  }

  /**
   * Add a member to the group by email
   * POST /api/splitwise/groups/:id/members
   */
  static async addMember(req: FirebaseAuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { email, role = "member" } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      if (!email || !email.trim()) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Check if user is admin of the group
      const membership = await prisma.splitwiseGroupMember.findUnique({
        where: { 
          groupId_userId: { 
            groupId: id, 
            userId 
          } 
        }
      });

      if (!membership || membership.role !== "admin") {
        return res.status(403).json({ error: "Only group admins can add members" });
      }

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() }
      });

      if (!user) {
        return res.status(404).json({ error: "User not found with this email" });
      }

      // Check if user is already a member
      const existingMember = await prisma.splitwiseGroupMember.findUnique({
        where: { 
          groupId_userId: { 
            groupId: id, 
            userId: user.id 
          } 
        }
      });

      if (existingMember) {
        return res.status(400).json({ error: "User is already a member of this group" });
      }

      // Add member to group
      const newMember = await prisma.splitwiseGroupMember.create({
        data: {
          groupId: id,
          userId: user.id,
          role
        },
        include: {
          user: {
            select: { 
              id: true, 
              name: true, 
              email: true, 
              firebaseUid: true 
            }
          }
        }
      });

      res.status(201).json({
        message: "Member added successfully",
        member: newMember
      });
    } catch (error) {
      console.error("Add member error:", error);
      res.status(500).json({ error: "Failed to add member" });
    }
  }

  /**
   * Remove a member from the group
   * DELETE /api/splitwise/groups/:id/members/:memberId
   */
  static async removeMember(req: FirebaseAuthRequest, res: Response) {
    try {
      const { id, memberId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Check if user is admin of the group
      const membership = await prisma.splitwiseGroupMember.findUnique({
        where: { 
          groupId_userId: { 
            groupId: id, 
            userId 
          } 
        }
      });

      if (!membership || membership.role !== "admin") {
        return res.status(403).json({ error: "Only group admins can remove members" });
      }

      // Prevent removing the last admin
      if (memberId === userId) {
        const adminCount = await prisma.splitwiseGroupMember.count({
          where: {
            groupId: id,
            role: "admin"
          }
        });

        if (adminCount <= 1) {
          return res.status(400).json({ error: "Cannot remove the last admin from the group" });
        }
      }

      // Remove member
      await prisma.splitwiseGroupMember.delete({
        where: { 
          groupId_userId: { 
            groupId: id, 
            userId: memberId 
          } 
        }
      });

      res.json({ message: "Member removed successfully" });
    } catch (error) {
      console.error("Remove member error:", error);
      res.status(500).json({ error: "Failed to remove member" });
    }
  }

  /**
   * Update member role
   * PATCH /api/splitwise/groups/:id/members/:memberId
   */
  static async updateMemberRole(req: FirebaseAuthRequest, res: Response) {
    try {
      const { id, memberId } = req.params;
      const { role } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      if (!role || !["admin", "member"].includes(role)) {
        return res.status(400).json({ error: "Valid role (admin or member) is required" });
      }

      // Check if user is admin of the group
      const membership = await prisma.splitwiseGroupMember.findUnique({
        where: { 
          groupId_userId: { 
            groupId: id, 
            userId 
          } 
        }
      });

      if (!membership || membership.role !== "admin") {
        return res.status(403).json({ error: "Only group admins can update member roles" });
      }

      // Prevent demoting the last admin
      if (role === "member" && memberId === userId) {
        const adminCount = await prisma.splitwiseGroupMember.count({
          where: {
            groupId: id,
            role: "admin"
          }
        });

        if (adminCount <= 1) {
          return res.status(400).json({ error: "Cannot demote the last admin from the group" });
        }
      }

      // Update member role
      const updatedMember = await prisma.splitwiseGroupMember.update({
        where: { 
          groupId_userId: { 
            groupId: id, 
            userId: memberId 
          } 
        },
        data: { role },
        include: {
          user: {
            select: { 
              id: true, 
              name: true, 
              email: true, 
              firebaseUid: true 
            }
          }
        }
      });

      res.json({
        message: "Member role updated successfully",
        member: updatedMember
      });
    } catch (error) {
      console.error("Update member role error:", error);
      res.status(500).json({ error: "Failed to update member role" });
    }
  }
}
