import { Router } from 'express';
import { SplitwiseGroupsController } from '../controllers/splitwise-groups.controller';
import { authenticateFirebaseToken } from '../middleware/firebase-auth.middleware';

const router = Router();

// All routes require Firebase authentication
router.use(authenticateFirebaseToken);

// Group management routes
router.post('/', SplitwiseGroupsController.createGroup);
router.get('/', SplitwiseGroupsController.getMyGroups);
router.get('/:id', SplitwiseGroupsController.getGroupDetails);
router.put('/:id', SplitwiseGroupsController.updateGroup);
router.delete('/:id', SplitwiseGroupsController.deleteGroup);

// Member management routes
router.post('/:id/members', SplitwiseGroupsController.addMember);
router.delete('/:id/members/:memberId', SplitwiseGroupsController.removeMember);
router.patch('/:id/members/:memberId', SplitwiseGroupsController.updateMemberRole);

export default router;
