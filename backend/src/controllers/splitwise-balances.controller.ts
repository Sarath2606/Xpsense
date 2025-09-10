/**
 * Splitwise Balances Controller
 * Handles balance calculations and settlement suggestions
 */

import { Response } from 'express';
import { SplitwiseBalanceService } from '../services/splitwise-balance.service';
import { FirebaseAuthRequest } from '../middleware/firebase-auth.middleware';

export class SplitwiseBalancesController {
  /**
   * Get group balances and settlement suggestions
   * GET /api/splitwise/groups/:groupId/balances
   */
  static async getGroupBalances(req: FirebaseAuthRequest, res: Response) {
    try {
      const { groupId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Calculate group balances
      const balanceSummary = await SplitwiseBalanceService.calculateGroupBalances(groupId);

      res.json({
        message: "Group balances calculated successfully",
        ...balanceSummary
      });
    } catch (error) {
      console.error("Get group balances error:", error);
      
      if (error instanceof Error && error.message.includes("Group not found")) {
        return res.status(404).json({ error: error.message });
      }
      
      res.status(500).json({ error: "Failed to calculate group balances" });
    }
  }

  /**
   * Get user's balance in a specific group
   * GET /api/splitwise/groups/:groupId/balances/my-balance
   */
  static async getMyBalance(req: FirebaseAuthRequest, res: Response) {
    try {
      const { groupId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Get user's balance in the group
      const userBalance = await SplitwiseBalanceService.getUserBalanceInGroup(userId, groupId);

      if (!userBalance) {
        return res.status(404).json({ error: "User balance not found" });
      }

      res.json({
        message: "User balance retrieved successfully",
        balance: userBalance
      });
    } catch (error) {
      console.error("Get my balance error:", error);
      res.status(500).json({ error: "Failed to get user balance" });
    }
  }

  /**
   * Get all groups where user has balances (for dashboard)
   * GET /api/splitwise/balances/my-groups
   */
  static async getMyGroupBalances(req: FirebaseAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Get all groups where user has balances
      const groupBalances = await SplitwiseBalanceService.getUserGroupBalances(userId);

      res.json({
        message: "User group balances retrieved successfully",
        groupBalances
      });
    } catch (error) {
      console.error("Get my group balances error:", error);
      res.status(500).json({ error: "Failed to get user group balances" });
    }
  }

  /**
   * Validate group balances (for debugging/verification)
   * GET /api/splitwise/groups/:groupId/balances/validate
   */
  static async validateGroupBalances(req: FirebaseAuthRequest, res: Response) {
    try {
      const { groupId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Validate group balances
      const validation = await SplitwiseBalanceService.validateGroupBalances(groupId);

      res.json({
        ...validation,
        message: "Group balance validation completed"
      });
    } catch (error) {
      console.error("Validate group balances error:", error);
      res.status(500).json({ error: "Failed to validate group balances" });
    }
  }

  /**
   * Get balance history for a user in a group
   * GET /api/splitwise/groups/:groupId/balances/history
   */
  static async getBalanceHistory(req: FirebaseAuthRequest, res: Response) {
    try {
      const { groupId } = req.params;
      const { days = 30 } = req.query;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Get balance history
      const history = await SplitwiseBalanceService.getUserBalanceHistory(
        userId, 
        groupId, 
        Number(days)
      );

      res.json({
        message: "Balance history retrieved successfully",
        history,
        days: Number(days)
      });
    } catch (error) {
      console.error("Get balance history error:", error);
      res.status(500).json({ error: "Failed to get balance history" });
    }
  }

  /**
   * Get settlement suggestions for a group
   * GET /api/splitwise/groups/:groupId/balances/settlements
   */
  static async getSettlementSuggestions(req: FirebaseAuthRequest, res: Response) {
    try {
      const { groupId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Get group balances
      const balanceSummary = await SplitwiseBalanceService.calculateGroupBalances(groupId);

      res.json({
        message: "Settlement suggestions generated successfully",
        suggestions: balanceSummary.settlementSuggestions,
        totalSuggestions: balanceSummary.settlementSuggestions.length
      });
    } catch (error) {
      console.error("Get settlement suggestions error:", error);
      res.status(500).json({ error: "Failed to generate settlement suggestions" });
    }
  }
}
