"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const splitwise_balances_controller_1 = require("../controllers/splitwise-balances.controller");
const firebase_auth_middleware_1 = require("../middleware/firebase-auth.middleware");
const router = (0, express_1.Router)();
router.use(firebase_auth_middleware_1.authenticateFirebaseToken);
router.get('/groups/:groupId/balances', splitwise_balances_controller_1.SplitwiseBalancesController.getGroupBalances);
router.get('/groups/:groupId/balances/my-balance', splitwise_balances_controller_1.SplitwiseBalancesController.getMyBalance);
router.get('/groups/:groupId/balances/validate', splitwise_balances_controller_1.SplitwiseBalancesController.validateGroupBalances);
router.get('/groups/:groupId/balances/history', splitwise_balances_controller_1.SplitwiseBalancesController.getBalanceHistory);
router.get('/groups/:groupId/balances/settlements', splitwise_balances_controller_1.SplitwiseBalancesController.getSettlementSuggestions);
router.get('/my-groups', splitwise_balances_controller_1.SplitwiseBalancesController.getMyGroupBalances);
exports.default = router;
//# sourceMappingURL=splitwise-balances.routes.js.map