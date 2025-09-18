"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SplitwiseInvitesController = void 0;
const client_1 = require("@prisma/client");
const crypto_1 = __importDefault(require("crypto"));
const nodemailer_1 = __importDefault(require("nodemailer"));
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
            SplitwiseInvitesController.sendInvitationEmail({
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
    static async sendInvitationEmail({ to, groupName, inviterName, token, message, groupId }) {
        try {
            const secure = (process.env.SMTP_SECURE || '').toLowerCase() === 'true';
            const transporter = nodemailer_1.default.createTransport({
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: parseInt(process.env.SMTP_PORT || (secure ? '465' : '587')),
                secure: secure,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                },
                connectionTimeout: parseInt(process.env.SMTP_CONNECTION_TIMEOUT || '30000'),
                greetingTimeout: parseInt(process.env.SMTP_GREETING_TIMEOUT || '30000'),
                socketTimeout: parseInt(process.env.SMTP_SOCKET_TIMEOUT || '60000'),
                tls: secure ? undefined : {
                    rejectUnauthorized: false,
                    ciphers: 'SSLv3'
                }
            });
            try {
                await transporter.verify();
                console.log('SMTP transporter verified successfully with host:', process.env.SMTP_HOST || 'smtp.gmail.com');
            }
            catch (verifyError) {
                console.error('SMTP transporter verification failed:', {
                    code: verifyError?.code,
                    command: verifyError?.command,
                    response: verifyError?.response,
                    message: verifyError?.message,
                });
            }
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const acceptUrl = `${frontendUrl}/splitwise/invite/accept?token=${token}`;
            const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">You're Invited!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Join the expense sharing group</p>
          </div>
          <div style="padding: 30px; background: white;">
            <h2 style="color: #333; margin-bottom: 20px;">${groupName}</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              <strong>${inviterName}</strong> has invited you to join their expense sharing group on Xpenses.
            </p>
            ${message ? `
              <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #667eea; margin-bottom: 20px;">
                <p style="margin: 0; color: #555; font-style: italic;">"${message}"</p>
              </div>
            ` : ''}
            <div style="text-align: center; margin: 30px 0;">
              <a href="${acceptUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold; 
                        display: inline-block;">
                Accept Invitation
              </a>
            </div>
            <p style="color: #999; font-size: 14px; text-align: center;">
              This invitation will expire in 7 days.<br>
              If you don't have an account, you'll be prompted to create one when you accept.
            </p>
          </div>
          <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p style="margin: 0;">
              This invitation was sent from Xpenses - Your Personal Finance Manager<br>
              If you didn't expect this invitation, you can safely ignore this email.
            </p>
          </div>
        </div>
      `;
            let retryCount = 0;
            const maxRetries = 3;
            let lastError;
            while (retryCount < maxRetries) {
                try {
                    await transporter.sendMail({
                        from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@xpenses.com',
                        to,
                        subject: `You're invited to join "${groupName}" on Xpenses`,
                        html: emailContent
                    });
                    console.log(`Invitation email sent to ${to} for group ${groupName} (attempt ${retryCount + 1})`);
                    return;
                }
                catch (sendError) {
                    lastError = sendError;
                    retryCount++;
                    if (retryCount < maxRetries) {
                        console.log(`Email send attempt ${retryCount} failed, retrying in ${retryCount * 2} seconds...`);
                        await new Promise(resolve => setTimeout(resolve, retryCount * 2000));
                    }
                }
            }
            throw lastError;
        }
        catch (error) {
            const errAny = error;
            console.error('Failed to send invitation email:', {
                message: errAny?.message,
                code: errAny?.code,
                command: errAny?.command,
                response: errAny?.response,
                responseCode: errAny?.responseCode,
                stack: errAny?.stack,
            });
        }
    }
}
exports.SplitwiseInvitesController = SplitwiseInvitesController;
//# sourceMappingURL=splitwise-invites.controller.js.map