import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/callback', authController.oauthCallback);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);
router.post('/oauth/initiate', authenticateToken, authController.initiateOAuth);
router.post('/connect-bank', authenticateToken, authController.connectBankAccount);
router.post('/refresh-token', authenticateToken, authController.refreshToken);

export default router;
