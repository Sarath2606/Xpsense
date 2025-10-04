import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import GroupList from './GroupList';
import CreateGroupView from './CreateGroupView';
import GroupDetailView from './GroupDetailView';
import AddExpenseForm from './AddExpenseForm';
import GroupSettingsView from './GroupSettingsView';
import AddMemberPage from './AddMemberPage';
import AcceptInviteModal from './AcceptInviteModal';
import { useSplitwiseApi } from '../../hooks/use_splitwise_api';
import { useAuth } from '../../hooks/use_auth_hook';
import { auth } from '../../config/firebase';

const SplitwiseView = ({ onBack, onFloatingButtonStateChange }) => {
  const [groups, setGroups] = useState([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showAcceptInvite, setShowAcceptInvite] = useState(false);

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [view, setView] = useState('list'); // 'list', 'detail', 'addExpense', 'settings', or 'addMember'
  const [isInSettlementMode, setIsInSettlementMode] = useState(false);
  
  const { loading, error, clearError, groups: groupsApi, expenses: expensesApi } = useSplitwiseApi();
  const { user, isAuthenticated: authHookAuthenticated } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Use ref to track if groups have been loaded to prevent duplicate calls
  const groupsLoadedRef = useRef(false);
  const loadingRef = useRef(false);

  // Set initial load to false after a short delay to prevent stuck states
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isInitialLoad && !authHookAuthenticated) {
        setIsInitialLoad(false);
      }
    }, 2000); // 2 second delay
    
    return () => clearTimeout(timer);
  }, [isInitialLoad, authHookAuthenticated]);

  // Memoize loading state to prevent unnecessary re-renders
  const isLoading = useMemo(() => {
    return loading || isInitialLoad;
  }, [loading, isInitialLoad]);

  // Define loadGroups function first
  const loadGroups = useCallback(async (forceRefresh = false) => {
    // Prevent multiple simultaneous calls unless forced
    if (loadingRef.current && !forceRefresh) {
      console.log('SplitwiseView: Groups already loading, skipping...');
      return;
    }
    
    // Prevent duplicate calls if groups are already loaded and not forcing refresh
    if (groupsLoadedRef.current && !forceRefresh) {
      console.log('SplitwiseView: Groups already loaded, skipping...');
      return;
    }

    try {
      loadingRef.current = true;
      console.log('SplitwiseView: Attempting to load groups...', forceRefresh ? '(forced refresh)' : '');
      
      // Call the API directly without timeout wrapper to avoid abort signal issues
      const response = await groupsApi.getAll(forceRefresh);
      
      // Always update groups
      const newGroups = response.groups || [];
      setGroups(newGroups);
      
      // Update auth state
      setIsAuthenticated(true);
      setAuthError(null);
      
      groupsLoadedRef.current = true;
      setIsInitialLoad(false);
      
      console.log('SplitwiseView: Groups loaded successfully:', newGroups.length, 'groups');
      
      // Return the groups for the caller
      return newGroups;
    } catch (err) {
      console.error('Failed to load groups:', err);
      
      // Handle timeout errors
      if (err.message === 'Request timeout') {
        setAuthError('Connection timed out. Please check your internet connection and try again.');
        setGroups([]);
      }
      // Check if it's an authentication error
      else if (err.message.includes('login') || err.message.includes('authenticated') || err.message.includes('Access token required')) {
        setAuthError('Please login to use Splitwise features');
        setIsAuthenticated(false);
        setGroups([]);
      } else if (err.message.includes('Rate limit exceeded')) {
        // Handle rate limiting
        setAuthError('Too many requests. Please wait a moment and try again.');
        setGroups([]);
      } else if (err.message.includes('Network') || err.message.includes('fetch')) {
        // Handle network errors
        setAuthError('Network error. Please check your connection and try again.');
        setGroups([]);
      } else {
        // Set empty array if API fails for other reasons
        setGroups([]);
        setAuthError(`Unable to load groups: ${err.message}`);
      }
      
      // Always set initial load to false on error to prevent stuck states
      setIsInitialLoad(false);
    } finally {
      loadingRef.current = false;
    }
  }, [groupsApi]);

  // Add a timeout to prevent infinite loading states
  useEffect(() => {
    if (isInitialLoad && authHookAuthenticated) {
      const timeout = setTimeout(() => {
        if (isInitialLoad) {
          console.log('SplitwiseView: Loading timeout, setting initial load to false');
          setIsInitialLoad(false);
        }
      }, 8000); // 8 second timeout for faster feedback
      
      return () => clearTimeout(timeout);
    }
  }, [isInitialLoad, authHookAuthenticated]);

  // Debug authentication state and handle auth state changes
  useEffect(() => {
    console.log('SplitwiseView: Auth state debug:', {
      user: user ? 'exists' : 'null',
      authHookAuthenticated,
      firebaseCurrentUser: auth.currentUser ? 'exists' : 'null'
    });
    
    // If user becomes authenticated and groups haven't been loaded, load them
    if (authHookAuthenticated && user && !groupsLoadedRef.current && !loadingRef.current) {
      console.log('SplitwiseView: User authenticated, scheduling group load...');
      const timer = setTimeout(() => {
        if (auth.currentUser && authHookAuthenticated && !groupsLoadedRef.current) {
          loadGroups();
        }
      }, 100); // Reduced delay for faster response
      
      return () => clearTimeout(timer);
    }
  }, [user, authHookAuthenticated, loadGroups]);

  // Additional check for pending invite processing - force refresh if user just logged in
  useEffect(() => {
    const checkPendingInvite = () => {
      const pendingToken = localStorage.getItem('pendingInviteToken');
      if (!pendingToken && authHookAuthenticated && user && groupsLoadedRef.current) {
        // User just completed invite acceptance, force a refresh
        console.log('SplitwiseView: User just completed invite acceptance, forcing refresh...');
        groupsLoadedRef.current = false;
        loadingRef.current = false;
        setTimeout(() => {
          loadGroups(true);
        }, 500);
      }
    };

    // Check after a delay to allow invite processing to complete
    const timer = setTimeout(checkPendingInvite, 1000);
    return () => clearTimeout(timer);
  }, [authHookAuthenticated, user, loadGroups]);

  // Periodic check for force refresh requests (backup mechanism)
  useEffect(() => {
    if (!authHookAuthenticated || !user) return;

    const checkForRefreshRequest = () => {
      const refreshRequest = localStorage.getItem('forceRefreshGroups');
      if (refreshRequest) {
        console.log('SplitwiseView: Periodic check found refresh request, forcing refresh...');
        localStorage.removeItem('forceRefreshGroups');
        groupsLoadedRef.current = false;
        loadingRef.current = false;
        setTimeout(() => {
          loadGroups(true);
        }, 100);
      }
    };

    // Check every 2 seconds for refresh requests
    const interval = setInterval(checkForRefreshRequest, 2000);
    
    // Also check immediately
    checkForRefreshRequest();

    return () => clearInterval(interval);
  }, [authHookAuthenticated, user, loadGroups]);

  // Load groups from API on component mount - only once when authenticated
  useEffect(() => {
    // Only load groups if user is authenticated and groups haven't been loaded
    if (!authHookAuthenticated) {
      console.log('SplitwiseView: User not authenticated, skipping group load');
      return;
    }
    
    if (groupsLoadedRef.current) {
      console.log('SplitwiseView: Groups already loaded, skipping...');
      return;
    }
    
    // Add a delay to ensure Firebase auth is fully established
    const timer = setTimeout(() => {
      // Double-check auth state before making API call
      if (auth.currentUser && authHookAuthenticated) {
        loadGroups();
      } else {
        console.log('SplitwiseView: Auth not ready after delay, skipping group load');
      }
    }, 300); // Reduced delay for faster response
    
    return () => clearTimeout(timer);
  }, [authHookAuthenticated]);

  // Reset groups loaded flag when authentication state changes
  useEffect(() => {
    if (!authHookAuthenticated) {
      groupsLoadedRef.current = false;
      loadingRef.current = false;
    }
  }, [authHookAuthenticated]);

  // Listen for force refresh events (e.g., after accepting an invite)
  useEffect(() => {
    const handleForceRefresh = () => {
      console.log('SplitwiseView: Force refresh requested, reloading groups...');
      setAuthError(null);
      groupsLoadedRef.current = false;
      loadingRef.current = false;
      
      // Add a small delay to ensure the event is processed
      setTimeout(() => {
        loadGroups(true); // Force refresh
      }, 100);
    };

    // Listen for both custom events and storage events (for cross-tab communication)
    window.addEventListener('forceRefreshGroups', handleForceRefresh);
    window.addEventListener('storage', (e) => {
      if (e.key === 'forceRefreshGroups' && e.newValue) {
        console.log('SplitwiseView: Storage-based refresh requested');
        localStorage.removeItem('forceRefreshGroups'); // Clean up
        handleForceRefresh();
      }
    });
    
    return () => {
      window.removeEventListener('forceRefreshGroups', handleForceRefresh);
      window.removeEventListener('storage', handleForceRefresh);
    };
  }, [loadGroups]);

  // Check for refresh parameter in URL (e.g., after invite acceptance)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shouldRefresh = urlParams.get('refresh') === 'groups';
    
    if (shouldRefresh && authHookAuthenticated && user) {
      console.log('SplitwiseView: Refresh parameter detected, forcing group refresh...');
      setAuthError(null);
      groupsLoadedRef.current = false;
      loadingRef.current = false;
      
      // Add a small delay to ensure auth state is fully ready
      setTimeout(() => {
        loadGroups(true);
        
        // Clean up the URL parameter after refresh
        const newUrl = new URL(window.location);
        newUrl.searchParams.delete('refresh');
        window.history.replaceState({}, '', newUrl);
      }, 200);
    }
  }, [authHookAuthenticated, user, loadGroups]);

  // Manual retry function for rate limiting
  const handleRetry = useCallback(() => {
    setAuthError(null);
    groupsLoadedRef.current = false;
    loadingRef.current = false;
    loadGroups();
  }, [loadGroups]);


  // Manual refresh function
  const handleRefreshGroups = useCallback(() => {
    console.log('🔄 Manually refreshing groups...');
    groupsLoadedRef.current = false;
    loadingRef.current = false;
    loadGroups();
  }, [loadGroups]);

  const handleCreateGroup = async (createdGroup) => {
    try {
      // The group is already created, just add it to the UI
      setGroups([...groups, createdGroup]);
      setShowCreateGroup(false);
    } catch (err) {
      console.error('Failed to update groups list:', err);
    }
  };

  const handleBackFromCreate = () => {
    setShowCreateGroup(false);
  };

  const handleUpdateGroup = async (updatedGroup) => {
    try {
      const response = await groupsApi.update(updatedGroup.id, updatedGroup);
      const updatedGroupData = response.group;
      setGroups(groups.map(group => 
        group.id === updatedGroupData.id ? updatedGroupData : group
      ));
    } catch (err) {
      console.error('Failed to update group:', err);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      console.log('🗑️ Starting group deletion for:', groupId);
      
      // Delete the group from backend
      await groupsApi.delete(groupId);
      console.log('✅ Group deleted successfully from backend');
      
      // Immediately remove from local state and navigate back
      setGroups(prevGroups => {
        const updatedGroups = prevGroups.filter(group => group.id !== groupId);
        console.log('📝 Updated local groups list:', updatedGroups.length, 'groups remaining');
        return updatedGroups;
      });
      
      setSelectedGroup(null);
      setView('list');
      
      // Force immediate refresh to ensure data consistency
      console.log('🔄 Forcing immediate refresh...');
      groupsLoadedRef.current = false;
      loadingRef.current = false;
      
      // Load fresh data immediately with force refresh
      try {
        const refreshedGroups = await loadGroups(true);
        console.log('✅ Groups refreshed successfully:', refreshedGroups?.length || 0, 'groups');
      } catch (refreshError) {
        console.error('⚠️ Refresh failed, but local state already updated:', refreshError);
      }
      
    } catch (err) {
      console.error('❌ Failed to delete group:', err);
      
      // Even if deletion fails, force refresh the groups list
      console.log('🔄 Forcing refresh due to deletion failure...');
      groupsLoadedRef.current = false;
      loadingRef.current = false;
      await loadGroups(true);
    }
  };

  const handleSelectGroup = (group) => {
    console.log('👆 User selected group:', group.id, group.name);
    setSelectedGroup(group);
    setView('detail');
  };

  // Function to clean up stale groups by checking their existence
  const cleanupStaleGroups = useCallback(async () => {
    console.log('🧹 Checking for stale groups...');
    const currentGroups = [...groups];
    const validGroups = [];
    
    for (const group of currentGroups) {
      try {
        // Try to get group details to verify it still exists (silent check to avoid surfacing 403/404)
        await (groupsApi.checkExists ? groupsApi.checkExists(group.id) : groupsApi.getById(group.id));
        validGroups.push(group);
        console.log('✅ Group is valid:', group.id, group.name);
      } catch (error) {
        console.log('🗑️ Removing stale group:', group.id, group.name, error.message);
        // Group doesn't exist or user doesn't have access - remove it
      }
    }
    
    if (validGroups.length !== currentGroups.length) {
      console.log('📝 Updating groups list - removed', currentGroups.length - validGroups.length, 'stale groups');
      setGroups(validGroups);
    }
  }, [groups, groupsApi]);

  const handleBackToList = useCallback(() => {
    console.log('🔙 Navigating back to list - checking for data inconsistencies');
    setSelectedGroup(null);
    setView('list');
    
    // Force refresh groups to ensure we have the latest data
    setTimeout(async () => {
      console.log('🔄 Auto-refreshing groups after navigation back');
      groupsLoadedRef.current = false;
      loadingRef.current = false;
      
      // First try a full refresh
      await loadGroups(true);
      
      // Then clean up any remaining stale groups
      await cleanupStaleGroups();
    }, 200);
  }, [loadGroups, cleanupStaleGroups]);

  const handleShowCreateGroup = useCallback(() => {
    setShowCreateGroup(true);
  }, []);

  const handleShowAcceptInvite = useCallback(() => {
    setShowAcceptInvite(true);
  }, []);

  const handleBackFromAcceptInvite = useCallback(() => {
    setShowAcceptInvite(false);
  }, []);

  const handleInviteAccepted = useCallback((response) => {
    // Refresh groups list after accepting invite
    loadGroups();
    setShowAcceptInvite(false);
  }, []);

  const handleShowAddExpense = useCallback(() => {
    setView('addExpense');
  }, []);

  const handleBackFromAddExpense = useCallback(() => {
    setView('detail');
  }, []);

  const handleBackFromSettings = useCallback(() => {
    setView('detail');
  }, []);

  const handleShowAddMember = useCallback(() => {
    setView('addMember');
  }, []);

  const handleBackFromAddMember = useCallback(() => {
    setView('settings');
  }, []);

  const handleSettlementModeChange = useCallback((isInSettlement) => {
    setIsInSettlementMode(isInSettlement);
  }, []);

  const handleFloatingButtonClick = useCallback(() => {
    setView('addExpense');
  }, []);

  // Notify parent about floating button state
  useEffect(() => {
    // Only show floating button on group detail view, not on settlement views
    const shouldShowFloatingButton = view === 'detail' && !isInSettlementMode && selectedGroup && selectedGroup.members && selectedGroup.members.length > 1;
    onFloatingButtonStateChange?.(shouldShowFloatingButton, selectedGroup, handleFloatingButtonClick);
  }, [view, selectedGroup, isInSettlementMode, onFloatingButtonStateChange, handleFloatingButtonClick]);

  const handleAddExpense = useCallback(async (newExpense) => {
    if (!selectedGroup?.id) {
      setView('detail');
      return;
    }

    try {
      // Resolve current user's backend member id from group members
      const currentUserEmail = user?.email?.toLowerCase();
      const members = Array.isArray(selectedGroup.members) ? selectedGroup.members : [];
      const currentUserMember = members.find(m => {
        const memberEmail = ((m.email || m.user?.email) || '').toLowerCase();
        return memberEmail && memberEmail === currentUserEmail;
      });
      const resolveBackendUserId = (m) => (m?.userId || m?.id);
      const payerId = resolveBackendUserId(currentUserMember);
      
      console.log('🔍 SplitwiseView expense creation debug:', {
        currentUserEmail,
        currentUserMember: currentUserMember ? {
          id: currentUserMember.id,
          userId: currentUserMember.userId,
          email: currentUserMember.email,
          userEmail: currentUserMember.user?.email
        } : null,
        payerId,
        members: members.map(m => ({
          id: m.id,
          userId: m.userId,
          email: m.email,
          userEmail: m.user?.email
        }))
      });

      // Map frontend split type to backend
      const backendSplitType = newExpense.splitType === 'equal' ? 'EQUAL' : 'UNEQUAL';

      // Build participants list using backend ids, substituting current user where needed
      const participants = members
        .map(m => {
          const backendId = resolveBackendUserId(m);
          // If this member is the current user, ensure we use payerId
          const memberEmail = ((m.email || m.user?.email) || '').toLowerCase();
          if (memberEmail && memberEmail === currentUserEmail) return payerId;
          return backendId;
        })
        .filter(Boolean);

      // For UNEQUAL/custom, align shares to participants order
      let shares;
      if (backendSplitType === 'UNEQUAL' && newExpense.splits) {
        // Build a map that understands ids from the form (member.id or member.userId) and 'current_user'
        const rawMap = new Map();
        for (const s of newExpense.splits) {
          let key = s.userId;
          if (key === 'current_user') key = payerId;
          // Try to normalize to backend user id
          const mem = members.find(m => m.id === s.userId || m.userId === s.userId);
          const normalizedKey = mem ? resolveBackendUserId(mem) : key;
          rawMap.set(normalizedKey, Number(s.amount) || 0);
        }
        shares = participants.map(pid => Number(rawMap.get(pid) || 0));
      }

      const payload = {
        payerId, // required by backend
        amount: Number(newExpense.amount) || 0,
        currency: selectedGroup.currency || 'AUD',
        description: newExpense.description || '',
        splitType: backendSplitType,
        participants,
        ...(shares ? { shares } : {}),
        date: newExpense.date || new Date().toISOString().split('T')[0]
      };

      await expensesApi.create(selectedGroup.id, payload);
    } catch (e) {
      console.error('Failed to create expense:', e);
    } finally {
      setView('detail');
    }
  }, [expensesApi, selectedGroup?.id, selectedGroup?.members, selectedGroup?.currency, user?.email]);


  const handleGoToLogin = useCallback(() => {
    window.location.href = '/login';
  }, []);

  const handleClearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  return (
    <>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
      {/* Content Section - Full Area */}
      <div key={view} className="w-full transition-all duration-300 ease-in-out">
        {/* Simple Header */}
        {view !== 'addExpense' && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <h2 className={`font-semibold text-gray-900 ${showCreateGroup || view === 'list' ? 'text-lg' : 'text-xl'}`}>
                {showCreateGroup ? 'Create New Group' : view === 'list' ? 'Split Expenses' : selectedGroup?.name}
              </h2>
            </div>
          
          {/* Action Buttons */}
          {view === 'list' && !showCreateGroup && (
            <button
              onClick={handleShowCreateGroup}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg font-semibold text-sm transition-colors"
            >
              + New Group
            </button>
          )}
          
          {view === 'detail' && !showCreateGroup && !isInSettlementMode && (
            <button
              onClick={() => setView('settings')}
              className="bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-lg transition-colors flex items-center justify-center"
              title="Group Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}
          
          </div>
        )}

        {/* Authentication Error Display */}
        {authError && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-yellow-800">{authError}</span>
              <button
                onClick={handleClearAuthError}
                className="ml-auto text-yellow-600 hover:text-yellow-800"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-800">{error}</span>
              <button
                onClick={clearError}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg animate-fadeIn">
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-blue-800">
                {isInitialLoad ? 'Loading groups...' : 'Loading...'}
              </span>
            </div>
            {isInitialLoad && (
              <div className="mt-2 text-sm text-blue-600">
                This may take a few moments...
              </div>
            )}
          </div>
        )}

        {!authHookAuthenticated && authError ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {authError.includes('Rate limit') ? 'Too Many Requests' : 'Authentication Required'}
            </h3>
            <p className="text-gray-600 mb-4">{authError}</p>
            {authError.includes('Rate limit') || authError.includes('timed out') || authError.includes('Network error') ? (
              <button
                onClick={handleRetry}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl font-medium transition-colors"
              >
                Try Again
              </button>
            ) : (
              <button
                onClick={handleGoToLogin}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl font-medium transition-colors"
              >
                Go to Login
              </button>
            )}
          </div>
                 ) : showCreateGroup ? (
           <div className="animate-fadeIn">
             <CreateGroupView
               onBack={handleBackFromCreate}
               onCreateGroup={handleCreateGroup}
               currentUser={user}
             />
           </div>
         ) : view === 'list' ? (
           <div className="animate-fadeIn">
             {isLoading ? (
               <div className="space-y-4">
                 {/* Skeleton loading for groups */}
                 {[1, 2, 3].map((i) => (
                   <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
                     <div className="flex items-center space-x-4">
                       <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                       <div className="flex-1 space-y-2">
                         <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                         <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                       </div>
                       <div className="w-20 h-8 bg-gray-200 rounded"></div>
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <GroupList
                 groups={groups}
                 onSelectGroup={handleSelectGroup}
                 onCreateGroup={handleShowCreateGroup}
                 onDeleteGroup={handleDeleteGroup}
                 onJoinGroup={handleShowAcceptInvite}
                 onRefresh={() => loadGroups(true)}
                 loading={false}
               />
             )}
           </div>
         ) : view === 'addExpense' ? (
          <div className="animate-fadeIn">
            <AddExpenseForm
              onClose={handleBackFromAddExpense}
              onAddExpense={handleAddExpense}
              group={selectedGroup}
            />
          </div>
                  ) : view === 'settings' ? (
            <div className="animate-fadeIn">
              <GroupSettingsView
                group={selectedGroup}
                currentUser={user}
                onBack={handleBackFromSettings}
                onGroupUpdated={handleUpdateGroup}
                onShowAddMember={handleShowAddMember}
              />
            </div>
                  ) : view === 'addMember' ? (
            <div className="animate-fadeIn">
              <AddMemberPage
                group={selectedGroup}
                onBack={handleBackFromAddMember}
                onMemberAdded={(newMember) => {
                  // Update the group with the new member
                  handleUpdateGroup({
                    ...selectedGroup,
                    members: [...(selectedGroup.members || []), newMember]
                  });
                  // Navigate back to settings
                  setView('settings');
                }}
              />
            </div>
                  ) : (
            <div className="animate-fadeIn">
              <GroupDetailView
                group={selectedGroup}
                onUpdateGroup={handleUpdateGroup}
                onBack={handleBackToList}
                onSettlementModeChange={handleSettlementModeChange}
              />
            </div>
          )}
      </div>

      {/* Accept Invite Modal */}
      <AcceptInviteModal
        isOpen={showAcceptInvite}
        onClose={handleBackFromAcceptInvite}
        onInviteAccepted={handleInviteAccepted}
      />

    </>
  );
};

export default SplitwiseView;
