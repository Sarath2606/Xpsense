import { auth } from './firebase';

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get Firebase auth token
  async getAuthToken() {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }
      return await currentUser.getIdToken();
    } catch (error) {
      console.error('Failed to get auth token:', error);
      throw error;
    }
  }

  // Create headers with Firebase authentication
  async getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      try {
        const token = await this.getAuthToken();
        headers['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error('Failed to get auth token for headers:', error);
        // Don't throw here, let the request proceed without auth
      }
    }

    return headers;
  }

  // Generic API request method with retry logic
  async request(endpoint, options = {}) {
    const maxRetries = options.maxRetries || 3;
    const baseDelay = options.baseDelay || 1000; // 1 second
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const url = `${this.baseURL}${endpoint}`;
        const headers = await this.getHeaders(options.includeAuth !== false);
        
        const config = {
          headers,
          ...options,
        };

        const response = await fetch(url, config);
        
        // Handle 401 Unauthorized
        if (response.status === 401) {
          console.error('Unauthorized request - user may need to re-authenticate');
          throw new Error('Unauthorized - Please login again');
        }

        // Handle rate limiting with retry
        if (response.status === 429) {
          if (attempt < maxRetries) {
            const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff
            console.log(`Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          } else {
            throw new Error('Rate limit exceeded - please try again later');
          }
        }

        // Handle other errors
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const message = errorData.error || errorData.message || errorData.errorMessage || `HTTP error! status: ${response.status}`;
          // Do not retry on known service outages
          if (response.status === 503) {
            const err = new Error(message);
            err.name = 'ServiceUnavailable';
            throw err;
          }
          throw new Error(message);
        }

        // Return JSON response
        return await response.json();
      } catch (error) {
        if (attempt === maxRetries) {
          console.error('API Request Error:', error);
          throw error;
        }
        // For non-retryable errors, throw immediately
        if (
          error.message.includes('Unauthorized') ||
          error.message.includes('Rate limit exceeded') ||
          error.name === 'ServiceUnavailable' ||
          (typeof error.message === 'string' && (
            error.message.includes('Service Unavailable') ||
            error.message.includes('503')
          ))
        ) {
          throw error;
        }
        // For other errors, continue to retry
        console.log(`Request failed, retrying... (attempt ${attempt + 1}/${maxRetries})`);
      }
    }
  }

  // Authentication endpoints
  auth = {
    register: (userData) => 
      this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
        includeAuth: false,
      }),

    login: (credentials) => 
      this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
        includeAuth: false,
      }),

    getProfile: () => 
      this.request('/auth/profile'),

    refreshToken: () => 
      this.request('/auth/refresh-token', {
        method: 'POST',
      }),

    initiateOAuth: () => 
      this.request('/auth/oauth/initiate', {
        method: 'POST',
      }),

    connectBankAccount: (accountData) => 
      this.request('/auth/connect-bank', {
        method: 'POST',
        body: JSON.stringify(accountData),
      }),
  };

  // Connected accounts endpoints
  accounts = {
    getAll: async () => {
      console.log('API: Fetching all accounts...');
      const result = await this.request('/accounts');
      console.log('API: Accounts result:', result);
      return result;
    },

    getById: (accountId) => 
      this.request(`/accounts/${accountId}`),

    syncAll: () => 
      this.request('/accounts/sync', {
        method: 'POST',
      }),

    syncById: (accountId) => 
      this.request(`/accounts/${accountId}/sync`, {
        method: 'POST',
      }),

    disconnect: (accountId) => 
      this.request(`/accounts/${accountId}`, {
        method: 'DELETE',
      }),

    getSyncStatus: async () => {
      console.log('API: Fetching sync status...');
      const result = await this.request('/accounts/sync-status');
      console.log('API: Sync status result:', result);
      return result;
    },

    getBalanceSummary: async () => {
      console.log('API: Fetching balance summary...');
      const result = await this.request('/accounts/balance-summary');
      console.log('API: Balance summary result:', result);
      return result;
    },
  };

  // Transactions endpoints
  transactions = {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return this.request(`/transactions${queryString ? `?${queryString}` : ''}`);
    },

    getById: (transactionId) => 
      this.request(`/transactions/${transactionId}`),

    create: (transactionData) => 
      this.request('/transactions', {
        method: 'POST',
        body: JSON.stringify(transactionData),
      }),

    update: (transactionId, transactionData) => 
      this.request(`/transactions/${transactionId}`, {
        method: 'PUT',
        body: JSON.stringify(transactionData),
      }),

    delete: (transactionId) => 
      this.request(`/transactions/${transactionId}`, {
        method: 'DELETE',
      }),

    getStats: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return this.request(`/transactions/stats${queryString ? `?${queryString}` : ''}`);
    },
  };

  // Webhooks endpoints (for debugging)
  webhooks = {
    getEvents: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return this.request(`/webhooks/events${queryString ? `?${queryString}` : ''}`);
    },

    markEventProcessed: (eventId) => 
      this.request(`/webhooks/events/${eventId}/processed`, {
        method: 'PATCH',
      }),
  };

  // Consent endpoints
  consents = {
    start: (durationDays = 180) => 
      this.request('/consents/start', {
        method: 'POST',
        body: JSON.stringify({ durationDays }),
      }),

    getDetails: (consentId) => 
      this.request(`/consents/${consentId}`),

    getAll: () => 
      this.request('/consents'),

    revoke: (consentId) => 
      this.request(`/consents/${consentId}`, {
        method: 'DELETE',
      }),
  };

  // Health check
  health = () => 
    this.request('/health', { includeAuth: false });
}

// Create and export a single instance
const apiService = new ApiService();
export default apiService;
