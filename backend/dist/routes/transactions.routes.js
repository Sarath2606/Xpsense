"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transactions_controller_1 = require("../controllers/transactions.controller");
const firebase_auth_middleware_1 = require("../middleware/firebase-auth.middleware");
const router = (0, express_1.Router)();
router.use(firebase_auth_middleware_1.authenticateFirebaseToken);
router.get('/', transactions_controller_1.transactionsController.getAllTransactions);
router.get('/stats', transactions_controller_1.transactionsController.getTransactionStats);
router.post('/', transactions_controller_1.transactionsController.createTransaction);
router.get('/:transactionId', transactions_controller_1.transactionsController.getTransaction);
router.put('/:transactionId', transactions_controller_1.transactionsController.updateTransaction);
router.delete('/:transactionId', transactions_controller_1.transactionsController.deleteTransaction);
exports.default = router;
//# sourceMappingURL=transactions.routes.js.map