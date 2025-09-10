import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { FirebaseAuthRequest } from '../middleware/firebase-auth.middleware';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

export class SplitwiseInvitesController {
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
        return res.status(403).json({ error: "Only group admins can send invitations" });
      }

      // Get group details
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

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() }
      });

      // Check if user is already a member
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

      // Generate invitation token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      // Create invitation record
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

      // Send invitation email
      await SplitwiseInvitesController.sendInvitationEmail({
        to: email.trim(),
        groupName: group.name,
        inviterName: group.creator.name || 'Group Admin',
        token,
        message: message?.trim(),
        groupId: id
      });

      res.status(201).json({
        message: "Invitation sent successfully",
        invitation: {
          id: invitation.id,
          email: invitation.email,
          expiresAt: invitation.expiresAt
        }
      });
    } catch (error) {
      console.error("Send invite error:", error);
      res.status(500).json({ error: "Failed to send invitation" });
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

      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      if (!token) {
        return res.status(400).json({ error: "Invitation token is required" });
      }

      // Find invitation
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

      // Check if user is already a member
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

      // Add user to group
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

      // Mark invitation as accepted
      await prisma.splitwiseInvite.update({
        where: { id: invitation.id },
        data: { accepted: true, acceptedAt: new Date() }
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

  /**
   * Send invitation email
   */
  private static async sendInvitationEmail({
    to,
    groupName,
    inviterName,
    token,
    message,
    groupId
  }: {
    to: string;
    groupName: string;
    inviterName: string;
    token: string;
    message?: string;
    groupId: string;
  }) {
    try {
      // Configure email transporter (you'll need to set up your email service)
             const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

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

      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@xpenses.com',
        to,
        subject: `You're invited to join "${groupName}" on Xpenses`,
        html: emailContent
      });

      console.log(`Invitation email sent to ${to} for group ${groupName}`);
    } catch (error) {
      console.error('Failed to send invitation email:', error);
      // Don't throw error - invitation is still created in database
    }
  }
}
