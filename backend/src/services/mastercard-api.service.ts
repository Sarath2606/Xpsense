import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { logger } from '../utils/logger';
import { Encryption } from '../utils/encryption';

export interface MastercardTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

export interface MastercardAccount {
  accountId: string;
  accountName: string;
  accountType: string;
  bankName: string;
  accountNumber?: string;
  balance: number;
  currency: string;
}

export interface MastercardTransaction {
  transactionId: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  type: 'DEBIT' | 'CREDIT';
  category?: string;
  metadata?: any;
}

export class MastercardApiService {
  private client: AxiosInstance;
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;

  constructor() {
    this.baseUrl = process.env.MASTERCARD_API_BASE_URL || 'https://sandbox.api.mastercard.com/open-banking';
    this.clientId = process.env.MASTERCARD_CLIENT_ID || '';
    this.clientSecret = process.env.MASTERCARD_CLIENT_SECRET || '';

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
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

    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        logger.debug(`Mastercard API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        logger.error('Mastercard API Response Error:', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message,
          data: error.response?.data
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get OAuth access token using client credentials
   */
  async getAccessToken(): Promise<MastercardTokenResponse> {
    try {
      const authUrl = process.env.MASTERCARD_AUTH_URL || 'https://sandbox.api.mastercard.com/oauth2/token';
      
      const response: AxiosResponse<MastercardTokenResponse> = await axios.post(authUrl, 
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
          }
        }
      );

      logger.info('Successfully obtained Mastercard access token');
      return response.data;
    } catch (error) {
      logger.error('Failed to get Mastercard access token:', error);
      throw new Error('Failed to authenticate with Mastercard API');
    }
  }

  /**
   * Get user's connected accounts
   */
  async getAccounts(accessToken: string): Promise<MastercardAccount[]> {
    try {
      const response: AxiosResponse<{ accounts: MastercardAccount[] }> = await this.client.get('/accounts', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      logger.info(`Retrieved ${response.data.accounts.length} accounts from Mastercard API`);
      return response.data.accounts;
    } catch (error) {
      logger.error('Failed to get accounts from Mastercard API:', error);
      throw new Error('Failed to retrieve accounts');
    }
  }

  /**
   * Get account balance
   */
  async getAccountBalance(accessToken: string, accountId: string): Promise<{ balance: number; currency: string }> {
    try {
      const response: AxiosResponse<{ balance: number; currency: string }> = await this.client.get(
        `/accounts/${accountId}/balance`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      logger.info(`Retrieved balance for account ${accountId}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to get balance for account ${accountId}:`, error);
      throw new Error('Failed to retrieve account balance');
    }
  }

  /**
   * Get transactions for an account
   */
  async getTransactions(
    accessToken: string, 
    accountId: string, 
    fromDate?: string, 
    toDate?: string,
    limit: number = 100
  ): Promise<MastercardTransaction[]> {
    try {
      const params: any = { limit };
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const response: AxiosResponse<{ transactions: MastercardTransaction[] }> = await this.client.get(
        `/accounts/${accountId}/transactions`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          params
        }
      );

      logger.info(`Retrieved ${response.data.transactions.length} transactions for account ${accountId}`);
      return response.data.transactions;
    } catch (error) {
      logger.error(`Failed to get transactions for account ${accountId}:`, error);
      throw new Error('Failed to retrieve transactions');
    }
  }

  /**
   * Initiate OAuth flow for user consent
   */
  generateOAuthUrl(state: string): string {
    const redirectUri = encodeURIComponent(process.env.OAUTH_REDIRECT_URI || 'http://localhost:3001/api/auth/callback');
    const scope = encodeURIComponent('accounts transactions');
    
    return `${this.baseUrl}/oauth2/authorize?` +
           `client_id=${this.clientId}&` +
           `redirect_uri=${redirectUri}&` +
           `response_type=code&` +
           `scope=${scope}&` +
           `state=${state}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<MastercardTokenResponse> {
    try {
      const authUrl = process.env.MASTERCARD_AUTH_URL || 'https://sandbox.api.mastercard.com/oauth2/token';
      const redirectUri = process.env.OAUTH_REDIRECT_URI || 'http://localhost:3001/api/auth/callback';
      
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
      const authUrl = process.env.MASTERCARD_AUTH_URL || 'https://sandbox.api.mastercard.com/oauth2/token';
      
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
}

export const mastercardApiService = new MastercardApiService();
