import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { FirebaseAuthRequest } from '../middleware/firebase-auth.middleware';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { EmailService } from '../services/email.service';

const prisma = new PrismaClient();

export class SplitwiseInvitesController {
  /**
   * Check SMTP configuration health
   * GET /api/splitwise/invites/health
   */
  static async checkSmtpHealth(req: Request, res: Response) {
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

      const transporter = nodemailer.createTransport({
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
      } catch (verifyError) {
        res.status(500).json({
          status: 'unhealthy',
          smtp: smtpConfig,
          error: (verifyError as Error).message
        });
      }
    } catch (error) {
      res.status(500).json({
        status: 'error',
        error: (error as Error).message
      });
    }
  }

  /**
   * Send invitation to join a group
   * POST /api/splitwise/groups/:id/invites
   */
  static async sendInvite(req: FirebaseAuthRequest, res: Response) {
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

      // Generate and store invitation
      const token = crypto.randomBytes(32).toString('hex');
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

      // Build accept URL to return to client regardless of email delivery
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const acceptUrl = `${frontendUrl}/splitwise/invite/accept?token=${token}`;

      // Fire-and-forget email sending so the API responds immediately
      console.log('📧 Attempting to send invitation email to:', email.trim());
      EmailService.sendInvitationEmail({
        to: email.trim(),
        groupName: group.name,
        inviterName: group.creator.name || 'Group Admin',
        token,
        message: message?.trim(),
        groupId: id
      }).then(() => {
        console.log('✅ Email sent successfully to:', email.trim());
      }).catch((err) => {
        console.error('❌ Background email send failed for:', email.trim(), err);
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
    } catch (error) {
      console.error("Send invite error", error);
      return res.status(500).json({ error: "Failed to send invitation" });
    }
  }

  /**
   * Accept invitation to join a group
   * POST /api/splitwise/invites/accept
   */
  static async acceptInvite(req: FirebaseAuthRequest, res: Response) {
    try {
      const { token } = req.body;
      const userId = req.user?.id;

      console.log('🎯 Accept invitation request:', { 
        token: token?.substring(0, 8) + '...', 
        userId, 
        userEmail: req.user?.email 
      });

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
        console.log('❌ Invitation not found or expired for token:', token?.substring(0, 8) + '...');
        return res.status(404).json({ error: "Invalid or expired invitation" });
      }

      console.log('✅ Invitation found:', { 
        invitationEmail: invitation.email, 
        groupId: invitation.groupId,
        groupName: invitation.group.name 
      });

      // Verify that the logged-in user's email matches the invitation email
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true }
      });

      if (!currentUser) {
        console.log('❌ Current user not found for userId:', userId);
        return res.status(401).json({ error: "User not found" });
      }

      // Normalize emails for comparison (handle Gmail dot/plus aliases)
      const normalizeEmail = (email: string) => {
        const lower = (email || '').toLowerCase();
        const [local, domain] = lower.split('@');
        if (!local || !domain) return lower;
        const isGmail = domain === 'gmail.com' || domain === 'googlemail.com';
        if (!isGmail) return lower;
        // Remove everything after '+' and remove dots in local part for Gmail
        const localWithoutPlus = local.split('+')[0];
        const localWithoutDots = localWithoutPlus.replace(/\./g, '');
        return `${localWithoutDots}@gmail.com`;
      };

      const currentNormalized = normalizeEmail(currentUser.email);
      const invitedNormalized = normalizeEmail(invitation.email);

      console.log('🔍 Email comparison (normalized):', {
        currentUserEmail: currentUser.email,
        invitationEmail: invitation.email,
        currentNormalized,
        invitedNormalized,
        match: currentNormalized === invitedNormalized
      });

      if (currentNormalized !== invitedNormalized) {
        console.log('❌ Email mismatch - invitation sent to different email');
        return res.status(403).json({ 
          error: "This invitation was sent to a different email address. Please log in with the email address that received the invitation." 
        });
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

      console.log('🎉 Successfully added user to group:', {
        userId,
        userEmail: currentUser.email,
        groupId: invitation.groupId,
        groupName: invitation.group.name
      });

      res.json({
        message: "Successfully joined the group",
        group: invitation.group,
        member: newMember
      });
    } catch (error) {
      console.error("Accept invite error:", error);
      res.status(500).json({ error: "Failed to accept invitation" });
    }
  }

  /**
   * Get pending invitations for a user
   * GET /api/splitwise/invites/pending
   */
  static async getPendingInvites(req: FirebaseAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Get user's email
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true }
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get pending invitations for user's email
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
    } catch (error) {
      console.error("Get pending invites error:", error);
      res.status(500).json({ error: "Failed to fetch pending invitations" });
    }
  }

  /**
   * Cancel/delete an invitation
   * DELETE /api/splitwise/invites/:inviteId
   */
  static async cancelInvite(req: FirebaseAuthRequest, res: Response) {
    try {
      const { inviteId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Find invitation
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

      // Check if user is admin of the group or the one who sent the invitation
      const isAdmin = invitation.group.members.some(member => 
        member.userId === userId && member.role === "admin"
      );
      const isInviter = invitation.invitedBy === userId;

      if (!isAdmin && !isInviter) {
        return res.status(403).json({ error: "You can only cancel invitations you sent or if you're a group admin" });
      }

      // Delete invitation
      await prisma.splitwiseInvite.delete({
        where: { id: inviteId }
      });

      res.json({ message: "Invitation cancelled successfully" });
    } catch (error) {
      console.error("Cancel invite error:", error);
      res.status(500).json({ error: "Failed to cancel invitation" });
    }
  }

}
