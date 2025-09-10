"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const splitwise_settlements_controller_1 = require("../controllers/splitwise-settlements.controller");
const firebase_auth_middleware_1 = require("../middleware/firebase-auth.middleware");
const router = (0, express_1.Router)();
router.use(firebase_auth_middleware_1.authenticateFirebaseToken);
router.post('/groups/:groupId/settlements', splitwise_settlements_controller_1.SplitwiseSettlementsController.createSettlement);
router.get('/groups/:groupId/settlements', splitwise_settlements_controller_1.SplitwiseSettlementsController.getGroupSettlements);
router.get('/groups/:groupId/settlements/user/:userId', splitwise_settlements_controller_1.SplitwiseSettlementsController.getUserSettlements);
router.get('/:id', splitwise_settlements_controller_1.SplitwiseSettlementsController.getSettlement);
router.put('/:id', splitwise_settlements_controller_1.SplitwiseSettlementsController.updateSettlement);
router.delete('/:id', splitwise_settlements_controller_1.SplitwiseSettlementsController.deleteSettlement);
exports.default = router;
//# sourceMappingURL=splitwise-settlements.routes.js.map