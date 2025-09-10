import { Router } from 'express';
import groupsRoutes from './splitwise-groups.routes';
import expensesRoutes from './splitwise-expenses.routes';
import balancesRoutes from './splitwise-balances.routes';
import settlementsRoutes from './splitwise-settlements.routes';

const router = Router();

// Mount all Splitwise route modules
router.use('/groups', groupsRoutes);
router.use('/expenses', expensesRoutes);
router.use('/balances', balancesRoutes);
router.use('/settlements', settlementsRoutes);

export default router;
