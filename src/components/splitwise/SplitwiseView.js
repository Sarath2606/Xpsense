import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import GroupList from './GroupList';
import CreateGroupView from './CreateGroupView';
import GroupDetailView from './GroupDetailView';
import AddExpenseForm from './AddExpenseForm';
import GroupSettingsView from './GroupSettingsView';
import { useSplitwiseApi } from '../../hooks/use_splitwise_api';
import { useAuth } from '../../hooks/use_auth_hook';
import { auth } from '../../config/firebase';

const SplitwiseView = ({ onBack, onFloatingButtonStateChange }) => {
  const [groups, setGroups] = useState([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [view, setView] = useState('list'); // 'list', 'detail', 'addExpense', or 'settings'
  
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

  // Add a timeout to prevent infinite loading states
  useEffect(() => {
    if (isInitialLoad && authHookAuthenticated) {
      const timeout = setTimeout(() => {
        if (isInitialLoad) {
          console.log('SplitwiseView: Loading timeout, setting initial load to false');
          setIsInitialLoad(false);
        }
      }, 5000); // 5 second timeout
      
      return () => clearTimeout(timeout);
    }
  }, [isInitialLoad, authHookAuthenticated]);

  // Debug authentication state
  useEffect(() => {
    console.log('SplitwiseView: Auth state debug:', {
      user: user ? 'exists' : 'null',
      authHookAuthenticated,
      firebaseCurrentUser: auth.currentUser ? 'exists' : 'null'
    });
  }, [user, authHookAuthenticated]);

  const loadGroups = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (loadingRef.current) {
      console.log('SplitwiseView: Groups already loading, skipping...');
      return;
    }
    
    // Prevent duplicate calls if groups are already loaded
    if (groupsLoadedRef.current) {
      console.log('SplitwiseView: Groups already loaded, skipping...');
      return;
    }

    try {
      loadingRef.current = true;
      console.log('SplitwiseView: Attempting to load groups...');
      
      // Add a timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 10000); // 10 second timeout
      });
      
      const response = await Promise.race([
        groupsApi.getAll(),
        timeoutPromise
      ]);
      
      // Always update groups on first load
      const newGroups = response.groups || [];
      setGroups(newGroups);
      
      // Update auth state
      setIsAuthenticated(true);
      setAuthError(null);
      
      groupsLoadedRef.current = true;
      setIsInitialLoad(false);
    } catch (err) {
      console.error('Failed to load groups:', err);
      
      // Handle timeout errors
      if (err.message === 'Request timeout') {
        setAuthError('Request timed out. Please try again.');
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
      } else {
        // Set empty array if API fails for other reasons
        setGroups([]);
        setAuthError(null);
      }
      
      // Always set initial load to false on error to prevent stuck states
      setIsInitialLoad(false);
    } finally {
      loadingRef.current = false;
    }
  }, [groupsApi]);

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
    
    // Add a small delay to ensure smooth loading and prevent stuck states
    const timer = setTimeout(() => {
      loadGroups();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [authHookAuthenticated]);

  // Reset groups loaded flag when authentication state changes
  useEffect(() => {
    if (!authHookAuthenticated) {
      groupsLoadedRef.current = false;
      loadingRef.current = false;
    }
  }, [authHookAuthenticated]);

  // Manual retry function for rate limiting
  const handleRetry = useCallback(() => {
    setAuthError(null);
    groupsLoadedRef.current = false;
    loadingRef.current = false;
    loadGroups();
  }, [loadGroups]);

  const handleCreateGroup = async (newGroup) => {
    try {
      const response = await groupsApi.create(newGroup);
      const createdGroup = response.group;
      setGroups([...groups, createdGroup]);
      setShowCreateGroup(false);
    } catch (err) {
      console.error('Failed to create group:', err);
      // Error will be handled by the API hook
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
      await groupsApi.delete(groupId);
      setGroups(groups.filter(group => group.id !== groupId));
      setSelectedGroup(null);
      setView('list');
    } catch (err) {
      console.error('Failed to delete group:', err);
    }
  };

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    setView('detail');
  };

  const handleBackToList = useCallback(() => {
    setSelectedGroup(null);
    setView('list');
  }, []);

  const handleShowCreateGroup = useCallback(() => {
    setShowCreateGroup(true);
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

  const handleFloatingButtonClick = useCallback(() => {
    setView('addExpense');
  }, []);

  // Notify parent about floating button state
  useEffect(() => {
    const shouldShowFloatingButton = view === 'detail' && selectedGroup && selectedGroup.members && selectedGroup.members.length > 1;
    onFloatingButtonStateChange?.(shouldShowFloatingButton, selectedGroup, handleFloatingButtonClick);
  }, [view, selectedGroup, onFloatingButtonStateChange, handleFloatingButtonClick]);

  const handleAddExpense = useCallback(async (newExpense) => {
    if (!selectedGroup?.id) {
      setView('detail');
      return;
    }

    try {
      // Resolve current user's backend member id from group members
      const currentUserEmail = user?.email?.toLowerCase();
      const members = Array.isArray(selectedGroup.members) ? selectedGroup.members : [];
      const currentUserMember = members.find(m => (m.email && m.email.toLowerCase() === currentUserEmail));
      const resolveBackendUserId = (m) => (m?.userId || m?.id);
      const payerId = resolveBackendUserId(currentUserMember);

      // Map frontend split type to backend
      const backendSplitType = newExpense.splitType === 'equal' ? 'EQUAL' : 'UNEQUAL';

      // Build participants list using backend ids, substituting current user where needed
      const participants = members
        .map(m => {
          const backendId = resolveBackendUserId(m);
          // If this member is the current user, ensure we use payerId
          if (m.email && m.email.toLowerCase() === currentUserEmail) return payerId;
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
          
          {view === 'detail' && !showCreateGroup && (
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
            {authError.includes('Rate limit') ? (
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
              />
            </div>
                  ) : (
            <div className="animate-fadeIn">
              <GroupDetailView
                group={selectedGroup}
                onUpdateGroup={handleUpdateGroup}
                onBack={handleBackToList}
              />
            </div>
          )}
      </div>

    </>
  );
};

export default SplitwiseView;
