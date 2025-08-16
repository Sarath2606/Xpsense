import { useState, useEffect, createContext, useContext } from 'react';
import apiService from '../config/api';

// Create auth context
const BackendAuthContext = createContext();

// Auth provider component
export const BackendAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Check authentication status
  const checkAuthStatus = async () => {
    try {
      const token = apiService.getAuthToken();
      if (token) {
        const response = await apiService.auth.getProfile();
        setUser(response.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      apiService.removeAuthToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Register new user
  const register = async (userData) => {
    try {
      setError(null);
      const response = await apiService.auth.register(userData);
      
      // Store token and user data
      apiService.setAuthToken(response.token);
      setUser(response.user);
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      setError(null);
      const response = await apiService.auth.login(credentials);
      
      // Store token and user data
      apiService.setAuthToken(response.token);
      setUser(response.user);
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Logout user
  const logout = () => {
    apiService.removeAuthToken();
    setUser(null);
    setError(null);
  };

  // Refresh token
  const refreshToken = async () => {
    try {
      const response = await apiService.auth.refreshToken();
      apiService.setAuthToken(response.token);
      return response;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      throw error;
    }
  };

  // Initiate OAuth flow for bank connection
  const initiateOAuth = async () => {
    try {
      setError(null);
      const response = await apiService.auth.initiateOAuth();
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Connect bank account after OAuth
  const connectBankAccount = async (accountData) => {
    try {
      setError(null);
      const response = await apiService.auth.connectBankAccount(accountData);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    refreshToken,
    initiateOAuth,
    connectBankAccount,
    isAuthenticated: !!user,
  };

  return (
    <BackendAuthContext.Provider value={value}>
      {children}
    </BackendAuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useBackendAuth = () => {
  const context = useContext(BackendAuthContext);
  if (!context) {
    throw new Error('useBackendAuth must be used within a BackendAuthProvider');
  }
  return context;
};
