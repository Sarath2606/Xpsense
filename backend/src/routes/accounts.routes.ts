import { Router } from 'express';
import { accountsController } from '../controllers/accounts.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all connected accounts
router.get('/', accountsController.getConnectedAccounts);

// Get sync status
router.get('/sync-status', accountsController.getSyncStatus);

// Get balance summary
router.get('/balance-summary', accountsController.getBalanceSummary);

// Sync all accounts
router.post('/sync', accountsController.syncAllAccounts);

// Get specific account
router.get('/:accountId', accountsController.getConnectedAccount);

// Sync specific account
router.post('/:accountId/sync', accountsController.syncAccount);

// Disconnect account
router.delete('/:accountId', accountsController.disconnectAccount);

export default router;
