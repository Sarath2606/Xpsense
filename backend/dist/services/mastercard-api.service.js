"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mastercardApiService = exports.MastercardApiService = exports.CDR_SCOPES = void 0;
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../utils/logger");
const encryption_1 = require("../utils/encryption");
exports.CDR_SCOPES = {
    ACCOUNTS_BASIC: 'bank:accounts.basic:read',
    ACCOUNTS_DETAIL: 'bank:accounts.detail:read',
    TRANSACTIONS: 'bank:transactions:read',
    BALANCES: 'bank:balances:read',
    OFFLINE_ACCESS: 'offline_access',
    OPENID: 'openid',
    PROFILE: 'profile'
};
class MastercardApiService {
    constructor() {
        this.isSandboxDown = false;
        this.lastHealthCheck = 0;
        this.HEALTH_CHECK_INTERVAL = 5 * 60 * 1000;
        this.MAX_RETRIES = 5;
        this.INITIAL_BACKOFF_MS = 400;
        this.baseUrl = process.env.MASTERCARD_API_BASE_URL || 'https://sandbox.api.mastercard.com/open-banking';
        this.clientId = process.env.MASTERCARD_CLIENT_ID || '';
        this.clientSecret = process.env.MASTERCARD_CLIENT_SECRET || '';
        this.partnerId = process.env.MASTERCARD_PARTNER_ID || '';
        this.client = axios_1.default.create({
            baseURL: this.baseUrl,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        this.client.interceptors.request.use((config) => {
            logger_1.logger.debug(`Mastercard API Request: ${config.method?.toUpperCase()} ${config.url}`);
            return config;
        }, (error) => {
            logger_1.logger.error('Mastercard API Request Error:', error);
            return Promise.reject(error);
        });
        this.client.interceptors.response.use((response) => {
            logger_1.logger.debug(`Mastercard API Response: ${response.status} ${response.config.url}`);
            this.isSandboxDown = false;
            return response;
        }, (error) => {
            logger_1.logger.error('Mastercard API Response Error:', {
                status: error.response?.status,
                url: error.config?.url,
                message: error instanceof Error ? error.message : String(error),
                data: error.response?.data,
                correlationId: error.response?.headers?.['x-correlation-id'] || error.response?.headers?.['x-correlationid']
            });
            const axiosError = error;
            if (axiosError.response?.status === 503 ||
                axiosError.code === 'ECONNREFUSED' ||
                axiosError.code === 'ENOTFOUND' ||
                axiosError.code === 'ETIMEDOUT') {
                this.isSandboxDown = true;
                logger_1.logger.warn('Mastercard sandbox appears to be down or experiencing issues');
            }
            return Promise.reject(error);
        });
    }
    async executeWithRetry(operation, context) {
        let attempt = 0;
        let backoff = this.INITIAL_BACKOFF_MS;
        const operationCorrelationId = cryptoRandomId();
        while (true) {
            try {
                const response = await operation();
                const corr = response.headers?.['x-correlation-id'] || response.headers?.['x-correlationid'];
                if (corr) {
                    logger_1.logger.info(`${context.name} succeeded`, { correlationId: corr, status: response.status });
                }
                else {
                    logger_1.logger.info(`${context.name} succeeded`, { status: response.status, operationCorrelationId });
                }
                return response;
            }
            catch (err) {
                attempt += 1;
                const status = err?.response?.status;
                const code = err?.code;
                const corr = err?.response?.headers?.['x-correlation-id'] || err?.response?.headers?.['x-correlationid'];
                const retriableStatus = status && (status === 429 || status >= 500);
                const retriableCode = code === 'ECONNRESET' || code === 'ECONNREFUSED' || code === 'ENOTFOUND' || code === 'ETIMEDOUT' || code === 'EAI_AGAIN';
                const shouldRetry = attempt <= this.MAX_RETRIES && (retriableStatus || retriableCode);
                logger_1.logger.warn(`${context.name} attempt ${attempt} failed`, {
                    status,
                    code,
                    correlationId: corr,
                    operationCorrelationId,
                    willRetry: shouldRetry,
                });
                if (!shouldRetry) {
                    throw err;
                }
                const jitter = Math.floor(Math.random() * backoff);
                const delay = jitter;
                await sleep(delay);
                backoff = Math.min(backoff * 2, 8000);
            }
        }
    }
    async checkSandboxHealth() {
        return !this.isSandboxDown;
    }
    getSandboxStatus() {
        const status = {
            isDown: this.isSandboxDown,
            lastCheck: this.lastHealthCheck
        };
        if (this.isSandboxDown) {
            const timeSinceLastCheck = Date.now() - this.lastHealthCheck;
            if (timeSinceLastCheck < 2 * 60 * 60 * 1000) {
                status.estimatedRecovery = '2-4 hours (typical maintenance window)';
            }
            else if (timeSinceLastCheck < 6 * 60 * 60 * 1000) {
                status.estimatedRecovery = '4-6 hours (extended maintenance)';
            }
            else {
                status.estimatedRecovery = '6-24 hours (unusual downtime - contact support)';
            }
        }
        return status;
    }
    async testConnectivity() {
        try {
            const response = await this.client.get('/institutions', { timeout: 10000 });
            this.isSandboxDown = false;
            logger_1.logger.info('Mastercard sandbox connectivity test successful');
            return true;
        }
        catch (error) {
            this.isSandboxDown = true;
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger_1.logger.warn('Mastercard sandbox connectivity test failed:', errorMessage);
            return false;
        }
    }
    async createConsentSession(scopes, redirectUri, state, nonce, durationDays = 180) {
        try {
            const scopeString = scopes.join(' ');
            const response = await this.executeWithRetry(() => this.client.post('/consents', {
                scopes: scopeString,
                redirect_uri: redirectUri,
                state,
                nonce,
                duration: durationDays,
                client_id: this.clientId,
                partner_id: this.partnerId
            }), { name: 'createConsentSession', url: '/consents' });
            logger_1.logger.info('Successfully created consent session');
            return response.data;
        }
        catch (error) {
            logger_1.logger.error('Failed to create consent session:', error);
            if (error instanceof Error) {
                if (error.message.includes('sandbox is currently unavailable')) {
                    throw error;
                }
                const axiosError = error;
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
    async exchangeCodeForToken(code, redirectUri) {
        try {
            const authUrl = process.env.MASTERCARD_AUTH_URL || 'https://api.openbanking.mastercard.com.au/oauth2/token';
            const response = await axios_1.default.post(authUrl, `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(redirectUri)}`, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
                }
            });
            logger_1.logger.info('Successfully exchanged authorization code for access token');
            return response.data;
        }
        catch (error) {
            logger_1.logger.error('Failed to exchange authorization code for token:', error);
            throw new Error('Failed to complete OAuth flow');
        }
    }
    async refreshToken(refreshToken) {
        try {
            const authUrl = process.env.MASTERCARD_AUTH_URL || 'https://api.openbanking.mastercard.com.au/oauth2/token';
            const response = await axios_1.default.post(authUrl, `grant_type=refresh_token&refresh_token=${refreshToken}`, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
                }
            });
            logger_1.logger.info('Successfully refreshed access token');
            return response.data;
        }
        catch (error) {
            logger_1.logger.error('Failed to refresh access token:', error);
            throw new Error('Failed to refresh access token');
        }
    }
    async getAccounts(accessToken) {
        try {
            const response = await this.executeWithRetry(() => this.client.get('/accounts', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }), { name: 'getAccounts', url: '/accounts' });
            logger_1.logger.info(`Retrieved ${response.data.accounts.length} accounts from Mastercard API`);
            return response.data.accounts;
        }
        catch (error) {
            logger_1.logger.error('Failed to get accounts from Mastercard API:', error);
            throw new Error('Failed to retrieve accounts');
        }
    }
    async getAccountBalances(accessToken, accountId) {
        try {
            const response = await this.executeWithRetry(() => this.client.get(`/accounts/${accountId}/balances`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }), { name: 'getAccountBalances', url: `/accounts/${accountId}/balances` });
            logger_1.logger.info(`Retrieved balances for account ${accountId}`);
            return response.data.balances;
        }
        catch (error) {
            logger_1.logger.error(`Failed to get balances for account ${accountId}:`, error);
            throw new Error('Failed to retrieve account balances');
        }
    }
    async getTransactions(accessToken, accountId, fromDate, toDate, pageSize = 100, nextPage) {
        try {
            const params = { pageSize };
            if (fromDate)
                params.fromDate = fromDate;
            if (toDate)
                params.toDate = toDate;
            if (nextPage)
                params.nextPage = nextPage;
            const response = await this.executeWithRetry(() => this.client.get(`/accounts/${accountId}/transactions`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                params
            }), { name: 'getTransactions', url: `/accounts/${accountId}/transactions` });
            logger_1.logger.info(`Retrieved ${response.data.transactions.length} transactions for account ${accountId}`);
            return response.data;
        }
        catch (error) {
            logger_1.logger.error(`Failed to get transactions for account ${accountId}:`, error);
            throw new Error('Failed to retrieve transactions');
        }
    }
    async revokeConsent(consentId) {
        try {
            await this.executeWithRetry(() => this.client.delete(`/consents/${consentId}`), { name: 'revokeConsent', url: `/consents/${consentId}` });
            logger_1.logger.info(`Successfully revoked consent ${consentId}`);
        }
        catch (error) {
            logger_1.logger.error(`Failed to revoke consent ${consentId}:`, error);
            throw new Error('Failed to revoke consent');
        }
    }
    async getConsentStatus(consentId) {
        try {
            const response = await this.executeWithRetry(() => this.client.get(`/consents/${consentId}`, {
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
                }
            }), { name: 'getConsentStatus', url: `/consents/${consentId}` });
            return response.data;
        }
        catch (error) {
            logger_1.logger.error(`Failed to get consent status for ${consentId}:`, error);
            throw new Error('Failed to get consent status');
        }
    }
    async getInstitutions() {
        try {
            const response = await this.executeWithRetry(() => this.client.get('/institutions'), { name: 'getInstitutions', url: '/institutions' });
            return response.data.institutions;
        }
        catch (error) {
            logger_1.logger.error('Failed to get institutions:', error);
            throw new Error('Failed to retrieve institutions');
        }
    }
    validateWebhookSignature(payload, signature) {
        try {
            const expectedSignature = encryption_1.Encryption.hash(payload + this.clientSecret);
            return signature === expectedSignature;
        }
        catch (error) {
            logger_1.logger.error('Failed to validate webhook signature:', error);
            return false;
        }
    }
    generateOAuthUrl(state) {
        if (!this.clientId || !this.partnerId) {
            logger_1.logger.error('Mastercard credentials not configured');
            throw new Error('Mastercard credentials not configured');
        }
        const redirectUri = encodeURIComponent(process.env.OAUTH_REDIRECT_URI || 'http://localhost:3001/api/consents/callback');
        const scope = encodeURIComponent(Object.values(exports.CDR_SCOPES).join(' '));
        return `${this.baseUrl}/oauth2/authorize?` +
            `client_id=${this.clientId}&` +
            `partner_id=${this.partnerId}&` +
            `redirect_uri=${redirectUri}&` +
            `response_type=code&` +
            `scope=${scope}&` +
            `state=${state}`;
    }
}
exports.MastercardApiService = MastercardApiService;
exports.mastercardApiService = new MastercardApiService();
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function cryptoRandomId() {
    try {
        const crypto = require('crypto');
        return crypto.randomBytes(8).toString('hex');
    }
    catch (_e) {
        return Math.random().toString(16).slice(2, 10);
    }
}
//# sourceMappingURL=mastercard-api.service.js.map