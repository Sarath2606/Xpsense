const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  // Set auth token in localStorage
  setAuthToken(token) {
    localStorage.setItem('authToken', token);
  }

  // Remove auth token from localStorage
  removeAuthToken() {
    localStorage.removeItem('authToken');
  }

  // Create headers with authentication
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Generic API request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(options.includeAuth !== false),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        this.removeAuthToken();
        window.location.href = '/login';
        throw new Error('Unauthorized - Please login again');
      }

      // Handle other errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Return JSON response
      return await response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
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
    getAll: () => 
      this.request('/accounts'),

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

    getSyncStatus: () => 
      this.request('/accounts/sync-status'),

    getBalanceSummary: () => 
      this.request('/accounts/balance-summary'),
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

  // Health check
  health = () => 
    this.request('/health', { includeAuth: false });
}

// Create and export a single instance
const apiService = new ApiService();
export default apiService;
