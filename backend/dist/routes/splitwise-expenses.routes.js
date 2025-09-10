"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const splitwise_expenses_controller_1 = require("../controllers/splitwise-expenses.controller");
const firebase_auth_middleware_1 = require("../middleware/firebase-auth.middleware");
const router = (0, express_1.Router)();
router.use(firebase_auth_middleware_1.authenticateFirebaseToken);
router.post('/groups/:groupId/expenses', splitwise_expenses_controller_1.SplitwiseExpensesController.createExpense);
router.get('/groups/:groupId/expenses', splitwise_expenses_controller_1.SplitwiseExpensesController.getGroupExpenses);
router.get('/:id', splitwise_expenses_controller_1.SplitwiseExpensesController.getExpense);
router.put('/:id', splitwise_expenses_controller_1.SplitwiseExpensesController.updateExpense);
router.delete('/:id', splitwise_expenses_controller_1.SplitwiseExpensesController.deleteExpense);
router.get('/split-types', splitwise_expenses_controller_1.SplitwiseExpensesController.getSplitTypes);
exports.default = router;
//# sourceMappingURL=splitwise-expenses.routes.js.map