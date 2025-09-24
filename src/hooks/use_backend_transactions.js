import { useState, useEffect, useCallback } from 'react';
import apiService from '../config/api';
import { useAuth } from './use_auth_hook';

export const useBackendTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });
  
  const { isAuthenticated } = useAuth();

  // Fetch transactions with filters
  const fetchTransactions = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = {
        page: params.page || 1,
        limit: params.limit || 50,
        ...params
      };
      
      const response = await apiService.transactions.getAll(queryParams);
      setTransactions(response.transactions || []);
      setPagination(response.pagination || {});
      
      return response.transactions;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch transaction statistics
  const fetchStats = useCallback(async (params = {}) => {
    try {
      setError(null);
      const response = await apiService.transactions.getStats(params);
      setStats(response);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  // Create new transaction
  const createTransaction = useCallback(async (transactionData) => {
    try {
      setError(null);
      const response = await apiService.transactions.create(transactionData);
      
      // Add new transaction to local state
      setTransactions(prev => [response.transaction, ...prev]);
      
      // Refresh stats
      await fetchStats();
      
      return response.transaction;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [fetchStats]);

  // Update transaction
  const updateTransaction = useCallback(async (transactionId, transactionData) => {
    try {
      setError(null);
      const response = await apiService.transactions.update(transactionId, transactionData);
      
      // Update transaction in local state
      setTransactions(prev => 
        prev.map(transaction => 
          transaction.id === transactionId ? response.transaction : transaction
        )
      );
      
      // Refresh stats
      await fetchStats();
      
      return response.transaction;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [fetchStats]);

  // Delete transaction
  const deleteTransaction = useCallback(async (transactionId) => {
    try {
      setError(null);
      await apiService.transactions.delete(transactionId);
      
      // Remove transaction from local state
      setTransactions(prev => prev.filter(transaction => transaction.id !== transactionId));
      
      // Refresh stats
      await fetchStats();
      
      return true;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [fetchStats]);

  // Get transaction by ID
  const getTransactionById = useCallback(async (transactionId) => {
    try {
      setError(null);
      const response = await apiService.transactions.getById(transactionId);
      return response.transaction;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  // Add transaction to local state (for real-time updates)
  const addTransaction = useCallback((transaction) => {
    setTransactions(prev => [transaction, ...prev]);
  }, []);

  // Update transaction in local state (for real-time updates)
  const updateTransactionInState = useCallback((transactionId, updates) => {
    setTransactions(prev => 
      prev.map(transaction => 
        transaction.id === transactionId ? { ...transaction, ...updates } : transaction
      )
    );
  }, []);

  // Remove transaction from local state (for real-time updates)
  const removeTransactionFromState = useCallback((transactionId) => {
    setTransactions(prev => prev.filter(transaction => transaction.id !== transactionId));
  }, []);

  // Filter transactions by various criteria
  const filterTransactions = useCallback((filters = {}) => {
    return transactions.filter(transaction => {
      // Filter by category
      if (filters.category && transaction.category !== filters.category) {
        return false;
      }
      
      // Filter by type
      if (filters.type && transaction.transactionType !== filters.type) {
        return false;
      }
      
      // Filter by date range
      if (filters.fromDate) {
        const transactionDate = new Date(transaction.date);
        const fromDate = new Date(filters.fromDate);
        if (transactionDate < fromDate) {
          return false;
        }
      }
      
      if (filters.toDate) {
        const transactionDate = new Date(transaction.date);
        const toDate = new Date(filters.toDate);
        if (transactionDate > toDate) {
          return false;
        }
      }
      
      // Filter by account
      if (filters.accountId && transaction.connectedAccountId !== filters.accountId) {
        return false;
      }
      
      // Filter by search term
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const description = transaction.description.toLowerCase();
        if (!description.includes(searchTerm)) {
          return false;
        }
      }
      
      return true;
    });
  }, [transactions]);

  // Get transactions by account
  const getTransactionsByAccount = useCallback((accountId) => {
    return transactions.filter(transaction => transaction.connectedAccountId === accountId);
  }, [transactions]);

  // Get recent transactions
  const getRecentTransactions = useCallback((limit = 10) => {
    return transactions.slice(0, limit);
  }, [transactions]);

  // Load initial data only when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      console.log('useBackendTransactions: User not authenticated, skipping initial data load');
      return;
    }

    const loadInitialData = async () => {
      try {
        console.log('useBackendTransactions: Loading initial data...');
        await Promise.all([
          fetchTransactions(),
          fetchStats()
        ]);
      } catch (error) {
        console.error('Failed to load initial transaction data:', error);
      }
    };

    // Add a small delay to ensure auth is fully established
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        loadInitialData();
      }
    }, 200); // Reduced delay for faster response

    return () => clearTimeout(timer);
  }, [isAuthenticated, fetchTransactions, fetchStats]);

  return {
    // State
    transactions,
    loading,
    error,
    stats,
    pagination,
    
    // Actions
    fetchTransactions,
    fetchStats,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionById,
    
    // Local state management
    addTransaction,
    updateTransactionInState,
    removeTransactionFromState,
    
    // Filtering and querying
    filterTransactions,
    getTransactionsByAccount,
    getRecentTransactions,
    
    // Computed values
    totalTransactions: transactions.length,
    totalIncome: stats?.totalIncome || 0,
    totalExpenses: stats?.totalExpenses || 0,
    netAmount: stats?.netAmount || 0,
    categoryBreakdown: stats?.categoryBreakdown || [],
    
    // Pagination helpers
    hasNextPage: pagination.page < pagination.pages,
    hasPrevPage: pagination.page > 1,
    nextPage: () => fetchTransactions({ page: pagination.page + 1 }),
    prevPage: () => fetchTransactions({ page: pagination.page - 1 }),
  };
};
