import { useState, useCallback, useMemo } from 'react';
import apiService from '../config/api';

export const useSplitwiseApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to handle API calls with loading and error states
  const apiCall = useCallback(async (apiFunction, ...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction(...args);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Groups API (memoized functions and object)
  const groups_getAll = useCallback(() => apiCall(apiService.splitwise.groups.getAll), [apiCall]);
  const groups_getById = useCallback((groupId) => apiCall(apiService.splitwise.groups.getById, groupId), [apiCall]);
  const groups_create = useCallback((groupData) => apiCall(apiService.splitwise.groups.create, groupData), [apiCall]);
  const groups_update = useCallback((groupId, groupData) => apiCall(apiService.splitwise.groups.update, groupId, groupData), [apiCall]);
  const groups_delete = useCallback((groupId) => apiCall(apiService.splitwise.groups.delete, groupId), [apiCall]);
  const groups_addMember = useCallback((groupId, memberData) => apiCall(apiService.splitwise.groups.addMember, groupId, memberData), [apiCall]);
  const groups_removeMember = useCallback((groupId, memberId) => apiCall(apiService.splitwise.groups.removeMember, groupId, memberId), [apiCall]);
  const groups_updateMemberRole = useCallback((groupId, memberId, roleData) => apiCall(apiService.splitwise.groups.updateMemberRole, groupId, memberId, roleData), [apiCall]);
  const groups = useMemo(() => ({
    getAll: groups_getAll,
    getById: groups_getById,
    create: groups_create,
    update: groups_update,
    delete: groups_delete,
    addMember: groups_addMember,
    removeMember: groups_removeMember,
    updateMemberRole: groups_updateMemberRole,
  }), [groups_getAll, groups_getById, groups_create, groups_update, groups_delete, groups_addMember, groups_removeMember, groups_updateMemberRole]);

  // Expenses API (memoized)
  const expenses_getByGroup = useCallback((groupId, params) => apiCall(apiService.splitwise.expenses.getByGroup, groupId, params), [apiCall]);
  const expenses_getById = useCallback((expenseId) => apiCall(apiService.splitwise.expenses.getById, expenseId), [apiCall]);
  const expenses_create = useCallback((groupId, expenseData) => apiCall(apiService.splitwise.expenses.create, groupId, expenseData), [apiCall]);
  const expenses_update = useCallback((expenseId, expenseData) => apiCall(apiService.splitwise.expenses.update, expenseId, expenseData), [apiCall]);
  const expenses_delete = useCallback((expenseId) => apiCall(apiService.splitwise.expenses.delete, expenseId), [apiCall]);
  const expenses_getSplitTypes = useCallback(() => apiCall(apiService.splitwise.expenses.getSplitTypes), [apiCall]);
  const expenses = useMemo(() => ({
    getByGroup: expenses_getByGroup,
    getById: expenses_getById,
    create: expenses_create,
    update: expenses_update,
    delete: expenses_delete,
    getSplitTypes: expenses_getSplitTypes,
  }), [expenses_getByGroup, expenses_getById, expenses_create, expenses_update, expenses_delete, expenses_getSplitTypes]);

  // Balances API (memoized)
  const balances_getGroupBalances = useCallback((groupId) => apiCall(apiService.splitwise.balances.getGroupBalances, groupId), [apiCall]);
  const balances_getMyBalance = useCallback((groupId) => apiCall(apiService.splitwise.balances.getMyBalance, groupId), [apiCall]);
  const balances_getMyGroupBalances = useCallback(() => apiCall(apiService.splitwise.balances.getMyGroupBalances), [apiCall]);
  const balances_validateGroupBalances = useCallback((groupId) => apiCall(apiService.splitwise.balances.validateGroupBalances, groupId), [apiCall]);
  const balances_getBalanceHistory = useCallback((groupId, days) => apiCall(apiService.splitwise.balances.getBalanceHistory, groupId, days), [apiCall]);
  const balances_getSettlementSuggestions = useCallback((groupId) => apiCall(apiService.splitwise.balances.getSettlementSuggestions, groupId), [apiCall]);
  const balances = useMemo(() => ({
    getGroupBalances: balances_getGroupBalances,
    getMyBalance: balances_getMyBalance,
    getMyGroupBalances: balances_getMyGroupBalances,
    validateGroupBalances: balances_validateGroupBalances,
    getBalanceHistory: balances_getBalanceHistory,
    getSettlementSuggestions: balances_getSettlementSuggestions,
  }), [balances_getGroupBalances, balances_getMyBalance, balances_getMyGroupBalances, balances_validateGroupBalances, balances_getBalanceHistory, balances_getSettlementSuggestions]);

  // Settlements API (memoized)
  const settlements_getByGroup = useCallback((groupId, params) => apiCall(apiService.splitwise.settlements.getByGroup, groupId, params), [apiCall]);
  const settlements_getById = useCallback((settlementId) => apiCall(apiService.splitwise.settlements.getById, settlementId), [apiCall]);
  const settlements_create = useCallback((groupId, settlementData) => apiCall(apiService.splitwise.settlements.create, groupId, settlementData), [apiCall]);
  const settlements_update = useCallback((settlementId, settlementData) => apiCall(apiService.splitwise.settlements.update, settlementId, settlementData), [apiCall]);
  const settlements_delete = useCallback((settlementId) => apiCall(apiService.splitwise.settlements.delete, settlementId), [apiCall]);
  const settlements_getByUser = useCallback((groupId, userId, params) => apiCall(apiService.splitwise.settlements.getByUser, groupId, userId, params), [apiCall]);
  const settlements = useMemo(() => ({
    getByGroup: settlements_getByGroup,
    getById: settlements_getById,
    create: settlements_create,
    update: settlements_update,
    delete: settlements_delete,
    getByUser: settlements_getByUser,
  }), [settlements_getByGroup, settlements_getById, settlements_create, settlements_update, settlements_delete, settlements_getByUser]);

  // Invites API (memoized)
  const invites_sendInvite = useCallback((groupId, inviteData) => apiCall(apiService.splitwise.invites.sendInvite, groupId, inviteData), [apiCall]);
  const invites_acceptInvite = useCallback((token) => apiCall(apiService.splitwise.invites.acceptInvite, token), [apiCall]);
  const invites_getPendingInvites = useCallback(() => apiCall(apiService.splitwise.invites.getPendingInvites), [apiCall]);
  const invites_cancelInvite = useCallback((inviteId) => apiCall(apiService.splitwise.invites.cancelInvite, inviteId), [apiCall]);
  const invites = useMemo(() => ({
    sendInvite: invites_sendInvite,
    acceptInvite: invites_acceptInvite,
    getPendingInvites: invites_getPendingInvites,
    cancelInvite: invites_cancelInvite,
  }), [invites_sendInvite, invites_acceptInvite, invites_getPendingInvites, invites_cancelInvite]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    clearError,
    groups,
    expenses,
    balances,
    settlements,
    invites,
  };
};
