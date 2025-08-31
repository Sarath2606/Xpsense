export interface SyncResult {
    success: boolean;
    accountsSynced: number;
    transactionsSynced: number;
    balancesSynced: number;
    errors: string[];
}
export declare class SyncService {
    performInitialSync(consentId: string): Promise<SyncResult>;
    private syncAccounts;
    private syncBalances;
    private syncTransactions;
    performIncrementalSync(consentId: string): Promise<SyncResult>;
    private getFreshToken;
    private logAuditEvent;
    syncUserAccounts(userId: string): Promise<SyncResult>;
    syncAccount(accountId: string): Promise<SyncResult>;
    cleanupExpiredConsents(): Promise<void>;
}
export declare const syncService: SyncService;
//# sourceMappingURL=sync.service.d.ts.map