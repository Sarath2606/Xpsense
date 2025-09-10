import { Router } from 'express';
import { SplitwiseSettlementsController } from '../controllers/splitwise-settlements.controller';
import { authenticateFirebaseToken } from '../middleware/firebase-auth.middleware';

const router = Router();

// All routes require Firebase authentication
router.use(authenticateFirebaseToken);

// Settlement management routes
router.post('/groups/:groupId/settlements', SplitwiseSettlementsController.createSettlement);
router.get('/groups/:groupId/settlements', SplitwiseSettlementsController.getGroupSettlements);
router.get('/groups/:groupId/settlements/user/:userId', SplitwiseSettlementsController.getUserSettlements);
router.get('/:id', SplitwiseSettlementsController.getSettlement);
router.put('/:id', SplitwiseSettlementsController.updateSettlement);
router.delete('/:id', SplitwiseSettlementsController.deleteSettlement);

export default router;
