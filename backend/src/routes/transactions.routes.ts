import { Router } from 'express';
import { transactionsController } from '../controllers/transactions.controller';
import { authenticateFirebaseToken } from '../middleware/firebase-auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateFirebaseToken);

// Get all transactions with filtering and pagination
router.get('/', transactionsController.getAllTransactions);

// Get transaction statistics
router.get('/stats', transactionsController.getTransactionStats);

// Create new transaction
router.post('/', transactionsController.createTransaction);

// Get specific transaction
router.get('/:transactionId', transactionsController.getTransaction);

// Update transaction
router.put('/:transactionId', transactionsController.updateTransaction);

// Delete transaction
router.delete('/:transactionId', transactionsController.deleteTransaction);

export default router;
