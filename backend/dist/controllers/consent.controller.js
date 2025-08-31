"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.consentController = exports.ConsentController = void 0;
const client_1 = require("@prisma/client");
const mastercard_api_service_1 = require("../services/mastercard-api.service");
const sync_service_1 = require("../services/sync.service");
const logger_1 = require("../utils/logger");
const encryption_1 = require("../utils/encryption");
const date_fns_1 = require("date-fns");
const crypto_1 = __importDefault(require("crypto"));
const prisma = new client_1.PrismaClient();
class ConsentController {
    async startConsent(req, res) {
        try {
            const { durationDays = 180 } = req.body;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            if (durationDays > 365) {
                return res.status(400).json({ error: 'Consent duration cannot exceed 12 months' });
            }
            try {
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
                const state = crypto_1.default.randomBytes(32).toString('hex');
                const nonce = crypto_1.default.randomBytes(32).toString('hex');
                const scopes = [
                    mastercard_api_service_1.CDR_SCOPES.ACCOUNTS_BASIC,
                    mastercard_api_service_1.CDR_SCOPES.TRANSACTIONS,
                    mastercard_api_service_1.CDR_SCOPES.BALANCES,
                    mastercard_api_service_1.CDR_SCOPES.OFFLINE_ACCESS
                ];
                const redirectUri = process.env.OAUTH_REDIRECT_URI || 'http://localhost:3001/api/consents/callback';
                let redirectUrl;
                let consentRef;
                try {
                    const isConnected = await mastercard_api_service_1.mastercardApiService.testConnectivity();
                    if (!isConnected) {
                        throw new Error('Mastercard sandbox is currently unavailable. Please try again later.');
                    }
                    const consentSession = await mastercard_api_service_1.mastercardApiService.createConsentSession(scopes, redirectUri, state, nonce, durationDays);
                    redirectUrl = consentSession.redirectUrl;
                    consentRef = consentSession.consentId;
                }
                catch (sessionError) {
                    logger_1.logger.warn('Consent session creation failed, using OAuth authorize URL fallback:', sessionError);
                    redirectUrl = mastercard_api_service_1.mastercardApiService.generateOAuthUrl(state);
                    consentRef = state;
                }
                const consent = await prisma.consent.create({
                    data: {
                        userId,
                        institutionId: institution.id,
                        status: 'PENDING',
                        scopes: scopes.join(' '),
                        consentRef: consentRef,
                        expiresAt: (0, date_fns_1.addDays)(new Date(), durationDays)
                    }
                });
                await this.logAuditEvent(userId, 'CONSENT_START', {
                    consentId: consent.id,
                    scopes: scopes.join(' '),
                    durationDays
                });
                logger_1.logger.info(`Started consent flow for user ${userId} with consent ID ${consent.id}`);
                return res.json({
                    success: true,
                    consentId: consent.id,
                    redirectUrl,
                    state,
                    nonce
                });
            }
            catch (dbError) {
                logger_1.logger.error('Database or API error in production mode:', dbError);
                return res.status(500).json({ error: 'Database or API configuration error' });
            }
        }
        catch (error) {
            logger_1.logger.error('Error starting consent flow:', error);
            return res.status(500).json({ error: 'Failed to start consent flow' });
        }
    }
    async handleCallback(req, res) {
        try {
            const { code, state, error, error_description } = req.query;
            if (error) {
                logger_1.logger.error('OAuth error:', { error, error_description });
                return res.redirect(`${process.env.FRONTEND_URL}/connect-bank?error=${error}`);
            }
            if (!code || !state) {
                return res.redirect(`${process.env.FRONTEND_URL}/connect-bank?error=invalid_callback`);
            }
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
            const tokenResponse = await mastercard_api_service_1.mastercardApiService.exchangeCodeForToken(code, redirectUri);
            await prisma.token.create({
                data: {
                    consentId: consent.id,
                    accessToken: encryption_1.Encryption.encrypt(tokenResponse.access_token),
                    refreshToken: tokenResponse.refresh_token ? encryption_1.Encryption.encrypt(tokenResponse.refresh_token) : null,
                    tokenType: tokenResponse.token_type,
                    scope: tokenResponse.scope || '',
                    expiresAt: new Date(Date.now() + tokenResponse.expires_in * 1000)
                }
            });
            await prisma.consent.update({
                where: { id: consent.id },
                data: { status: 'ACTIVE' }
            });
            await this.logAuditEvent(consent.userId, 'CONSENT_GRANTED', {
                consentId: consent.id
            });
            sync_service_1.syncService.performInitialSync(consent.id).catch(error => {
                logger_1.logger.error('Background sync failed:', error);
            });
            logger_1.logger.info(`Consent completed for user ${consent.userId} with consent ID ${consent.id}`);
            res.redirect(`${process.env.FRONTEND_URL}/connect-bank?success=true&consentId=${consent.id}`);
        }
        catch (error) {
            logger_1.logger.error('Error handling OAuth callback:', error);
            res.redirect(`${process.env.FRONTEND_URL}/connect-bank?error=callback_failed`);
        }
    }
    async getUserConsents(req, res) {
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
        }
        catch (error) {
            logger_1.logger.error('Error getting user consents:', error);
            return res.status(500).json({ error: 'Failed to get consents' });
        }
    }
    async revokeConsent(req, res) {
        try {
            const { consentId } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            const consent = await prisma.consent.findFirst({
                where: {
                    id: consentId,
                    userId
                }
            });
            if (!consent) {
                return res.status(404).json({ error: 'Consent not found' });
            }
            try {
                await mastercard_api_service_1.mastercardApiService.revokeConsent(consent.consentRef);
            }
            catch (error) {
                logger_1.logger.warn(`Failed to revoke consent with Mastercard: ${error.message}`);
            }
            await prisma.consent.update({
                where: { id: consentId },
                data: { status: 'REVOKED' }
            });
            await this.logAuditEvent(userId, 'CONSENT_REVOKED', {
                consentId
            });
            logger_1.logger.info(`Consent ${consentId} revoked by user ${userId}`);
            return res.json({
                success: true,
                message: 'Consent revoked successfully'
            });
        }
        catch (error) {
            logger_1.logger.error('Error revoking consent:', error);
            return res.status(500).json({ error: 'Failed to revoke consent' });
        }
    }
    async getConsentDetails(req, res) {
        try {
            const { consentId } = req.params;
            const userId = req.user?.id;
            logger_1.logger.info(`Getting consent details for consentId: ${consentId}, userId: ${userId}`);
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
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
            }
            catch (dbError) {
                logger_1.logger.error('Database error in production mode:', dbError);
                return res.status(500).json({ error: 'Database configuration error' });
            }
        }
        catch (error) {
            logger_1.logger.error('Error getting consent details:', error);
            return res.status(500).json({ error: 'Failed to get consent details' });
        }
    }
    async checkSandboxStatus(req, res) {
        try {
            const status = mastercard_api_service_1.mastercardApiService.getSandboxStatus();
            const isHealthy = await mastercard_api_service_1.mastercardApiService.checkSandboxHealth();
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
        }
        catch (error) {
            logger_1.logger.error('Error checking sandbox status:', error);
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
    async logAuditEvent(userId, action, details) {
        try {
            logger_1.logger.info(`Audit event: ${action} for user ${userId}`, details);
        }
        catch (error) {
            logger_1.logger.error('Failed to log audit event:', error);
        }
    }
}
exports.ConsentController = ConsentController;
exports.consentController = new ConsentController();
//# sourceMappingURL=consent.controller.js.map