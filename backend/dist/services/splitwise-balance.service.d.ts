export interface UserBalance {
    userId: string;
    userName: string;
    userEmail: string;
    netAmount: number;
    credits: number;
    debits: number;
    settlementsIn: number;
    settlementsOut: number;
}
export interface SettlementSuggestion {
    fromUserId: string;
    fromUserName: string;
    toUserId: string;
    toUserName: string;
    amount: number;
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
export declare class SplitwiseBalanceService {
    static calculateGroupBalances(groupId: string): Promise<GroupBalanceSummary>;
    private static calculateUserBalances;
    static generateSettlementSuggestions(balances: UserBalance[]): SettlementSuggestion[];
    static getUserBalanceInGroup(userId: string, groupId: string): Promise<UserBalance | null>;
    static getUserGroupBalances(userId: string): Promise<Array<{
        groupId: string;
        groupName: string;
        netAmount: number;
        currencyCode: string;
    }>>;
    static validateGroupBalances(groupId: string): Promise<{
        isValid: boolean;
        totalNet: number;
        message: string;
    }>;
    static getUserBalanceHistory(userId: string, groupId: string, days?: number): Promise<Array<{
        date: string;
        netAmount: number;
        credits: number;
        debits: number;
    }>>;
}
//# sourceMappingURL=splitwise-balance.service.d.ts.map