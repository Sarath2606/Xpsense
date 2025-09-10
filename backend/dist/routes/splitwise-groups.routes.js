"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const splitwise_groups_controller_1 = require("../controllers/splitwise-groups.controller");
const firebase_auth_middleware_1 = require("../middleware/firebase-auth.middleware");
const router = (0, express_1.Router)();
router.use(firebase_auth_middleware_1.authenticateFirebaseToken);
router.post('/', splitwise_groups_controller_1.SplitwiseGroupsController.createGroup);
router.get('/', splitwise_groups_controller_1.SplitwiseGroupsController.getMyGroups);
router.get('/:id', splitwise_groups_controller_1.SplitwiseGroupsController.getGroupDetails);
router.put('/:id', splitwise_groups_controller_1.SplitwiseGroupsController.updateGroup);
router.delete('/:id', splitwise_groups_controller_1.SplitwiseGroupsController.deleteGroup);
router.post('/:id/members', splitwise_groups_controller_1.SplitwiseGroupsController.addMember);
router.delete('/:id/members/:memberId', splitwise_groups_controller_1.SplitwiseGroupsController.removeMember);
router.patch('/:id/members/:memberId', splitwise_groups_controller_1.SplitwiseGroupsController.updateMemberRole);
exports.default = router;
//# sourceMappingURL=splitwise-groups.routes.js.map