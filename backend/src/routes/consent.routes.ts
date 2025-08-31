import express from 'express';
import { consentController } from '../controllers/consent.controller';
import { authenticateFirebaseToken } from '../middleware/firebase-auth.middleware';

const router = express.Router();

/**
 * @route GET /api/consents/sandbox-status
 * @desc Check Mastercard sandbox status and downtime information
 * @access Public (no auth required for system health check)
 */
router.get('/sandbox-status', consentController.checkSandboxStatus.bind(consentController));

/**
 * @route POST /api/consents/start
 * @desc Start consent flow - initiate OAuth authorization
 * @access Private
 */
router.post('/start', authenticateFirebaseToken, consentController.startConsent.bind(consentController));

/**
 * @route GET /api/consents/callback
 * @desc Handle OAuth callback and complete consent
 * @access Public (no auth required for callback)
 */
router.get('/callback', consentController.handleCallback.bind(consentController));

// Apply authentication middleware to all routes after the public callback
router.use(authenticateFirebaseToken);

/**
 * @route GET /api/consents
 * @desc Get user's active consents
 * @access Private
 */
router.get('/', consentController.getUserConsents.bind(consentController));

/**
 * @route GET /api/consents/:consentId
 * @desc Get consent details
 * @access Private
 */
router.get('/:consentId', consentController.getConsentDetails.bind(consentController));

/**
 * @route DELETE /api/consents/:consentId
 * @desc Revoke consent
 * @access Private
 */
router.delete('/:consentId', consentController.revokeConsent.bind(consentController));

export default router;
