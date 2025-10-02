import { Router } from 'express';
import { SplitwiseInvitesController } from '../controllers/splitwise-invites.controller';
import { authenticateFirebaseToken } from '../middleware/firebase-auth.middleware';

const router = Router();

// SMTP health check (no auth required for debugging)
router.get('/invites/health', SplitwiseInvitesController.checkSmtpHealth);

// Check invitation status (no auth required for debugging)
router.get('/invites/check/:token', SplitwiseInvitesController.checkInvite);

// Debug endpoint to check all pending invitations for an email (no auth required for debugging)
router.get('/invites/debug/:email', SplitwiseInvitesController.debugInvites);

// All other routes require Firebase authentication
router.use(authenticateFirebaseToken);

// Send invitation to join a group
router.post('/groups/:id/invites', SplitwiseInvitesController.sendInvite);

// Accept invitation to join a group
router.post('/invites/accept', SplitwiseInvitesController.acceptInvite);

// Get pending invitations for current user
router.get('/invites/pending', SplitwiseInvitesController.getPendingInvites);

// Cancel/delete an invitation
router.delete('/invites/:inviteId', SplitwiseInvitesController.cancelInvite);

export default router;
