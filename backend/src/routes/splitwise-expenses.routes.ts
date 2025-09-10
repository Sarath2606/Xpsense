import { Router } from 'express';
import { SplitwiseExpensesController } from '../controllers/splitwise-expenses.controller';
import { authenticateFirebaseToken } from '../middleware/firebase-auth.middleware';

const router = Router();

// All routes require Firebase authentication
router.use(authenticateFirebaseToken);

// Expense management routes
router.post('/groups/:groupId/expenses', SplitwiseExpensesController.createExpense);
router.get('/groups/:groupId/expenses', SplitwiseExpensesController.getGroupExpenses);
router.get('/:id', SplitwiseExpensesController.getExpense);
router.put('/:id', SplitwiseExpensesController.updateExpense);
router.delete('/:id', SplitwiseExpensesController.deleteExpense);

// Utility routes
router.get('/split-types', SplitwiseExpensesController.getSplitTypes);

export default router;
