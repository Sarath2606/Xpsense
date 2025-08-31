"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const accounts_controller_1 = require("../controllers/accounts.controller");
const firebase_auth_middleware_1 = require("../middleware/firebase-auth.middleware");
const router = (0, express_1.Router)();
router.use(firebase_auth_middleware_1.authenticateFirebaseToken);
router.get('/', accounts_controller_1.accountsController.getConnectedAccounts);
router.get('/sync-status', accounts_controller_1.accountsController.getSyncStatus);
router.get('/balance-summary', accounts_controller_1.accountsController.getBalanceSummary);
router.post('/sync', accounts_controller_1.accountsController.syncAllAccounts);
router.get('/:accountId', accounts_controller_1.accountsController.getConnectedAccount);
router.post('/:accountId/sync', accounts_controller_1.accountsController.syncAccount);
router.delete('/:accountId', accounts_controller_1.accountsController.disconnectAccount);
exports.default = router;
//# sourceMappingURL=accounts.routes.js.map