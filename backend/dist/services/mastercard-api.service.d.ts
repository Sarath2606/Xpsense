export declare const CDR_SCOPES: {
    ACCOUNTS_BASIC: string;
    ACCOUNTS_DETAIL: string;
    TRANSACTIONS: string;
    BALANCES: string;
    OFFLINE_ACCESS: string;
    OPENID: string;
    PROFILE: string;
};
export interface MastercardTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token?: string;
    scope?: string;
    consent_id?: string;
}
export interface MastercardConsentSession {
    consentId: string;
    redirectUrl: string;
    state: string;
    nonce: string;
}
export interface MastercardAccount {
    accountId: string;
    accountName: string;
    accountType: string;
    productCategory: string;
    bankName: string;
    accountNumber?: string;
    maskedNumber?: string;
    currency: string;
    status: 'OPEN' | 'CLOSED';
}
export interface MastercardBalance {
    accountId: string;
    current: string;
    available?: string;
    creditLimit?: string;
    currency: string;
    asAt: string;
}
export interface MastercardTransaction {
    transactionId: string;
    accountId: string;
    description: string;
    amount: string;
    currency: string;
    postedAt: string;
    type: 'DEBIT' | 'CREDIT';
    category?: string;
    merchantName?: string;
    metadata?: any;
}
export interface MastercardTransactionResponse {
    transactions: MastercardTransaction[];
    nextPage?: string;
    totalCount?: number;
}
export declare class MastercardApiService {
    private client;
    private baseUrl;
    private clientId;
    private clientSecret;
    private partnerId;
    private isSandboxDown;
    private lastHealthCheck;
    private readonly HEALTH_CHECK_INTERVAL;
    private readonly MAX_RETRIES;
    private readonly INITIAL_BACKOFF_MS;
    constructor();
    private executeWithRetry;
    checkSandboxHealth(): Promise<boolean>;
    getSandboxStatus(): {
        isDown: boolean;
        lastCheck: number;
        estimatedRecovery?: string;
    };
    testConnectivity(): Promise<boolean>;
    createConsentSession(scopes: string[], redirectUri: string, state: string, nonce: string, durationDays?: number): Promise<MastercardConsentSession>;
    exchangeCodeForToken(code: string, redirectUri: string): Promise<MastercardTokenResponse>;
    refreshToken(refreshToken: string): Promise<MastercardTokenResponse>;
    getAccounts(accessToken: string): Promise<MastercardAccount[]>;
    getAccountBalances(accessToken: string, accountId: string): Promise<MastercardBalance[]>;
    getTransactions(accessToken: string, accountId: string, fromDate?: string, toDate?: string, pageSize?: number, nextPage?: string): Promise<MastercardTransactionResponse>;
    revokeConsent(consentId: string): Promise<void>;
    getConsentStatus(consentId: string): Promise<{
        status: string;
        expiresAt?: string;
    }>;
    getInstitutions(): Promise<Array<{
        id: string;
        name: string;
        logoUrl?: string;
    }>>;
    validateWebhookSignature(payload: string, signature: string): boolean;
    generateOAuthUrl(state: string): string;
}
export declare const mastercardApiService: MastercardApiService;
//# sourceMappingURL=mastercard-api.service.d.ts.map