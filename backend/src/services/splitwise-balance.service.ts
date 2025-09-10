/**
 * Splitwise Balance Calculation Service
 * Handles balance computation and settlement suggestions
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface UserBalance {
  userId: string;
  userName: string;
  userEmail: string;
  netAmount: number; // Positive = owed to user, Negative = user owes (in cents)
  credits: number;   // Total paid by user (in cents)
  debits: number;    // Total owed by user (in cents)
  settlementsIn: number;  // Total received in settlements (in cents)
  settlementsOut: number; // Total paid in settlements (in cents)
}

export interface SettlementSuggestion {
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: number; // Amount in cents
  description: string;
}

export interface GroupBalanceSummary {
  groupId: string;
  groupName: string;
  totalExpenses: number;
  totalSettlements: number;
  userBalances: UserBalance[];
  settlementSuggestions: SettlementSuggestion[];
  currencyCode: string;
}

export class SplitwiseBalanceService {
  /**
   * Calculate balances for all users in a group
   */
  static async calculateGroupBalances(groupId: string): Promise<GroupBalanceSummary> {
    try {
      console.log(`🔍 Calculating balances for group: ${groupId}`);
      
      // Get group details
      const group = await prisma.splitwiseGroup.findUnique({
        where: { id: groupId },
        select: { id: true, name: true, currencyCode: true }
      });

      if (!group) {
        console.error(`❌ Group not found: ${groupId}`);
        throw new Error(`Group not found: ${groupId}`);
      }

      console.log(`✅ Found group: ${group.name} (${group.id})`);

      // Get group members to verify they exist
      const members = await prisma.splitwiseGroupMember.findMany({
        where: { groupId },
        include: { user: { select: { id: true, name: true, email: true } } }
      });

      console.log(`👥 Found ${members.length} members in group`);

      if (members.length === 0) {
        console.warn(`⚠️ No members found in group: ${groupId}`);
        // Return empty balance summary for groups with no members
        return {
          groupId: group.id,
          groupName: group.name,
          totalExpenses: 0,
          totalSettlements: 0,
          userBalances: [],
          settlementSuggestions: [],
          currencyCode: group.currencyCode
        };
      }

      // Calculate user balances using raw SQL for better performance
      const balances = await this.calculateUserBalances(groupId);
      console.log(`💰 Calculated balances for ${balances.length} users`);
      
      // Generate settlement suggestions
      const suggestions = this.generateSettlementSuggestions(balances);
      console.log(`💡 Generated ${suggestions.length} settlement suggestions`);
      
      // Get summary statistics
      const totalExpenses = balances.reduce((sum, balance) => sum + balance.credits, 0);
      const totalSettlements = balances.reduce((sum, balance) => sum + balance.settlementsIn + balance.settlementsOut, 0) / 2; // Divide by 2 since each settlement affects 2 users

      const result = {
        groupId: group.id,
        groupName: group.name,
        totalExpenses,
        totalSettlements,
        userBalances: balances,
        settlementSuggestions: suggestions,
        currencyCode: group.currencyCode
      };

      console.log(`✅ Successfully calculated balances for group: ${groupId}`);
      return result;
    } catch (error) {
      console.error(`❌ Error calculating balances for group ${groupId}:`, error);
      throw error;
    }
  }

  /**
   * Calculate balances for individual users in a group
   */
  private static async calculateUserBalances(groupId: string): Promise<UserBalance[]> {
    try {
      console.log(`🔍 Calculating user balances for group: ${groupId}`);
      
      const balances = await prisma.$queryRaw`
        WITH credits AS (
          SELECT 
            "payerId" AS user_id,
            SUM(CAST(amount * 100 AS BIGINT)) AS credits
          FROM splitwise_expenses
          WHERE "groupId" = ${groupId}
          GROUP BY "payerId"
        ),
        debits AS (
          SELECT 
            ep."userId",
            SUM(CAST(ep."shareAmount" * 100 AS BIGINT)) AS debits
          FROM splitwise_expense_shares ep
          JOIN splitwise_expenses e ON e.id = ep."expenseId"
          WHERE e."groupId" = ${groupId}
          GROUP BY ep."userId"
        ),
        settlements_in AS (
          SELECT 
            "toUserId" AS user_id,
            SUM(CAST(amount * 100 AS BIGINT)) AS settlements_in
          FROM splitwise_settlements
          WHERE "groupId" = ${groupId}
          GROUP BY "toUserId"
        ),
        settlements_out AS (
          SELECT 
            "fromUserId" AS user_id,
            SUM(CAST(amount * 100 AS BIGINT)) AS settlements_out
          FROM splitwise_settlements
          WHERE "groupId" = ${groupId}
          GROUP BY "fromUserId"
        )
        SELECT 
          u.id as "userId",
          u.name as "userName",
          u.email as "userEmail",
          COALESCE(c.credits, 0) - COALESCE(d.debits, 0) + 
          COALESCE(si.settlements_in, 0) - COALESCE(so.settlements_out, 0) AS "netAmount",
          COALESCE(c.credits, 0) AS credits,
          COALESCE(d.debits, 0) AS debits,
          COALESCE(si.settlements_in, 0) AS "settlementsIn",
          COALESCE(so.settlements_out, 0) AS "settlementsOut"
        FROM splitwise_group_members gm
        JOIN users u ON u.id = gm."userId"
        LEFT JOIN credits c ON c.user_id = u.id
        LEFT JOIN debits d ON d."userId" = u.id
        LEFT JOIN settlements_in si ON si.user_id = u.id
        LEFT JOIN settlements_out so ON so.user_id = u.id
        WHERE gm."groupId" = ${groupId}
        ORDER BY u.name;
      `;

      console.log(`✅ Successfully calculated user balances for group: ${groupId}`);
      return balances as UserBalance[];
    } catch (error) {
      console.error(`❌ Error calculating user balances for group ${groupId}:`, error);
      
      // Check if it's a database connection error
      if (error instanceof Error) {
        if (error.message.includes('connection') || error.message.includes('timeout')) {
          throw new Error(`Database connection error while calculating balances: ${error.message}`);
        }
        if (error.message.includes('relation') || error.message.includes('table')) {
          throw new Error(`Database schema error: ${error.message}`);
        }
      }
      
      throw new Error(`Failed to calculate user balances: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate optimal settlement suggestions to minimize cash flow
   */
  static generateSettlementSuggestions(balances: UserBalance[]): SettlementSuggestion[] {
    const epsilon = 1; // 1 cent tolerance for rounding errors
    
    // Separate debtors (negative balance) and creditors (positive balance)
    const debtors = balances
      .filter(b => b.netAmount < -epsilon)
      .map(b => ({ ...b, netAmount: -b.netAmount })) // Convert to positive for easier processing
      .sort((a, b) => b.netAmount - a.netAmount); // Biggest debtor first
    
    const creditors = balances
      .filter(b => b.netAmount > epsilon)
      .sort((a, b) => b.netAmount - a.netAmount); // Biggest creditor first

    const suggestions: SettlementSuggestion[] = [];
    let debtorIndex = 0;
    let creditorIndex = 0;

    while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
      const debtor = debtors[debtorIndex];
      const creditor = creditors[creditorIndex];
      
      // Calculate payment amount (minimum of what debtor owes and creditor is owed)
      const paymentAmount = Math.min(debtor.netAmount, creditor.netAmount);
      
      suggestions.push({
        fromUserId: debtor.userId,
        fromUserName: debtor.userName,
        toUserId: creditor.userId,
        toUserName: creditor.userName,
        amount: paymentAmount,
        description: `${debtor.userName} pays ${creditor.userName} $${(paymentAmount / 100).toFixed(2)}`
      });

      // Update remaining amounts
      debtor.netAmount -= paymentAmount;
      creditor.netAmount -= paymentAmount;

      // Move to next debtor/creditor if current one is settled
      if (debtor.netAmount <= epsilon) {
        debtorIndex++;
      }
      if (creditor.netAmount <= epsilon) {
        creditorIndex++;
      }
    }

    return suggestions;
  }

  /**
   * Get simplified balance for a specific user in a group
   */
  static async getUserBalanceInGroup(userId: string, groupId: string): Promise<UserBalance | null> {
    const balances = await this.calculateUserBalances(groupId);
    return balances.find(b => b.userId === userId) || null;
  }

  /**
   * Get all groups where user has a balance (for dashboard)
   */
  static async getUserGroupBalances(userId: string): Promise<Array<{
    groupId: string;
    groupName: string;
    netAmount: number;
    currencyCode: string;
  }>> {
    const userGroups = await prisma.splitwiseGroup.findMany({
      where: {
        members: {
          some: { userId }
        }
      },
      select: {
        id: true,
        name: true,
        currencyCode: true
      }
    });

    const balances = await Promise.all(
      userGroups.map(async (group) => {
        const userBalance = await this.getUserBalanceInGroup(userId, group.id);
        return {
          groupId: group.id,
          groupName: group.name,
          netAmount: userBalance?.netAmount || 0,
          currencyCode: group.currencyCode
        };
      })
    );

    return balances;
  }

  /**
   * Validate that group balances sum to zero (accounting principle)
   */
  static async validateGroupBalances(groupId: string): Promise<{
    isValid: boolean;
    totalNet: number;
    message: string;
  }> {
    const balances = await this.calculateUserBalances(groupId);
    const totalNet = balances.reduce((sum, balance) => sum + balance.netAmount, 0);
    
    // Allow small tolerance for rounding errors (1 cent per user)
    const tolerance = balances.length;
    const isValid = Math.abs(totalNet) <= tolerance;
    
    return {
      isValid,
      totalNet,
      message: isValid 
        ? "Group balances are valid" 
        : `Group balances don't sum to zero. Total net: ${(totalNet / 100).toFixed(2)} cents`
    };
  }

  /**
   * Get balance history for a user in a group (for charts/analytics)
   */
  static async getUserBalanceHistory(userId: string, groupId: string, days: number = 30): Promise<Array<{
    date: string;
    netAmount: number;
    credits: number;
    debits: number;
  }>> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get expenses and settlements for the period
    const expenses = await prisma.splitwiseExpense.findMany({
      where: {
        groupId,
        OR: [
          { payerId: userId },
          { shares: { some: { userId } } }
        ],
        date: { gte: startDate }
      },
      include: {
        shares: { where: { userId } },
        payer: { select: { id: true } }
      },
      orderBy: { date: 'asc' }
    });

    const settlements = await prisma.splitwiseSettlement.findMany({
      where: {
        groupId,
        OR: [
          { fromUserId: userId },
          { toUserId: userId }
        ],
        createdAt: { gte: startDate }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Build daily balance history
    const balanceHistory: { [date: string]: { netAmount: number; credits: number; debits: number } } = {};
    
    // Initialize all dates with zero balances
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      balanceHistory[dateStr] = { netAmount: 0, credits: 0, debits: 0 };
    }

    // Add expenses
    expenses.forEach(expense => {
      const dateStr = expense.date.toISOString().split('T')[0];
      if (balanceHistory[dateStr]) {
        if (expense.payerId === userId) {
          balanceHistory[dateStr].credits += Math.round(Number(expense.amount) * 100);
        }
        const userShare = expense.shares[0];
        if (userShare) {
          balanceHistory[dateStr].debits += Math.round(Number(userShare.shareAmount) * 100);
        }
      }
    });

    // Add settlements
    settlements.forEach(settlement => {
      const dateStr = settlement.createdAt.toISOString().split('T')[0];
      if (balanceHistory[dateStr]) {
        if (settlement.fromUserId === userId) {
          balanceHistory[dateStr].netAmount -= Math.round(Number(settlement.amount) * 100);
        } else if (settlement.toUserId === userId) {
          balanceHistory[dateStr].netAmount += Math.round(Number(settlement.amount) * 100);
        }
      }
    });

    // Convert to array and calculate cumulative net amounts
    let cumulativeNet = 0;
    return Object.entries(balanceHistory)
      .map(([date, balance]) => {
        cumulativeNet += balance.credits - balance.debits + balance.netAmount;
        return {
          date,
          netAmount: cumulativeNet,
          credits: balance.credits,
          debits: balance.debits
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}
