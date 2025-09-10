"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SplitwiseBalancesController = void 0;
const splitwise_balance_service_1 = require("../services/splitwise-balance.service");
class SplitwiseBalancesController {
    static async getGroupBalances(req, res) {
        try {
            const { groupId } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: "Authentication required" });
            }
            const balanceSummary = await splitwise_balance_service_1.SplitwiseBalanceService.calculateGroupBalances(groupId);
            res.json({
                message: "Group balances calculated successfully",
                ...balanceSummary
            });
        }
        catch (error) {
            console.error("Get group balances error:", error);
            if (error instanceof Error && error.message.includes("Group not found")) {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: "Failed to calculate group balances" });
        }
    }
    static async getMyBalance(req, res) {
        try {
            const { groupId } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: "Authentication required" });
            }
            const userBalance = await splitwise_balance_service_1.SplitwiseBalanceService.getUserBalanceInGroup(userId, groupId);
            if (!userBalance) {
                return res.status(404).json({ error: "User balance not found" });
            }
            res.json({
                message: "User balance retrieved successfully",
                balance: userBalance
            });
        }
        catch (error) {
            console.error("Get my balance error:", error);
            res.status(500).json({ error: "Failed to get user balance" });
        }
    }
    static async getMyGroupBalances(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: "Authentication required" });
            }
            const groupBalances = await splitwise_balance_service_1.SplitwiseBalanceService.getUserGroupBalances(userId);
            res.json({
                message: "User group balances retrieved successfully",
                groupBalances
            });
        }
        catch (error) {
            console.error("Get my group balances error:", error);
            res.status(500).json({ error: "Failed to get user group balances" });
        }
    }
    static async validateGroupBalances(req, res) {
        try {
            const { groupId } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: "Authentication required" });
            }
            const validation = await splitwise_balance_service_1.SplitwiseBalanceService.validateGroupBalances(groupId);
            res.json({
                ...validation,
                message: "Group balance validation completed"
            });
        }
        catch (error) {
            console.error("Validate group balances error:", error);
            res.status(500).json({ error: "Failed to validate group balances" });
        }
    }
    static async getBalanceHistory(req, res) {
        try {
            const { groupId } = req.params;
            const { days = 30 } = req.query;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: "Authentication required" });
            }
            const history = await splitwise_balance_service_1.SplitwiseBalanceService.getUserBalanceHistory(userId, groupId, Number(days));
            res.json({
                message: "Balance history retrieved successfully",
                history,
                days: Number(days)
            });
        }
        catch (error) {
            console.error("Get balance history error:", error);
            res.status(500).json({ error: "Failed to get balance history" });
        }
    }
    static async getSettlementSuggestions(req, res) {
        try {
            const { groupId } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: "Authentication required" });
            }
            const balanceSummary = await splitwise_balance_service_1.SplitwiseBalanceService.calculateGroupBalances(groupId);
            res.json({
                message: "Settlement suggestions generated successfully",
                suggestions: balanceSummary.settlementSuggestions,
                totalSuggestions: balanceSummary.settlementSuggestions.length
            });
        }
        catch (error) {
            console.error("Get settlement suggestions error:", error);
            res.status(500).json({ error: "Failed to generate settlement suggestions" });
        }
    }
}
exports.SplitwiseBalancesController = SplitwiseBalancesController;
//# sourceMappingURL=splitwise-balances.controller.js.map