"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SplitwiseGroupsController = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class SplitwiseGroupsController {
    static async createGroup(req, res) {
        try {
            const { name, description, currencyCode = "AUD", members = [] } = req.body;
            const userEmail = (req.user?.email || "").toLowerCase();
            const userDisplayName = req.user?.name || userEmail.split('@')[0] || "Xpenses User";
            const firebaseUid = req.user?.uid || req.user?.firebaseUid || undefined;
            if (!userEmail) {
                return res.status(401).json({ error: "Authentication required" });
            }
            if (!name || name.trim().length === 0) {
                return res.status(400).json({ error: "Group name is required" });
            }
            if (!Array.isArray(members)) {
                return res.status(400).json({ error: "Members must be an array" });
            }
            const result = await prisma.$transaction(async (tx) => {
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
                console.log('[createGroup] creatorUser.id:', creatorUser.id, 'email:', creatorUser.email);
                const group = await tx.splitwiseGroup.create({
                    data: {
                        name: name.trim(),
                        description: description?.trim(),
                        currencyCode: currencyCode.toUpperCase(),
                        createdBy: creatorUser.id
                    }
                });
                const membersToCreate = [
                    {
                        groupId: group.id,
                        userId: creatorUser.id,
                        role: "admin"
                    }
                ];
                console.log('Creating group with members:', members);
                for (const member of members) {
                    if (member.id === 'current_user' || member.email === req.user?.email || member.email === 'you@email.com') {
                        console.log('Skipping current user:', member.email);
                        continue;
                    }
                    console.log('Looking for user with email:', member.email);
                    let user = await tx.user.findUnique({
                        where: { email: member.email.toLowerCase() }
                    });
                    if (!user) {
                        console.log('User not found, creating placeholder user for:', member.email);
                        user = await tx.user.create({
                            data: {
                                email: member.email.toLowerCase(),
                                name: member.name || member.email.split('@')[0],
                                firebaseUid: `placeholder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
                console.log('Creating members:', membersToCreate.length, 'members');
                await tx.splitwiseGroupMember.createMany({
                    data: membersToCreate,
                    skipDuplicates: true
                });
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
        }
        catch (error) {
            console.error("Create group error:", error);
            res.status(500).json({ error: "Failed to create group" });
        }
    }
    static async getMyGroups(req, res) {
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
        }
        catch (error) {
            console.error("Get groups error:", error);
            res.status(500).json({ error: "Failed to fetch groups" });
        }
    }
    static async getGroupDetails(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: "Authentication required" });
            }
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
                        take: 10
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
        }
        catch (error) {
            console.error("Get group details error:", error);
            res.status(500).json({ error: "Failed to fetch group details" });
        }
    }
    static async updateGroup(req, res) {
        try {
            const { id } = req.params;
            const { name, description, currencyCode } = req.body;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: "Authentication required" });
            }
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
            if (name !== undefined && (!name || name.trim().length === 0)) {
                return res.status(400).json({ error: "Group name cannot be empty" });
            }
            const updateData = {};
            if (name !== undefined)
                updateData.name = name.trim();
            if (description !== undefined)
                updateData.description = description?.trim();
            if (currencyCode !== undefined)
                updateData.currencyCode = currencyCode.toUpperCase();
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
        }
        catch (error) {
            console.error("Update group error:", error);
            res.status(500).json({ error: "Failed to update group" });
        }
    }
    static async deleteGroup(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: "Authentication required" });
            }
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
            await prisma.splitwiseGroup.delete({
                where: { id }
            });
            res.json({ message: "Group deleted successfully" });
        }
        catch (error) {
            console.error("Delete group error:", error);
            res.status(500).json({ error: "Failed to delete group" });
        }
    }
    static async addMember(req, res) {
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
            const user = await prisma.user.findUnique({
                where: { email: email.trim().toLowerCase() }
            });
            if (!user) {
                return res.status(404).json({ error: "User not found with this email" });
            }
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
        }
        catch (error) {
            console.error("Add member error:", error);
            res.status(500).json({ error: "Failed to add member" });
        }
    }
    static async removeMember(req, res) {
        try {
            const { id, memberId } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: "Authentication required" });
            }
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
            await prisma.splitwiseGroupMember.delete({
                where: {
                    groupId_userId: {
                        groupId: id,
                        userId: memberId
                    }
                }
            });
            res.json({ message: "Member removed successfully" });
        }
        catch (error) {
            console.error("Remove member error:", error);
            res.status(500).json({ error: "Failed to remove member" });
        }
    }
    static async updateMemberRole(req, res) {
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
        }
        catch (error) {
            console.error("Update member role error:", error);
            res.status(500).json({ error: "Failed to update member role" });
        }
    }
}
exports.SplitwiseGroupsController = SplitwiseGroupsController;
//# sourceMappingURL=splitwise-groups.controller.js.map