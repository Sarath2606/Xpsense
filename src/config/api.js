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
      console.log('API: Checking auth state - currentUser:', currentUser ? 'exists' : 'null');
      
      if (!currentUser) {
        // Wait a bit for auth state to be available
        await new Promise(resolve => setTimeout(resolve, 100));
        const retryUser = auth.currentUser;
        console.log('API: Retry auth check - currentUser:', retryUser ? 'exists' : 'null');
        
        if (!retryUser) {
          throw new Error('No authenticated user');
        }
        return await retryUser.getIdToken();
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
        console.log('API: Successfully added auth token to headers');
      } catch (error) {
        console.error('Failed to get auth token for headers:', error);
        // For Splitwise endpoints, we need authentication
        if (error.message === 'No authenticated user') {
          console.log('API: No authenticated user found, throwing auth error');
          throw new Error('Please login to use Splitwise features');
        }
        // Don't throw here, let the request proceed without auth for other endpoints
      }
    }

    return headers;
  }

  // Generic API request method with retry logic
  async request(endpoint, options = {}) {
    const maxRetries = options.maxRetries || 2; // Reduced from 3 to 2
    const baseDelay = options.baseDelay || 2000; // Increased from 1000 to 2000ms
    
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

  // Splitwise endpoints
  splitwise = {
    // Groups
    groups: {
      getAll: () => 
        this.request('/splitwise/groups'),

      getById: (groupId) => 
        this.request(`/splitwise/groups/${groupId}`),

      create: (groupData) => 
        this.request('/splitwise/groups', {
          method: 'POST',
          body: JSON.stringify(groupData),
        }),

      update: (groupId, groupData) => 
        this.request(`/splitwise/groups/${groupId}`, {
          method: 'PUT',
          body: JSON.stringify(groupData),
        }),

      delete: (groupId) => 
        this.request(`/splitwise/groups/${groupId}`, {
          method: 'DELETE',
        }),

      addMember: (groupId, memberData) => 
        this.request(`/splitwise/groups/${groupId}/members`, {
          method: 'POST',
          body: JSON.stringify(memberData),
        }),

      removeMember: (groupId, memberId) => 
        this.request(`/splitwise/groups/${groupId}/members/${memberId}`, {
          method: 'DELETE',
        }),

      updateMemberRole: (groupId, memberId, roleData) => 
        this.request(`/splitwise/groups/${groupId}/members/${memberId}`, {
          method: 'PATCH',
          body: JSON.stringify(roleData),
        }),
    },

    // Expenses
    expenses: {
      getByGroup: (groupId, params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/splitwise/expenses/groups/${groupId}/expenses${queryString ? `?${queryString}` : ''}`);
      },

      getById: (expenseId) => 
        this.request(`/splitwise/expenses/${expenseId}`),

      create: (groupId, expenseData) => 
        this.request(`/splitwise/expenses/groups/${groupId}/expenses`, {
          method: 'POST',
          body: JSON.stringify(expenseData),
        }),

      update: (expenseId, expenseData) => 
        this.request(`/splitwise/expenses/${expenseId}`, {
          method: 'PUT',
          body: JSON.stringify(expenseData),
        }),

      delete: (expenseId) => 
        this.request(`/splitwise/expenses/${expenseId}`, {
          method: 'DELETE',
        }),

      getSplitTypes: () => 
        this.request('/splitwise/expenses/split-types'),
    },

    // Balances
    balances: {
      getGroupBalances: (groupId) => 
        this.request(`/splitwise/balances/groups/${groupId}/balances`),

      getMyBalance: (groupId) => 
        this.request(`/splitwise/balances/groups/${groupId}/balances/my-balance`),

      getMyGroupBalances: () => 
        this.request('/splitwise/balances/my-groups'),

      validateGroupBalances: (groupId) => 
        this.request(`/splitwise/balances/groups/${groupId}/balances/validate`),

      getBalanceHistory: (groupId, days = 30) => 
        this.request(`/splitwise/balances/groups/${groupId}/balances/history?days=${days}`),

      getSettlementSuggestions: (groupId) => 
        this.request(`/splitwise/balances/groups/${groupId}/balances/settlements`),
    },

    // Invites
    invites: {
      sendInvite: (groupId, inviteData) => 
        this.request(`/splitwise/groups/${groupId}/invites`, {
          method: 'POST',
          body: JSON.stringify(inviteData),
        }),

      acceptInvite: (token) => 
        this.request('/splitwise/invites/accept', {
          method: 'POST',
          body: JSON.stringify({ token }),
        }),

      getPendingInvites: () => 
        this.request('/splitwise/invites/pending'),

      cancelInvite: (inviteId) => 
        this.request(`/splitwise/invites/${inviteId}`, {
          method: 'DELETE',
        }),
    },

    // Settlements
    settlements: {
      getByGroup: (groupId, params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/splitwise/settlements/groups/${groupId}/settlements${queryString ? `?${queryString}` : ''}`);
      },

      getById: (settlementId) => 
        this.request(`/splitwise/settlements/${settlementId}`),

      create: (groupId, settlementData) => 
        this.request(`/splitwise/settlements/groups/${groupId}/settlements`, {
          method: 'POST',
          body: JSON.stringify(settlementData),
        }),

      update: (settlementId, settlementData) => 
        this.request(`/splitwise/settlements/${settlementId}`, {
          method: 'PUT',
          body: JSON.stringify(settlementData),
        }),

      delete: (settlementId) => 
        this.request(`/splitwise/settlements/${settlementId}`, {
          method: 'DELETE',
        }),

      getByUser: (groupId, userId, params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/splitwise/settlements/groups/${groupId}/settlements/user/${userId}${queryString ? `?${queryString}` : ''}`);
      },
    },
  };
}

// Create and export a single instance
const apiService = new ApiService();
export default apiService;
