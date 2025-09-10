import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { logger } from '../utils/logger';
import { Encryption } from '../utils/encryption';

// CDR-Compliant Consent Scopes for Australia
export const CDR_SCOPES = {
  ACCOUNTS_BASIC: 'bank:accounts.basic:read',
  ACCOUNTS_DETAIL: 'bank:accounts.detail:read',
  TRANSACTIONS: 'bank:transactions:read',
  BALANCES: 'bank:balances:read',
  OFFLINE_ACCESS: 'offline_access',
  OPENID: 'openid',
  PROFILE: 'profile'
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

export class MastercardApiService {
  private client: AxiosInstance;
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;
  private partnerId: string;
  private appToken: string;
  private isSandboxDown: boolean = false;
  private lastHealthCheck: number = 0;
  private readonly HEALTH_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_RETRIES = 5;
  private readonly INITIAL_BACKOFF_MS = 400;

  constructor() {
    this.baseUrl = process.env.MASTERCARD_API_BASE_URL || 'https://api.openbanking.mastercard.com.au';
    this.clientId = process.env.MASTERCARD_CLIENT_ID || '5ad34a4227b6c585beaa8dc7e1d2d2f5';
    this.clientSecret = process.env.MASTERCARD_CLIENT_SECRET || 'QFgTbpYOHHPBU8xfFZ5p';
    this.partnerId = process.env.MASTERCARD_PARTNER_ID || '2445584957219';
    this.appToken = process.env.MASTERCARD_APP_TOKEN || '';

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'App-Token': this.appToken
      }
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.debug(`Mastercard API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('Mastercard API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging and sandbox status tracking
    this.client.interceptors.response.use(
      (response) => {
        logger.debug(`Mastercard API Response: ${response.status} ${response.config.url}`);
        this.isSandboxDown = false; // Reset flag on successful response
        return response;
      },
      (error) => {
        logger.error('Mastercard API Response Error:', {
          status: error.response?.status,
          url: error.config?.url,
          message: error instanceof Error ? error.message : String(error),
          data: error.response?.data,
          correlationId: error.response?.headers?.['x-correlation-id'] || error.response?.headers?.['x-correlationid']
        });

        // Track sandbox downtime
        const axiosError = error as any;
        if (axiosError.response?.status === 503 || 
            axiosError.code === 'ECONNREFUSED' || 
            axiosError.code === 'ENOTFOUND' ||
            axiosError.code === 'ETIMEDOUT') {
          this.isSandboxDown = true;
          logger.warn('Mastercard sandbox appears to be down or experiencing issues');
        }

        return Promise.reject(error);
      }
    );
  }

  private async executeWithRetry<T>(
    operation: () => Promise<AxiosResponse<T>>,
    context: { name: string; url?: string }
  ): Promise<AxiosResponse<T>> {
    let attempt = 0;
    let backoff = this.INITIAL_BACKOFF_MS;
    // Use static correlation id per operation chain to help tracing
    const operationCorrelationId = cryptoRandomId();

    while (true) {
      try {
        const response = await operation();
        const corr = (response.headers as any)?.['x-correlation-id'] || (response.headers as any)?.['x-correlationid'];
        if (corr) {
          logger.info(`${context.name} succeeded`, { correlationId: corr, status: response.status });
        } else {
          logger.info(`${context.name} succeeded`, { status: response.status, operationCorrelationId });
        }
        return response;
      } catch (err: any) {
        attempt += 1;
        const status: number | undefined = err?.response?.status;
        const code: string | undefined = err?.code;
        const corr = err?.response?.headers?.['x-correlation-id'] || err?.response?.headers?.['x-correlationid'];

        const retriableStatus = status && (status === 429 || status >= 500);
        const retriableCode = code === 'ECONNRESET' || code === 'ECONNREFUSED' || code === 'ENOTFOUND' || code === 'ETIMEDOUT' || code === 'EAI_AGAIN';

        const shouldRetry = attempt <= this.MAX_RETRIES && (retriableStatus || retriableCode);

        logger.warn(`${context.name} attempt ${attempt} failed`, {
          status,
          code,
          correlationId: corr,
          operationCorrelationId,
          willRetry: shouldRetry,
        });

        if (!shouldRetry) {
          throw err;
        }

        // Exponential backoff with full jitter
        const jitter = Math.floor(Math.random() * backoff);
        const delay = jitter;
        await sleep(delay);
        backoff = Math.min(backoff * 2, 8000);
      }
    }
  }

  /**
   * Check if sandbox is currently down
   * Note: Removed health endpoint check as it's not a public endpoint
   */
  async checkSandboxHealth(): Promise<boolean> {
    // Since health endpoint is not available, we'll rely on actual API calls
    // to determine sandbox status
    return !this.isSandboxDown;
  }

  /**
   * Get sandbox status information
   */
  getSandboxStatus(): { isDown: boolean; lastCheck: number; estimatedRecovery?: string } {
    const status: { isDown: boolean; lastCheck: number; estimatedRecovery?: string } = {
      isDown: this.isSandboxDown,
      lastCheck: this.lastHealthCheck
    };

    if (this.isSandboxDown) {
      // Estimate recovery time based on typical sandbox maintenance patterns
      const timeSinceLastCheck = Date.now() - this.lastHealthCheck;
      if (timeSinceLastCheck < 2 * 60 * 60 * 1000) { // Less than 2 hours
        status.estimatedRecovery = '2-4 hours (typical maintenance window)';
      } else if (timeSinceLastCheck < 6 * 60 * 60 * 1000) { // Less than 6 hours
        status.estimatedRecovery = '4-6 hours (extended maintenance)';
      } else {
        status.estimatedRecovery = '6-24 hours (unusual downtime - contact support)';
      }
    }

    return status;
  }

  /**
   * Get App-Token for authentication
   */
  async getAppToken(): Promise<string> {
    if (this.appToken) {
      return this.appToken;
    }
    try {
      const response = await axios.post(`${this.baseUrl}/aggregation/v2/partners/authentication`, {
        partnerId: this.partnerId,
        partnerSecret: this.clientSecret
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'App-Key': this.clientId
        },
        timeout: 10000
      });

      if (response.data && response.data.token) {
        this.appToken = response.data.token;
        logger.info('Successfully obtained App-Token');
        return this.appToken;
      }
      
      throw new Error('No token received from authentication endpoint');
    } catch (error) {
      logger.error('Failed to get App-Token:', error);
      throw error;
    }
  }

  /**
   * Test connectivity by calling OAuth token endpoint as recommended by Mastercard AU
   * Success (HTTP 200) indicates connectivity. 4xx implies connectivity but config issue.
   */
  async testConnectivity(): Promise<boolean> {
    try {
      const authUrl = process.env.MASTERCARD_AUTH_URL || 'https://api.openbanking.mastercard.com.au/oauth2/token';
      const response: AxiosResponse = await axios.post(
        authUrl,
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
          },
          timeout: 10000
        }
      );
      logger.info('Mastercard OAuth connectivity test succeeded', { status: response.status });
      this.isSandboxDown = false;
      return true;
    } catch (error: any) {
      const status = error?.response?.status;
      if (status && status >= 400 && status < 500) {
        logger.warn('Mastercard OAuth connectivity reachable but returned 4xx (likely config issue)', { status });
        this.isSandboxDown = false;
        return true;
      }
      this.isSandboxDown = true;
      const message = error instanceof Error ? error.message : String(error);
      logger.warn('Mastercard OAuth connectivity test failed (likely sandbox down)', { message, status });
      return false;
    }
  }

  /**
   * Create CDR-compliant consent session with enhanced error handling
   */
  async createConsentSession(
    scopes: string[],
    redirectUri: string,
    state: string,
    nonce: string,
    durationDays: number = 180
  ): Promise<MastercardConsentSession> {
    try {
      // Note: Removed health check as it was using non-existent endpoint

      const scopeString = scopes.join(' ');
      
      const response: AxiosResponse<MastercardConsentSession> = await this.executeWithRetry<MastercardConsentSession>(
        () => this.client.post('/consents', {
          scopes: scopeString,
          redirect_uri: redirectUri,
          state,
          nonce,
          duration: durationDays,
          client_id: this.clientId,
          partner_id: this.partnerId
        }),
        { name: 'createConsentSession', url: '/consents' }
      );

      logger.info('Successfully created consent session');
      return response.data;
    } catch (error) {
      logger.error('Failed to create consent session:', error);
      
      // Provide specific error messages for different failure scenarios
      if (error instanceof Error) {
        if (error.message.includes('sandbox is currently unavailable')) {
          throw error; // Re-throw our custom error
        }
        
        // Type assertion for axios errors
        const axiosError = error as any;
        if (axiosError.response?.status === 503) {
          throw new Error('Mastercard sandbox is experiencing maintenance. Please try again in 2-4 hours.');
        }
        
        if (axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ENOTFOUND') {
          throw new Error('Cannot connect to Mastercard sandbox. Please check your internet connection and try again.');
        }
        
        if (axiosError.code === 'ETIMEDOUT') {
          throw new Error('Mastercard sandbox request timed out. Please try again later.');
        }
      }
      
      throw new Error('Failed to create consent session. Please try again later.');
    }
  }

  /**
   * Exchange authorization code for access token (CDR-compliant)
   */
  async exchangeCodeForToken(code: string, redirectUri: string): Promise<MastercardTokenResponse> {
    try {
      const authUrl = process.env.MASTERCARD_AUTH_URL || 'https://api.openbanking.mastercard.com.au/oauth2/token';
      
      const response: AxiosResponse<MastercardTokenResponse> = await axios.post(authUrl,
        `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(redirectUri)}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
          }
        }
      );

      logger.info('Successfully exchanged authorization code for access token');
      return response.data;
    } catch (error) {
      logger.error('Failed to exchange authorization code for token:', error);
      throw new Error('Failed to complete OAuth flow');
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<MastercardTokenResponse> {
    try {
      const authUrl = process.env.MASTERCARD_AUTH_URL || 'https://api.openbanking.mastercard.com.au/oauth2/token';
      
      const response: AxiosResponse<MastercardTokenResponse> = await axios.post(authUrl,
        `grant_type=refresh_token&refresh_token=${refreshToken}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
          }
        }
      );

      logger.info('Successfully refreshed access token');
      return response.data;
    } catch (error) {
      logger.error('Failed to refresh access token:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * Get user's connected accounts (CDR-compliant)
   */
  async getAccounts(accessToken: string): Promise<MastercardAccount[]> {
    try {
      const response: AxiosResponse<{ accounts: MastercardAccount[] }> = await this.executeWithRetry(
        () => this.client.get('/accounts', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }),
        { name: 'getAccounts', url: '/accounts' }
      );

      logger.info(`Retrieved ${response.data.accounts.length} accounts from Mastercard API`);
      return response.data.accounts;
    } catch (error) {
      logger.error('Failed to get accounts from Mastercard API:', error);
      throw new Error('Failed to retrieve accounts');
    }
  }

  /**
   * Get account balances (CDR-compliant)
   */
  async getAccountBalances(accessToken: string, accountId: string): Promise<MastercardBalance[]> {
    try {
      const response: AxiosResponse<{ balances: MastercardBalance[] }> = await this.executeWithRetry(
        () => this.client.get(
          `/accounts/${accountId}/balances`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        ),
        { name: 'getAccountBalances', url: `/accounts/${accountId}/balances` }
      );

      logger.info(`Retrieved balances for account ${accountId}`);
      return response.data.balances;
    } catch (error) {
      logger.error(`Failed to get balances for account ${accountId}:`, error);
      throw new Error('Failed to retrieve account balances');
    }
  }

  /**
   * Get transactions for an account (CDR-compliant with pagination)
   */
  async getTransactions(
    accessToken: string, 
    accountId: string, 
    fromDate?: string, 
    toDate?: string,
    pageSize: number = 100,
    nextPage?: string
  ): Promise<MastercardTransactionResponse> {
    try {
      const params: any = { pageSize };
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      if (nextPage) params.nextPage = nextPage;

      const response: AxiosResponse<MastercardTransactionResponse> = await this.executeWithRetry(
        () => this.client.get(
          `/accounts/${accountId}/transactions`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            },
            params
          }
        ),
        { name: 'getTransactions', url: `/accounts/${accountId}/transactions` }
      );

      logger.info(`Retrieved ${response.data.transactions.length} transactions for account ${accountId}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to get transactions for account ${accountId}:`, error);
      throw new Error('Failed to retrieve transactions');
    }
  }

  /**
   * Revoke consent (CDR-compliant)
   */
  async revokeConsent(consentId: string): Promise<void> {
    try {
      await this.executeWithRetry(
        () => this.client.delete(`/consents/${consentId}`),
        { name: 'revokeConsent', url: `/consents/${consentId}` }
      );
      logger.info(`Successfully revoked consent ${consentId}`);
    } catch (error) {
      logger.error(`Failed to revoke consent ${consentId}:`, error);
      throw new Error('Failed to revoke consent');
    }
  }

  /**
   * Get consent status
   */
  async getConsentStatus(consentId: string): Promise<{ status: string; expiresAt?: string }> {
    try {
      const response: AxiosResponse<{ status: string; expiresAt?: string }> = await this.executeWithRetry(
        () => this.client.get(
          `/consents/${consentId}`,
          {
            headers: {
              'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
            }
          }
        ),
        { name: 'getConsentStatus', url: `/consents/${consentId}` }
      );

      return response.data;
    } catch (error) {
      logger.error(`Failed to get consent status for ${consentId}:`, error);
      throw new Error('Failed to get consent status');
    }
  }

  /**
   * Get supported institutions (banks)
   */
  async getInstitutions(): Promise<Array<{ id: string; name: string; logoUrl?: string }>> {
    try {
      const response: AxiosResponse<{ institutions: Array<{ id: string; name: string; logoUrl?: string }> }> = 
        await this.executeWithRetry(
          () => this.client.get('/institutions'),
          { name: 'getInstitutions', url: '/institutions' }
        );

      return response.data.institutions;
    } catch (error) {
      logger.error('Failed to get institutions:', error);
      throw new Error('Failed to retrieve institutions');
    }
  }

  /**
   * Validate webhook signature
   */
  validateWebhookSignature(payload: string, signature: string): boolean {
    try {
      // This is a placeholder - implement actual signature validation based on Mastercard's documentation
      const expectedSignature = Encryption.hash(payload + this.clientSecret);
      return signature === expectedSignature;
    } catch (error) {
      logger.error('Failed to validate webhook signature:', error);
      return false;
    }
  }

  /**
   * Create a test customer for Mastercard Open Banking
   */
  async createTestCustomer(userId: string, userEmail: string, userName: string): Promise<string> {
    try {
      const response = await this.client.post('/aggregation/v2/customers/testing', {
        username: `user_${userId}_${Date.now()}`,
        firstName: userName.split(' ')[0] || 'User',
        lastName: userName.split(' ').slice(1).join(' ') || 'Test',
        email: userEmail,
        phone: '+61412345678' // Default Australian phone number for testing
      }, {
        headers: {
          'App-Token': this.appToken,
          'App-Key': this.clientId
        }
      });

      if (response.data && response.data.id) {
        logger.info('Successfully created test customer');
        return response.data.id;
      }
      
      throw new Error('No customer ID received from API');
    } catch (error) {
      logger.error('Failed to create test customer:', error);
      throw new Error('Failed to create test customer for bank connection');
    }
  }

  /**
   * Generate Connect URL for bank connection (Mastercard Open Banking)
   */
  async generateConnectUrl(customerId: string, webhookUrl?: string): Promise<string> {
    if (!this.appToken || !this.partnerId) {
      logger.error('Mastercard credentials not configured or App-Token missing');
      throw new Error('Mastercard credentials not configured or App-Token missing');
    }

    // For development, use a public webhook service if no webhook URL is provided
    const finalWebhookUrl = webhookUrl || process.env.WEBHOOK_URL || 'https://webhook.site/unique-id-12345';

    try {
      const response = await this.client.post('/connect/v2/generate', {
        partnerId: this.partnerId,
        customerId: customerId,
        webhook: finalWebhookUrl
      }, {
        headers: {
          'App-Token': this.appToken,
          'App-Key': this.clientId
        }
      });

      if (response.data && response.data.link) {
        logger.info('Successfully generated Connect URL');
        return response.data.link;
      }
      
      throw new Error('No Connect URL received from API');
    } catch (error: any) {
      logger.error('Failed to generate Connect URL:', error);
      
      // For development, provide more helpful error messages
      if (error.response?.data?.message?.includes('webhook')) {
        throw new Error('Webhook URL must be publicly accessible. For development, use a service like webhook.site or ngrok to expose your local server.');
      }
      
      throw new Error('Failed to generate Connect URL for bank connection');
    }
  }

  /**
   * Generate OAuth URL for testing (fallback - deprecated)
   * @deprecated Use generateConnectUrl instead
   */
  generateOAuthUrl(state: string): string {
    logger.warn('generateOAuthUrl is deprecated. Use generateConnectUrl instead.');
    throw new Error('OAuth2 flow is not supported. Please use the Connect flow with generateConnectUrl method.');
  }
}

export const mastercardApiService = new MastercardApiService();

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cryptoRandomId(): string {
  try {
    // Prefer Node crypto when available
    const crypto = require('crypto');
    return crypto.randomBytes(8).toString('hex');
  } catch (_e) {
    // Fallback
    return Math.random().toString(16).slice(2, 10);
  }
}
