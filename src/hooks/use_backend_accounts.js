import { useState, useEffect, useCallback } from 'react';
import apiService from '../config/api';
import { debounce } from '../utils/debounce';

export const useBackendAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);
  const [balanceSummary, setBalanceSummary] = useState(null);

  // Fetch all connected accounts
  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.accounts.getAll();
      setAccounts(response.accounts || []);
      return response.accounts;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch sync status
  const fetchSyncStatus = useCallback(async () => {
    try {
      setError(null);
      const response = await apiService.accounts.getSyncStatus();
      setSyncStatus(response);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  // Fetch balance summary
  const fetchBalanceSummary = useCallback(async () => {
    try {
      setError(null);
      const response = await apiService.accounts.getBalanceSummary();
      setBalanceSummary(response);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  // Sync all accounts
  const syncAllAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.accounts.syncAll();
      
      // Refresh accounts and sync status after sync
      await Promise.all([
        fetchAccounts(),
        fetchSyncStatus(),
        fetchBalanceSummary()
      ]);
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchAccounts, fetchSyncStatus, fetchBalanceSummary]);

  // Sync specific account
  const syncAccount = useCallback(async (accountId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.accounts.syncById(accountId);
      
      // Refresh accounts and sync status after sync
      await Promise.all([
        fetchAccounts(),
        fetchSyncStatus(),
        fetchBalanceSummary()
      ]);
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchAccounts, fetchSyncStatus, fetchBalanceSummary]);

  // Disconnect account
  const disconnectAccount = useCallback(async (accountId) => {
    try {
      setError(null);
      const response = await apiService.accounts.disconnect(accountId);
      
      // Remove account from local state
      setAccounts(prev => prev.filter(account => account.id !== accountId));
      
      // Refresh sync status and balance summary
      await Promise.all([
        fetchSyncStatus(),
        fetchBalanceSummary()
      ]);
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [fetchSyncStatus, fetchBalanceSummary]);

  // Get account by ID
  const getAccountById = useCallback((accountId) => {
    return accounts.find(account => account.id === accountId);
  }, [accounts]);

  // Add new account to local state
  const addAccount = useCallback((account) => {
    setAccounts(prev => [account, ...prev]);
  }, []);

  // Update account in local state
  const updateAccount = useCallback((accountId, updates) => {
    setAccounts(prev => 
      prev.map(account => 
        account.id === accountId ? { ...account, ...updates } : account
      )
    );
  }, []);

  // Load initial data - only when explicitly requested
  const loadInitialData = useCallback(async () => {
    try {
      console.log('Loading initial account data...');
      await Promise.all([
        fetchAccounts(),
        fetchSyncStatus(),
        fetchBalanceSummary()
      ]);
      console.log('Initial account data loaded successfully');
    } catch (error) {
      console.error('Failed to load initial account data:', error);
    }
  }, [fetchAccounts, fetchSyncStatus, fetchBalanceSummary]);

  // Auto-load data when the hook is first used
  useEffect(() => {
    console.log('useBackendAccounts: Auto-loading data...');
    loadInitialData();
  }, [loadInitialData]);

  return {
    // State
    accounts,
    loading,
    error,
    syncStatus,
    balanceSummary,
    
    // Actions
    fetchAccounts,
    fetchSyncStatus,
    fetchBalanceSummary,
    syncAllAccounts,
    syncAccount,
    disconnectAccount,
    getAccountById,
    addAccount,
    updateAccount,
    
    // Computed values
    totalAccounts: accounts.length,
    activeAccounts: accounts.filter(account => account.isActive),
    totalBalance: balanceSummary?.totalBalance || 0,
  };
};
