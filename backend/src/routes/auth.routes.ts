import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { authenticateFirebaseToken } from '../middleware/firebase-auth.middleware';

const router = Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/callback', authController.oauthCallback);

// Protected routes with JWT authentication (for backend auth)
router.get('/profile', authenticateToken, authController.getProfile);
router.post('/refresh-token', authenticateToken, authController.refreshToken);

// Protected routes with Firebase authentication (for frontend auth)
// Temporarily removing Firebase auth for testing
router.post('/oauth/initiate', authController.initiateOAuth);
router.post('/connect-bank', authenticateFirebaseToken, authController.connectBankAccount);

export default router;
