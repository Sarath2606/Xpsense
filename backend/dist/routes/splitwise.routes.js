"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const splitwise_groups_routes_1 = __importDefault(require("./splitwise-groups.routes"));
const splitwise_expenses_routes_1 = __importDefault(require("./splitwise-expenses.routes"));
const splitwise_balances_routes_1 = __importDefault(require("./splitwise-balances.routes"));
const splitwise_settlements_routes_1 = __importDefault(require("./splitwise-settlements.routes"));
const router = (0, express_1.Router)();
router.use('/groups', splitwise_groups_routes_1.default);
router.use('/expenses', splitwise_expenses_routes_1.default);
router.use('/balances', splitwise_balances_routes_1.default);
router.use('/settlements', splitwise_settlements_routes_1.default);
exports.default = router;
//# sourceMappingURL=splitwise.routes.js.map