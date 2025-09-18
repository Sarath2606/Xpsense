"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SplitwiseInvitesController = void 0;
const client_1 = require("@prisma/client");
const crypto_1 = __importDefault(require("crypto"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const email_service_1 = require("../services/email.service");
const prisma = new client_1.PrismaClient();
class SplitwiseInvitesController {
    static async checkSmtpHealth(req, res) {
        try {
            const secure = (process.env.SMTP_SECURE || '').toLowerCase() === 'true';
            const smtpConfig = {
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: parseInt(process.env.SMTP_PORT || (secure ? '465' : '587')),
                user: process.env.SMTP_USER ? 'configured' : 'missing',
                from: process.env.SMTP_FROM ? 'configured' : 'missing',
                pass: process.env.SMTP_PASS ? 'configured' : 'missing',
                secure
            };
            const transporter = nodemailer_1.default.createTransport({
                host: smtpConfig.host,
                port: smtpConfig.port,
                secure: smtpConfig.secure,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                },
                connectionTimeout: parseInt(process.env.SMTP_CONNECTION_TIMEOUT || '30000'),
                greetingTimeout: parseInt(process.env.SMTP_GREETING_TIMEOUT || '30000'),
                socketTimeout: parseInt(process.env.SMTP_SOCKET_TIMEOUT || '60000'),
                tls: smtpConfig.secure ? undefined : {
                    rejectUnauthorized: false,
                    ciphers: 'SSLv3'
                }
            });
            try {
                await transporter.verify();
                res.json({
                    status: 'healthy',
                    smtp: smtpConfig,
                    message: 'SMTP configuration is working correctly'
                });
            }
            catch (verifyError) {
                res.status(500).json({
                    status: 'unhealthy',
                    smtp: smtpConfig,
                    error: verifyError.message
                });
            }
        }
        catch (error) {
            res.status(500).json({
                status: 'error',
                error: error.message
            });
        }
    }
    static async sendInvite(req, res) {
        try {
            const { id } = req.params;
            const { email, message } = req.body;
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
                return res.status(403).json({ error: "Only group admins can send invitations" });
            }
            const group = await prisma.splitwiseGroup.findUnique({
                where: { id },
                include: {
                    creator: {
                        select: { name: true, email: true }
                    }
                }
            });
            if (!group) {
                return res.status(404).json({ error: "Group not found" });
            }
            const existingUser = await prisma.user.findUnique({
                where: { email: email.trim().toLowerCase() }
            });
            if (existingUser) {
                const existingMember = await prisma.splitwiseGroupMember.findUnique({
                    where: {
                        groupId_userId: {
                            groupId: id,
                            userId: existingUser.id
                        }
                    }
                });
                if (existingMember) {
                    return res.status(400).json({ error: "User is already a member of this group" });
                }
            }
            const token = crypto_1.default.randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            const invitation = await prisma.splitwiseInvite.create({
                data: {
                    groupId: id,
                    email: email.trim().toLowerCase(),
                    token,
                    expiresAt,
                    invitedBy: userId,
                    message: message?.trim() || null
                }
            });
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const acceptUrl = `${frontendUrl}/splitwise/invite/accept?token=${token}`;
            email_service_1.EmailService.sendInvitationEmail({
                to: email.trim(),
                groupName: group.name,
                inviterName: group.creator.name || 'Group Admin',
                token,
                message: message?.trim(),
                groupId: id
            }).catch((err) => {
                console.error('Background email send failed:', err);
            });
            return res.status(201).json({
                message: "Invitation created; email delivery processing in background",
                invitation: {
                    id: invitation.id,
                    email: invitation.email,
                    expiresAt: invitation.expiresAt
                },
                acceptUrl
            });
        }
        catch (error) {
            console.error("Send invite error", error);
            return res.status(500).json({ error: "Failed to send invitation" });
        }
    }
    static async acceptInvite(req, res) {
        try {
            const { token } = req.body;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: "Authentication required" });
            }
            if (!token) {
                return res.status(400).json({ error: "Invitation token is required" });
            }
            const invitation = await prisma.splitwiseInvite.findFirst({
                where: {
                    token,
                    expiresAt: { gt: new Date() },
                    accepted: false
                },
                include: {
                    group: {
                        include: {
                            members: {
                                include: {
                                    user: {
                                        select: { id: true, name: true, email: true }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            if (!invitation) {
                return res.status(404).json({ error: "Invalid or expired invitation" });
            }
            const existingMember = await prisma.splitwiseGroupMember.findUnique({
                where: {
                    groupId_userId: {
                        groupId: invitation.groupId,
                        userId
                    }
                }
            });
            if (existingMember) {
                return res.status(400).json({ error: "You are already a member of this group" });
            }
            const newMember = await prisma.splitwiseGroupMember.create({
                data: {
                    groupId: invitation.groupId,
                    userId,
                    role: "member"
                },
                include: {
                    user: {
                        select: { id: true, name: true, email: true, firebaseUid: true }
                    }
                }
            });
            await prisma.splitwiseInvite.update({
                where: { id: invitation.id },
                data: { accepted: true, acceptedAt: new Date() }
            });
            res.json({
                message: "Successfully joined the group",
                group: invitation.group,
                member: newMember
            });
        }
        catch (error) {
            console.error("Accept invite error:", error);
            res.status(500).json({ error: "Failed to accept invitation" });
        }
    }
    static async getPendingInvites(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: "Authentication required" });
            }
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { email: true }
            });
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            const invitations = await prisma.splitwiseInvite.findMany({
                where: {
                    email: user.email,
                    expiresAt: { gt: new Date() },
                    accepted: false
                },
                include: {
                    group: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                            currencyCode: true,
                            creator: {
                                select: { name: true, email: true }
                            }
                        }
                    },
                    invitedByUser: {
                        select: { name: true, email: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
            res.json({ invitations });
        }
        catch (error) {
            console.error("Get pending invites error:", error);
            res.status(500).json({ error: "Failed to fetch pending invitations" });
        }
    }
    static async cancelInvite(req, res) {
        try {
            const { inviteId } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: "Authentication required" });
            }
            const invitation = await prisma.splitwiseInvite.findUnique({
                where: { id: inviteId },
                include: {
                    group: {
                        include: {
                            members: {
                                where: { userId }
                            }
                        }
                    }
                }
            });
            if (!invitation) {
                return res.status(404).json({ error: "Invitation not found" });
            }
            const isAdmin = invitation.group.members.some(member => member.userId === userId && member.role === "admin");
            const isInviter = invitation.invitedBy === userId;
            if (!isAdmin && !isInviter) {
                return res.status(403).json({ error: "You can only cancel invitations you sent or if you're a group admin" });
            }
            await prisma.splitwiseInvite.delete({
                where: { id: inviteId }
            });
            res.json({ message: "Invitation cancelled successfully" });
        }
        catch (error) {
            console.error("Cancel invite error:", error);
            res.status(500).json({ error: "Failed to cancel invitation" });
        }
    }
}
exports.SplitwiseInvitesController = SplitwiseInvitesController;
//# sourceMappingURL=splitwise-invites.controller.js.map