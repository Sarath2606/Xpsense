"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const splitwise_invites_controller_1 = require("../controllers/splitwise-invites.controller");
const firebase_auth_middleware_1 = require("../middleware/firebase-auth.middleware");
const router = (0, express_1.Router)();
router.get('/invites/health', splitwise_invites_controller_1.SplitwiseInvitesController.checkSmtpHealth);
router.get('/invites/check/:token', splitwise_invites_controller_1.SplitwiseInvitesController.checkInvite);
router.use(firebase_auth_middleware_1.authenticateFirebaseToken);
router.post('/groups/:id/invites', splitwise_invites_controller_1.SplitwiseInvitesController.sendInvite);
router.post('/invites/accept', splitwise_invites_controller_1.SplitwiseInvitesController.acceptInvite);
router.get('/invites/pending', splitwise_invites_controller_1.SplitwiseInvitesController.getPendingInvites);
router.delete('/invites/:inviteId', splitwise_invites_controller_1.SplitwiseInvitesController.cancelInvite);
exports.default = router;
//# sourceMappingURL=splitwise-invites.routes.js.map