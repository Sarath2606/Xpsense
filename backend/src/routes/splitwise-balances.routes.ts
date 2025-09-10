import { Router } from 'express';
import { SplitwiseBalancesController } from '../controllers/splitwise-balances.controller';
import { authenticateFirebaseToken } from '../middleware/firebase-auth.middleware';

const router = Router();

// All routes require Firebase authentication
router.use(authenticateFirebaseToken);

// Balance calculation routes
router.get('/groups/:groupId/balances', SplitwiseBalancesController.getGroupBalances);
router.get('/groups/:groupId/balances/my-balance', SplitwiseBalancesController.getMyBalance);
router.get('/groups/:groupId/balances/validate', SplitwiseBalancesController.validateGroupBalances);
router.get('/groups/:groupId/balances/history', SplitwiseBalancesController.getBalanceHistory);
router.get('/groups/:groupId/balances/settlements', SplitwiseBalancesController.getSettlementSuggestions);

// Dashboard routes
router.get('/my-groups', SplitwiseBalancesController.getMyGroupBalances);

export default router;
