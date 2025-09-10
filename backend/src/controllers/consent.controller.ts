import { Request, Response } from 'express';
import axios from 'axios';
import { PrismaClient, AccountStatus } from '@prisma/client';
import { mastercardApiService, CDR_SCOPES } from '../services/mastercard-api.service';
import { syncService } from '../services/sync.service';
import { logger } from '../utils/logger';
import { Encryption } from '../utils/encryption';
import { addDays } from 'date-fns';
import crypto from 'crypto';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export class ConsentController {
  /**
   * Start consent flow - initiate OAuth authorization
   */
  async startConsent(req: AuthRequest, res: Response) {
    try {
      const { durationDays = 180 } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Validate duration (max 12 months for consumers)
      if (durationDays > 365) {
        return res.status(400).json({ error: 'Consent duration cannot exceed 12 months' });
      }

      // Note: Removed health endpoint check as it's not a public endpoint
      // Mastercard confirmed this endpoint is not available for developers

      // Always use real Mastercard sandbox/prod flow (no development mock)

      // Production flow (requires database and Mastercard API)
      try {
        // Get or create Mastercard institution
        let institution = await prisma.institution.findUnique({
          where: { code: 'AUS-CDR-Mastercard' }
        });

        if (!institution) {
          institution = await prisma.institution.create({
            data: {
              name: 'Mastercard Open Banking',
              code: 'AUS-CDR-Mastercard',
              logoUrl: 'https://example.com/mastercard-logo.png'
            }
          });
        }

        // Generate secure state and nonce
        const state = crypto.randomBytes(32).toString('hex');
        const nonce = crypto.randomBytes(32).toString('hex');

        // Define scopes for CDR compliance
        const scopes = [
          CDR_SCOPES.ACCOUNTS_BASIC,
          CDR_SCOPES.TRANSACTIONS,
          CDR_SCOPES.BALANCES,
          CDR_SCOPES.OFFLINE_ACCESS
        ];

        const redirectUri = process.env.OAUTH_REDIRECT_URI || 'http://localhost:3001/api/consents/callback';

        // Generate Connect URL for bank connection using Mastercard Connect flow
        let redirectUrl: string;
        let consentRef: string;

        try {
          // Ensure we have an App-Token first
          await mastercardApiService.getAppToken();

          // Get user details for customer creation
          let user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, name: true }
          });

          // If user doesn't exist, create a test user for development
          if (!user) {
            logger.warn(`User ${userId} not found in database, creating test user`);
            user = await prisma.user.create({
              data: {
                id: userId,
                email: `test-${userId}@example.com`,
                name: 'Test User',
                firebaseUid: userId
              },
              select: { email: true, name: true }
            });
            logger.info(`Created test user: ${user.email}`);
          }

          // Create a test customer in Mastercard system
          const customerId = await mastercardApiService.createTestCustomer(
            userId,
            user.email,
            user.name || 'Test User'
          );

          // Generate Connect URL using the new Connect flow
          const webhookUrl = process.env.WEBHOOK_URL || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/webhooks/mastercard`;
          
          redirectUrl = await mastercardApiService.generateConnectUrl(customerId, webhookUrl);
          consentRef = state; // Use state as consent reference
          
          logger.info('Successfully generated Connect URL for bank connection');
        } catch (connectError) {
          const errorMessage = connectError instanceof Error ? connectError.message : String(connectError);
          const errorStack = connectError instanceof Error ? connectError.stack : undefined;
          
          logger.error('Failed to generate Connect URL:', {
            error: errorMessage,
            stack: errorStack,
            userId: userId
          });
          throw new Error(`Unable to generate bank connection URL: ${errorMessage}`);
        }

        // Store consent in database (pending until callback)
        const consent = await prisma.consent.create({
          data: {
            userId,
            institutionId: institution.id,
            status: 'PENDING',
            scopes: scopes.join(' '),
            consentRef: consentRef,
            expiresAt: addDays(new Date(), durationDays)
          }
        });

        // Log audit event
        await this.logAuditEvent(userId, 'CONSENT_START', {
          consentId: consent.id,
          scopes: scopes.join(' '),
          durationDays
        });

        logger.info(`Started consent flow for user ${userId} with consent ID ${consent.id}`);

        return res.json({
          success: true,
          consentId: consent.id,
          redirectUrl,
          state,
          nonce
        });
      } catch (dbError) {
        logger.error('Database or API error in production mode:', dbError);
        return res.status(500).json({ error: 'Database or API configuration error' });
      }

    } catch (error) {
      logger.error('Error starting consent flow:', error);
      return res.status(500).json({ error: 'Failed to start consent flow' });
    }
  }

  /**
   * Handle OAuth callback and complete consent
   */
  async handleCallback(req: Request, res: Response) {
    try {
      const { code, state, error, error_description } = req.query;

      if (error) {
        logger.error('OAuth error:', { error, error_description });
        return res.redirect(`${process.env.FRONTEND_URL}/connect-bank?error=${error}`);
      }

      if (!code || !state) {
        return res.redirect(`${process.env.FRONTEND_URL}/connect-bank?error=invalid_callback`);
      }

      // Find consent by state (you might want to store state in database for security)
      const consent = await prisma.consent.findFirst({
        where: {
          status: 'PENDING'
        },
        include: { user: true }
      });

      if (!consent) {
        return res.redirect(`${process.env.FRONTEND_URL}/connect-bank?error=consent_not_found`);
      }

      const redirectUri = process.env.OAUTH_REDIRECT_URI || 'http://localhost:3001/api/consents/callback';

      // Exchange code for tokens
      const tokenResponse = await mastercardApiService.exchangeCodeForToken(code as string, redirectUri);

      // Store tokens securely
      await prisma.token.create({
        data: {
          consentId: consent.id,
          accessToken: Encryption.encrypt(tokenResponse.access_token),
          refreshToken: tokenResponse.refresh_token ? Encryption.encrypt(tokenResponse.refresh_token) : null,
          tokenType: tokenResponse.token_type,
          scope: tokenResponse.scope || '',
          expiresAt: new Date(Date.now() + tokenResponse.expires_in * 1000)
        }
      });

      // Update consent status
      await prisma.consent.update({
        where: { id: consent.id },
        data: { status: 'ACTIVE' }
      });

      // Log audit event
      await this.logAuditEvent(consent.userId, 'CONSENT_GRANTED', {
        consentId: consent.id
      });

      // Start initial sync in background
      syncService.performInitialSync(consent.id).catch(error => {
        logger.error('Background sync failed:', error);
      });

      logger.info(`Consent completed for user ${consent.userId} with consent ID ${consent.id}`);

      // Redirect to success page
      res.redirect(`${process.env.FRONTEND_URL}/connect-bank?success=true&consentId=${consent.id}`);

    } catch (error) {
      logger.error('Error handling OAuth callback:', error);
      res.redirect(`${process.env.FRONTEND_URL}/connect-bank?error=callback_failed`);
    }
  }

  /**
   * Get user's active consents
   */
  async getUserConsents(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const consents = await prisma.consent.findMany({
        where: { userId },
        include: {
          institution: true,
          accounts: {
            select: {
              id: true,
              accountName: true,
              bankName: true,
              accountType: true,
              balance: true,
              currency: true,
              lastSyncAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Log audit event
      await this.logAuditEvent(userId, 'CONSENTS_VIEWED', {
        consentCount: consents.length
      });

      return res.json({
        success: true,
        consents: consents.map(consent => ({
          id: consent.id,
          institution: consent.institution.name,
          status: consent.status,
          scopes: consent.scopes.split(' '),
          expiresAt: consent.expiresAt,
          createdAt: consent.createdAt,
          accounts: consent.accounts
        }))
      });

    } catch (error) {
      logger.error('Error getting user consents:', error);
      return res.status(500).json({ error: 'Failed to get consents' });
    }
  }

  /**
   * Revoke consent
   */
  async revokeConsent(req: AuthRequest, res: Response) {
    try {
      const { consentId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Find consent and verify ownership
      const consent = await prisma.consent.findFirst({
        where: {
          id: consentId,
          userId
        }
      });

      if (!consent) {
        return res.status(404).json({ error: 'Consent not found' });
      }

      // Revoke consent with Mastercard
      try {
        await mastercardApiService.revokeConsent(consent.consentRef);
      } catch (error) {
        logger.warn(`Failed to revoke consent with Mastercard: ${(error as Error).message}`);
        // Continue with local revocation
      }

      // Update consent status
      await prisma.consent.update({
        where: { id: consentId },
        data: { status: 'REVOKED' }
      });

      // Log audit event
      await this.logAuditEvent(userId, 'CONSENT_REVOKED', {
        consentId
      });

      logger.info(`Consent ${consentId} revoked by user ${userId}`);

      return res.json({
        success: true,
        message: 'Consent revoked successfully'
      });

    } catch (error) {
      logger.error('Error revoking consent:', error);
      return res.status(500).json({ error: 'Failed to revoke consent' });
    }
  }

  /**
   * Get consent details
   */
  async getConsentDetails(req: AuthRequest, res: Response) {
    try {
      const { consentId } = req.params;
      const userId = req.user?.id;

      logger.info(`Getting consent details for consentId: ${consentId}, userId: ${userId}`);

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }



      // Production flow (requires database)
      try {
        const consent = await prisma.consent.findFirst({
          where: {
            id: consentId,
            userId
          },
          include: {
            institution: true,
            accounts: {
              select: {
                id: true,
                accountName: true,
                bankName: true,
                accountType: true,
                balance: true,
                currency: true,
                lastSyncAt: true,
                status: true
              }
            }
          }
        });

        if (!consent) {
          return res.status(404).json({ error: 'Consent not found' });
        }

        // Log audit event
        await this.logAuditEvent(userId, 'CONSENT_DETAILS_VIEWED', {
          consentId
        });

        return res.json({
          success: true,
          consent: {
            id: consent.id,
            institution: consent.institution.name,
            status: consent.status,
            scopes: consent.scopes.split(' '),
            expiresAt: consent.expiresAt,
            createdAt: consent.createdAt,
            accounts: consent.accounts
          }
        });
      } catch (dbError) {
        logger.error('Database error in production mode:', dbError);
        return res.status(500).json({ error: 'Database configuration error' });
      }

    } catch (error) {
      logger.error('Error getting consent details:', error);
      return res.status(500).json({ error: 'Failed to get consent details' });
    }
  }

  /**
   * Check Mastercard sandbox status and downtime information
   */
  async checkSandboxStatus(req: Request, res: Response) {
    try {
      const status = mastercardApiService.getSandboxStatus();
      const isHealthy = await mastercardApiService.checkSandboxHealth();
      
      const response = {
        success: true,
        sandbox: {
          isHealthy,
          isDown: status.isDown,
          lastCheck: new Date(status.lastCheck).toISOString(),
          estimatedRecovery: status.estimatedRecovery,
          projectId: process.env.MASTERCARD_PARTNER_ID || '809b7851-77b9-441d-b624-7256f3ba25d7'
        },
        recommendations: {
          ifDown: [
            'This appears to be scheduled maintenance or a temporary outage',
            'Typical recovery time is 2-4 hours for sandbox maintenance',
            'You can continue testing other parts of your application',
            'Check back in 30 minutes for updates'
          ],
          ifHealthy: [
            'Sandbox is operational and ready for testing',
            'All API endpoints should be accessible',
            'You can proceed with consent flows and data retrieval'
          ]
        }
      };

      return res.json(response);
    } catch (error) {
      logger.error('Error checking sandbox status:', error);
      return res.status(500).json({ 
        error: 'Failed to check sandbox status',
        sandbox: {
          isHealthy: false,
          isDown: true,
          estimatedRecovery: 'Unknown - please try again later'
        }
      });
    }
  }

  /**
   * Log audit event for CDR compliance
   */
  private async logAuditEvent(
    userId: string,
    action: string,
    details: any
  ): Promise<void> {
    try {
      // Temporarily disable audit logging to avoid database issues
      logger.info(`Audit event: ${action} for user ${userId}`, details);
      // await prisma.auditLog.create({
      //   data: {
      //     userId,
      //     action,
      //     details,
      //     ipAddress: 'system', // For system-generated events
      //     userAgent: 'consent-controller'
      //   }
      // });
    } catch (error) {
      logger.error('Failed to log audit event:', error);
    }
  }
}

export const consentController = new ConsentController();
