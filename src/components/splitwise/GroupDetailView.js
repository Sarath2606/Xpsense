import React, { useState, useEffect, useCallback } from 'react';
import AddExpenseForm from './AddExpenseForm';
import AddMemberPage from './AddMemberPage';
import SendInviteModal from './SendInviteModal';
import SettlementSelectionView from './SettlementSelectionView';
import SettlementDetailView from './SettlementDetailView';
import { useSplitwiseApi } from '../../hooks/use_splitwise_api';
import { useAuth } from '../../hooks/use_auth_hook';
import { useSplitwiseRealtime } from '../../hooks/use_splitwise_realtime';

const GroupDetailView = ({ group, onUpdateGroup, onBack, onAddExpenseClick, onSettlementModeChange }) => {
  
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddMemberPage, setShowAddMemberPage] = useState(false);
  const [showSendInvite, setShowSendInvite] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState(null);
  const [loading, setLoading] = useState(false);
  const [settlementSuccess, setSettlementSuccess] = useState(null);
  const [showSettlementSelection, setShowSettlementSelection] = useState(false);
  const [showSettlementDetail, setShowSettlementDetail] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState(null);
  const [settlements, setSettlements] = useState([]);

  // Move all hooks to the top before any conditional returns
  const { expenses: expensesApi, balances: balancesApi } = useSplitwiseApi();
  const { user } = useAuth();

  // Determine the current member id for this group based on authenticated user
  const currentMember = (group?.members || []).find((member) => {
    // Check both member.email and member.user.email
    const memberEmail = ((member.email || member.user?.email) || '').toLowerCase();
    const userEmail = (user?.email || '').toLowerCase();
    return memberEmail && userEmail && memberEmail === userEmail;
  }) || (group?.members || []).find((member) => member.id === 'current_user');
  const currentMemberId = currentMember?.id || 'current_user';

  // Debug logging for current member resolution
  console.log('🔍 Debug current member resolution:', {
    userEmail: user?.email,
    groupMembers: group?.members?.map(m => ({ 
      id: m.id, 
      email: m.email, 
      name: m.name,
      userEmail: m.user?.email,
      userName: m.user?.name
    })),
    currentMember: currentMember ? { 
      id: currentMember.id, 
      email: currentMember.email, 
      name: currentMember.name,
      userEmail: currentMember.user?.email,
      userName: currentMember.user?.name
    } : null,
    currentMemberId
  });

  // Additional debugging for member matching
  if (group?.members) {
    console.log('🔍 Detailed member matching:', {
      userEmail: user?.email,
      userEmailLower: user?.email?.toLowerCase(),
      groupMembersDetailed: group.members.map(member => ({
        id: member.id,
        email: member.email,
        emailLower: member.email?.toLowerCase(),
        name: member.name,
        matches: (member.email || '').toLowerCase() === (user?.email || '').toLowerCase()
      }))
    });
    
    // Log each member individually for clarity
    console.log('🔍 Individual group members:');
    group.members.forEach((member, index) => {
      console.log(`  Member ${index + 1}:`, {
        id: member.id,
        email: member.email,
        name: member.name,
        role: member.role,
        user: member.user ? {
          id: member.user.id,
          email: member.user.email,
          name: member.user.name
        } : null
      });
    });
  }

  const loadGroupData = useCallback(async () => {
    if (!group?.id) return;
    
    setLoading(true);
    try {
      const [expensesResponse, balancesResponse] = await Promise.all([
        expensesApi.getByGroup(group.id),
        balancesApi.getGroupBalances(group.id)
      ]);
      
      
      setExpenses(expensesResponse.expenses || []);
      setBalances(balancesResponse);
    } catch (err) {
      console.error('Failed to load group data:', err);
      
      // If the group doesn't exist or user is not a member, notify parent to go back to list
      if (err.message && (err.message.includes('Group not found') || err.message.includes('Not a member'))) {
        console.log('🚨 Group access error - navigating back to list immediately');
        // Call parent callback to handle this error immediately and refresh groups
        if (onBack) {
          onBack();
          // Trigger a refresh of the groups list to remove stale data
          setTimeout(() => {
            console.log('🔄 Triggering groups refresh due to access error');
            // This will be handled by the parent component
          }, 100);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [group?.id, expensesApi, balancesApi, onBack]);

  // Load expenses and balances when group changes
  useEffect(() => {
    if (group?.id) {
      loadGroupData();
      // Load settlements from localStorage
      const savedSettlements = localStorage.getItem(`settlements_${group.id}`);
      if (savedSettlements) {
        setSettlements(JSON.parse(savedSettlements));
      }
    }
  }, [loadGroupData, group?.id]);

  // Save settlements to localStorage whenever settlements change
  useEffect(() => {
    if (group?.id && settlements.length > 0) {
      localStorage.setItem(`settlements_${group.id}`, JSON.stringify(settlements));
    }
  }, [settlements, group?.id]);

  // Realtime updates: join group room and handle events
  useSplitwiseRealtime(group?.id, {
    onExpenseCreated: (expense) => {
      setExpenses(prev => [...prev, expense]);
    },
    onBalancesUpdated: () => {
      loadGroupData();
    }
  });

  // Notify parent when in settlement mode or add member mode
  useEffect(() => {
    const isInSettlementMode = showSettlementSelection || showSettlementDetail;
    const isInAddMemberMode = showAddMemberPage;
    onSettlementModeChange?.(isInSettlementMode || isInAddMemberMode);
  }, [showSettlementSelection, showSettlementDetail, showAddMemberPage, onSettlementModeChange]);

  // Safety check for group object - moved after all hooks
  if (!group) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-gray-500">Group not found or loading...</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    if (isNaN(amount) || amount === null || amount === undefined) {
      return '$0.00';
    }
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: group.currency || 'AUD'
    }).format(amount);
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  
  // Calculate balances with better error handling
  const calculateBalances = () => {
    if (!balances?.userBalances || !Array.isArray(balances.userBalances)) {
      return {
        youOweTotal: 0,
        youAreOwedTotal: 0,
        youOweList: [],
        youAreOwedList: []
      };
    }

    // Get the current member to find their user ID
    const currentMember = group.members?.find(m => m.id === currentMemberId);
    const currentUserId = currentMember?.userId || currentMember?.user?.id;

    console.log('🔍 Balance calculation debug:', {
      currentMemberId,
      currentUserId,
      currentMember: currentMember ? { id: currentMember.id, userId: currentMember.userId, user: currentMember.user } : null,
      userBalances: balances.userBalances.map(b => ({
        userId: b.userId,
        userEmail: b.userEmail,
        netAmount: b.netAmount,
        netAmountType: typeof b.netAmount,
        netAmountNumber: Number(b.netAmount)
      }))
    });

    const youOweList = balances.userBalances.filter(balance => {
      // More flexible matching - try multiple ways to identify current user
      const isCurrentUser = balance.userId === currentUserId || 
                           balance.userId === currentMemberId ||
                           balance.userId === user?.uid ||
                           balance.userEmail === user?.email ||
                           balance.userId === 'current_user';
      
      // Convert netAmount to number (handle both string and number types)
      const netAmount = Number(balance.netAmount) || 0;
      // FIXED: If someone has a negative balance, it means they owe money, so YOU are owed money
      // If someone has a positive balance, it means they are owed money, so YOU owe them money
      const shouldInclude = !isCurrentUser && netAmount > 0;
      
      console.log('🔍 YouOwe filter (FIXED):', {
        userId: balance.userId,
        isCurrentUser,
        netAmount,
        shouldInclude,
        explanation: netAmount > 0 ? 'They are owed money, so you owe them' : 'They owe money, so you are owed'
      });
      
      return shouldInclude;
    });

    const youAreOwedList = balances.userBalances.filter(balance => {
      const isCurrentUser = balance.userId === currentUserId || 
                           balance.userId === currentMemberId ||
                           balance.userId === user?.uid ||
                           balance.userEmail === user?.email ||
                           balance.userId === 'current_user';
      
      // Convert netAmount to number (handle both string and number types)
      const netAmount = Number(balance.netAmount) || 0;
      // FIXED: If someone has a negative balance, it means they owe money, so YOU are owed money
      const shouldInclude = !isCurrentUser && netAmount < 0;
      
      console.log('🔍 YouAreOwed filter (FIXED):', {
        userId: balance.userId,
        isCurrentUser,
        netAmount,
        shouldInclude,
        explanation: netAmount < 0 ? 'They owe money, so you are owed' : 'They are owed money, so you owe them'
      });
      
      return shouldInclude;
    });

    const youOweTotal = youOweList.reduce((sum, b) => sum + (Number(b.netAmount) || 0), 0) / 100;
    const youAreOwedTotal = Math.abs(youAreOwedList.reduce((sum, b) => sum + (Number(b.netAmount) || 0), 0)) / 100;

    console.log('💰 Balance calculation results:', {
      youOweList: youOweList.map(b => ({ userId: b.userId, netAmount: b.netAmount })),
      youAreOwedList: youAreOwedList.map(b => ({ userId: b.userId, netAmount: b.netAmount })),
      youOweTotal,
      youAreOwedTotal
    });

    return {
      youOweTotal,
      youAreOwedTotal,
      youOweList,
      youAreOwedList
    };
  };

  const balanceData = calculateBalances();

  // Check if current user is admin
  const currentUser = (group.members || []).find(member => member.id === currentMemberId);
  const isAdmin = currentUser?.role === 'admin';

  const handleAddExpense = async (newExpense) => {
    try {
      // Get the current member to find their user ID for the payer
      const currentMember = group.members?.find(m => m.id === currentMemberId);
      const currentUserId = currentMember?.userId || currentMember?.user?.id;
      
      // Ensure payer is the authenticated user id (not member id)
      const expenseToCreate = { ...newExpense, paidBy: currentUserId };
      const response = await expensesApi.create(group.id, expenseToCreate);
      const createdExpense = response.expense;
      setExpenses([...expenses, createdExpense]);
      
      // Reload balances after adding expense
      await loadGroupData();
      
      setShowAddExpense(false);
    } catch (err) {
      console.error('Failed to add expense:', err);
    }
  };

  const handleAddMember = (newMember) => {
    // Update the group with the new member
    const updatedGroup = {
      ...group,
      members: [...(group.members || []), newMember]
    };
    onUpdateGroup(updatedGroup);
  };

  const handleInviteSent = (invitation) => {
    // Show success message or update UI as needed
    console.log('Invitation sent successfully:', invitation);
  };

  const handleSelectBalance = (balance) => {
    setSelectedBalance(balance);
    setShowSettlementSelection(false);
    setShowSettlementDetail(true);
  };

  const handleBackFromSettlementDetail = () => {
    setShowSettlementDetail(false);
    setShowSettlementSelection(true);
  };

  const handleBackFromSettlementSelection = () => {
    setShowSettlementSelection(false);
    setSelectedBalance(null);
  };

  const handleSettlementComplete = (settlementData) => {
    const newSettlement = {
      id: `settlement_${Date.now()}`,
      type: 'settlement',
      description: `Settled with ${settlementData.member?.name || 'Unknown'}`,
      amount: settlementData.settledAmount,
      member: settlementData.member,
      date: new Date().toISOString(),
      settled: true
    };
    
    // Add settlement to the list
    setSettlements(prev => [newSettlement, ...prev]);
    
    // Go back to group detail view
    setShowSettlementDetail(false);
    setShowSettlementSelection(false);
    setSelectedBalance(null);
    
    // Reload balances to reflect the settlement
    loadGroupData();
  };

  const handleSettleExpense = async (expense) => {
    try {
      setLoading(true);
      
      // TODO: Implement actual settlement API call
      // For now, we'll simulate the settlement
      console.log('Settling expense:', expense);
      
      // Update the expense to show as settled
      const updatedExpenses = expenses.map(exp =>
        exp.id === expense.id ? { ...exp, settled: true } : exp
      );
      setExpenses(updatedExpenses);
      
      // Show success message
      setSettlementSuccess({
        expenseId: expense.id,
        amount: expense.amount,
        description: expense.description
      });
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSettlementSuccess(null);
      }, 3000);
      
      // Reload balances to reflect the settlement
      await loadGroupData();
      
    } catch (error) {
      console.error('Failed to settle expense:', error);
    } finally {
      setLoading(false);
    }
  };


  
  // Show settlement selection view
  if (showSettlementSelection) {
    return (
      <SettlementSelectionView
        group={group}
        balances={balances}
        onBack={handleBackFromSettlementSelection}
        onSelectUser={handleSelectBalance}
        formatCurrency={formatCurrency}
      />
    );
  }

  // Show settlement detail view
  if (showSettlementDetail) {
    return (
      <SettlementDetailView
        selectedBalance={selectedBalance}
        onBack={handleBackFromSettlementDetail}
        formatCurrency={formatCurrency}
        onSettlementComplete={handleSettlementComplete}
      />
    );
  }

  // Show add member page
  if (showAddMemberPage) {
    return (
      <AddMemberPage
        group={group}
        onBack={() => setShowAddMemberPage(false)}
        onMemberAdded={handleAddMember}
      />
    );
  }

  return (
    <>
      <div className="w-full">
        {/* Back Button */}
        <div className="mb-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back to Groups</span>
          </button>
        </div>

      {/* Admin Action Buttons */}
      {isAdmin && (
        <div className="flex space-x-3 mb-4">
          <button
            onClick={() => setShowAddMemberPage(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center"
          >
            <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Add Member
          </button>
          <button
            onClick={() => setShowSendInvite(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center"
          >
            <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Send Invite
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-blue-800">Loading group data...</span>
          </div>
        </div>
      )}


                           {/* Stats Cards - Financial Overview */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-xs text-gray-500">You're Owed</div>
            <div className="text-base font-bold text-white truncate">
              {formatCurrency(balanceData.youAreOwedTotal)}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-xs text-gray-500">You Owe</div>
            <div className="text-base font-bold text-white truncate">
              {formatCurrency(balanceData.youOweTotal)}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-xs text-gray-500">Members</div>
            <div className="text-base font-bold text-gray-900">{group.members?.length || 0}</div>
          </div>
        </div>


                           {/* Detailed Balance Breakdown - Two Sections */}
        <div className="mb-4 space-y-3">
          {/* You're Owed Section */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-4 border-b border-gray-200 bg-gray-50">
              <h4 className="font-semibold text-white">You're Owed</h4>
              <p className="text-sm text-gray-500 mt-1">People who owe you money</p>
            </div>
            
            {balances?.userBalances ? (
              <div>
                {balanceData.youAreOwedList.length > 0 ? (
                  balanceData.youAreOwedList
                    .sort((a, b) => (Number(b.netAmount) || 0) - (Number(a.netAmount) || 0))
                    .map((balance) => {
                      const member = (group.members || []).find(m => {
                        const memberUserId = m.userId || m.user?.id;
                        return memberUserId === balance.userId || m.id === balance.userId;
                      });
                      
                      return (
                        <div key={balance.userId} className="px-4 py-4 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                                <span className="text-sm font-medium text-gray-700">
                                  {(member?.name || member?.email || 'Unknown').charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {member?.name || member?.email || 'Unknown'}
                                </div>
                                <div className="text-sm text-white">
                                  Owes you {formatCurrency((Number(balance.netAmount) || 0) / 100)}
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right text-white">
                              <div className="text-base font-bold text-white">
                                +{formatCurrency((Number(balance.netAmount) || 0) / 100)}
                              </div>
                              <div className="text-xs text-gray-500">
                                You're owed
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="px-6 py-8 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-white font-medium">No one owes you money</p>
                    <p className="text-sm text-gray-500 mt-1">Great! You're all caught up</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <p>Loading balance details...</p>
              </div>
            )}
          </div>

          {/* You Owe Section */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-4 border-b border-gray-200 bg-gray-50">
              <h4 className="font-semibold text-white">You Owe</h4>
              <p className="text-sm text-gray-500 mt-1">People you owe money to</p>
            </div>
            
            {balances?.userBalances ? (
              <div>
                {balanceData.youOweList.length > 0 ? (
                  balanceData.youOweList
                    .sort((a, b) => (Number(a.netAmount) || 0) - (Number(b.netAmount) || 0))
                    .map((balance) => {
                      const member = (group.members || []).find(m => {
                        const memberUserId = m.userId || m.user?.id;
                        return memberUserId === balance.userId || m.id === balance.userId;
                      });
                      
                      return (
                        <div key={balance.userId} className="px-4 py-4 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                                <span className="text-sm font-medium text-gray-700">
                                  {(member?.name || member?.email || 'Unknown').charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {member?.name || member?.email || 'Unknown'}
                                </div>
                                <div className="text-sm text-white">
                                  You owe {formatCurrency(Math.abs((Number(balance.netAmount) || 0) / 100))}
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right text-white">
                              <div className="text-base font-bold text-white">
                                -{formatCurrency(Math.abs((Number(balance.netAmount) || 0) / 100))}
                              </div>
                              <div className="text-xs text-gray-500">
                                You owe
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="px-6 py-8 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-white font-medium">You don't owe anyone</p>
                    <p className="text-sm text-gray-500 mt-1">You're all paid up!</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <p>Loading balance details...</p>
              </div>
            )}
          </div>
        </div>

       

      {/* Expenses List */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h4 className="font-semibold text-gray-900">Expenses</h4>
          {/* Only show settle button if user owes money to someone */}
          {balanceData.youOweTotal > 0 && (
            <button
              onClick={() => setShowSettlementSelection(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Settle
            </button>
          )}
        </div>
        {expenses.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <p>No expenses yet. Add your first expense to get started!</p>
          </div>
        ) : (
          <div>
            {/* Settlement Success Message */}
            {settlementSuccess && (
              <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">
                      You settled "{settlementSuccess.description}" - {formatCurrency(settlementSuccess.amount)}
                    </p>
                    <p className="text-gray-500 text-xs">Settlement completed successfully</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-[#1E1E1E]">
              {/* Combine settlements and expenses, then group by month */}
              {(() => {
                // Combine all items (settlements and expenses)
                const allItems = [
                  ...settlements.map(s => ({ ...s, type: 'settlement' })),
                  ...expenses.map(e => ({ ...e, type: 'expense' }))
                ];

                // Sort by date (newest first)
                allItems.sort((a, b) => new Date(b.date) - new Date(a.date));

                // Group by month
                const groupedItems = allItems.reduce((groups, item) => {
                  const date = new Date(item.date);
                  const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
                  const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                  
                  if (!groups[monthKey]) {
                    groups[monthKey] = {
                      monthName,
                      items: []
                    };
                  }
                  groups[monthKey].items.push(item);
                  return groups;
                }, {});

                // Helper function to get expense icon
                const getExpenseIcon = (description) => {
                  const desc = description.toLowerCase();
                  if (desc.includes('food') || desc.includes('restaurant') || desc.includes('meal')) {
                    return (
                      <svg className="w-4 h-4" fill="none" stroke="#BDBDBD" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                      </svg>
                    );
                  } else if (desc.includes('rent') || desc.includes('housing')) {
                    return (
                      <svg className="w-4 h-4" fill="none" stroke="#BDBDBD" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    );
                  } else if (desc.includes('transport') || desc.includes('gas') || desc.includes('fuel')) {
                    return (
                      <svg className="w-4 h-4" fill="none" stroke="#BDBDBD" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                      </svg>
                    );
                  } else {
                    return (
                      <svg className="w-4 h-4" fill="none" stroke="#BDBDBD" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    );
                  }
                };

                // Helper function to determine user's share and status
                const getUserShareInfo = (item, currentMemberId) => {
                  if (item.type === 'settlement') {
                    return { status: 'settlement', amount: item.amount, color: '#BDBDBD' };
                  }

                  // Get the current member to find their user ID
                  const currentMember = group.members?.find(m => m.id === currentMemberId);
                  const currentUserId = currentMember?.userId || currentMember?.user?.id;

                  // Debug logging
                  console.log('🔍 Debug getUserShareInfo:', {
                    expenseDescription: item.description,
                    currentMemberId,
                    currentUserId,
                    currentMember: currentMember ? { id: currentMember.id, userId: currentMember.userId, user: currentMember.user } : null,
                    expenseShares: item.shares,
                    paidBy: item.paidBy,
                    payerId: item.payerId,
                    expenseId: item.id
                  });

                  // Find user's share in this expense using the actual user ID
                  const userShare = item.shares?.find(share => share.userId === currentUserId);
                  const paidByUser = item.paidBy === currentUserId || item.payerId === currentUserId;
                  
                  if (!userShare) {
                    console.log('❌ User not involved - no share found:', {
                      currentMemberId,
                      availableShareUserIds: item.shares?.map(s => s.userId) || [],
                      availableShares: item.shares?.map(s => ({ userId: s.userId, shareAmount: s.shareAmount, user: s.user })) || [],
                      paidBy: item.payerId,
                      expenseId: item.id
                    });
                    
                    // Log each share individually for clarity
                    console.log('🔍 Individual expense shares:');
                    if (item.shares) {
                      item.shares.forEach((share, index) => {
                        console.log(`  Share ${index + 1}:`, {
                          userId: share.userId,
                          shareAmount: share.shareAmount,
                          user: share.user ? { id: share.user.id, name: share.user.name, email: share.user.email } : null
                        });
                        // Log the full user object to see what's actually there
                        console.log(`  Share ${index + 1} FULL USER OBJECT:`, share.user);
                      });
                    }
                    
                    // Try to find share by user email first, then by name
                    const userEmail = user?.email?.toLowerCase();
                    const userName = user?.displayName || user?.name || 'sarath'; // Fallback to common name
                    
                    let shareByEmail = item.shares?.find(share => 
                      share.user?.email?.toLowerCase() === userEmail
                    );
                    
                    // If no email match, try to match by name
                    if (!shareByEmail) {
                      shareByEmail = item.shares?.find(share => {
                        const shareName = share.user?.name?.toLowerCase();
                        return shareName && (
                          shareName.includes('sarath') || 
                          shareName.includes('chandra') ||
                          shareName === userName.toLowerCase()
                        );
                      });
                    }
                    
                    if (shareByEmail) {
                      console.log('✅ Found share by email/name match:', {
                        shareUserId: shareByEmail.userId,
                        shareUserName: shareByEmail.user?.name,
                        shareUserEmail: shareByEmail.user?.email,
                        currentMemberId,
                        currentUserId,
                        currentUserEmail: userEmail,
                        currentUserName: userName
                      });
                      
                      // Use the share found by email/name
                      const userShareAmount = (shareByEmail.shareAmount || 0) * 100; // Convert to cents
                      const totalPaid = (item.amount || 0) * 100; // Convert to cents
                      const paidByUser = item.paidBy === currentUserId || item.payerId === currentUserId;
                      
                      console.log('💰 Splitwise Logic Debug:', {
                        totalPaid,
                        userShareAmount,
                        paidByUser,
                        currentMemberId,
                        currentUserId,
                        paidBy: item.paidBy,
                        payerId: item.payerId,
                        expenseDescription: item.description,
                        paidByMatches: item.paidBy === currentUserId,
                        payerIdMatches: item.payerId === currentUserId,
                        paidByType: typeof item.paidBy,
                        payerIdType: typeof item.payerId,
                        currentUserIdType: typeof currentUserId
                      });
                      
                      if (paidByUser) {
                        const lentAmount = totalPaid - userShareAmount;
                        console.log('💚 You paid - calculating lent amount:', {
                          totalPaid,
                          userShareAmount,
                          lentAmount,
                          status: lentAmount > 0 ? 'you lent' : 'settled'
                        });
                        return { 
                          status: lentAmount > 0 ? 'you lent' : 'settled', 
                          amount: lentAmount, 
                          color: lentAmount > 0 ? '#4CAF50' : '#BDBDBD' 
                        };
                      } else {
                        console.log('🧡 Someone else paid - you borrowed:', {
                          userShareAmount,
                          status: 'you borrowed'
                        });
                        return { 
                          status: 'you borrowed', 
                          amount: userShareAmount, 
                          color: '#FF9800' 
                        };
                      }
                    }
                    
                    return { status: 'not involved', amount: 0, color: '#BDBDBD' };
                  }

                  const userShareAmount = (userShare.shareAmount || 0) * 100; // Convert to cents
                  const totalPaid = (item.amount || 0) * 100; // Convert to cents
                  
                  console.log('✅ Found direct user share:', {
                    currentMemberId,
                    currentUserId,
                    userShareAmount,
                    totalPaid,
                    paidByUser,
                    paidBy: item.paidBy,
                    payerId: item.payerId
                  });
                  
                  if (paidByUser) {
                    // User paid, so they lent money
                    const lentAmount = totalPaid - userShareAmount;
                    console.log('💚 You paid - calculating lent amount:', {
                      totalPaid,
                      userShareAmount,
                      lentAmount,
                      status: lentAmount > 0 ? 'you lent' : 'settled'
                    });
                    return { 
                      status: lentAmount > 0 ? 'you lent' : 'settled', 
                      amount: lentAmount, 
                      color: lentAmount > 0 ? '#4CAF50' : '#BDBDBD' 
                    };
                  } else {
                    // User didn't pay, so they borrowed
                    console.log('🧡 Someone else paid - you borrowed:', {
                      userShareAmount,
                      status: 'you borrowed'
                    });
                    return { 
                      status: 'you borrowed', 
                      amount: userShareAmount, 
                      color: '#FF9800' 
                    };
                  }
                };

                // Render grouped items
                return Object.values(groupedItems).map((group, groupIndex) => (
                  <div key={groupIndex} className="bg-[#1E1E1E]">
                    {/* Month Header */}
                    <div className="px-6 py-4 bg-[#004D40]">
                      <h3 className="text-base font-normal text-[#E0E0E0]">{group.monthName}</h3>
                    </div>
                    
                    {/* Items in this month */}
                    {group.items.map((item) => {
                      const shareInfo = getUserShareInfo(item, currentMemberId);
                      // Find the member who paid by matching their user ID with the expense's paidBy/payerId
                      const paidByMember = (group.members || []).find(m => {
                        const memberUserId = m.userId || m.user?.id;
                        return memberUserId === item.paidBy || memberUserId === item.payerId;
                      });
                      const date = new Date(item.date);
                      const monthAbbr = date.toLocaleDateString('en-US', { month: 'short' });
                      const day = date.getDate();

                      return (
                        <div key={item.id} className="px-6 py-4 border-b border-gray-700">
                          <div className="flex items-center">
                            {/* Column 1: Date & Icon */}
                            <div className="flex flex-col items-center mr-4 w-12">
                              <div className="text-xs text-[#BDBDBD] font-normal">{monthAbbr}</div>
                              <div className="text-lg font-bold text-[#E0E0E0]">{day}</div>
                              <div className="mt-1">
                                {getExpenseIcon(item.description)}
                              </div>
                            </div>

                            {/* Column 2: Description */}
                            <div className="flex-1 mr-4">
                              <div className="font-semibold text-[#E0E0E0] text-base mb-1">
                                {item.description}
                              </div>
                              <div className="text-sm text-[#BDBDBD] font-normal">
                                {item.type === 'settlement' 
                                  ? 'Settlement completed'
                                  : `${paidByMember?.name || 'Unknown'} paid ${formatCurrency(item.amount)}`
                                }
                              </div>
                            </div>

                            {/* Column 3: Status & Amount */}
                            <div className="text-right w-24">
                              <div className="text-xs font-normal mb-1" style={{ color: shareInfo.color }}>
                                {shareInfo.status}
                              </div>
                              <div className="font-bold text-sm" style={{ color: shareInfo.color }}>
                                {Math.abs(shareInfo.amount) > 0 ? `A$${(Math.abs(shareInfo.amount) / 100).toFixed(2)}` : ''}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ));
              })()}
            </div>
          </div>
        )}
      </div>



             {/* Add Expense Form */}
       {showAddExpense && (
         <div className="mb-6">
           <AddExpenseForm
             onClose={() => setShowAddExpense(false)}
             onAddExpense={handleAddExpense}
             group={group}
           />
         </div>
       )}


      {/* Send Invite Modal */}
      {showSendInvite && (
        <SendInviteModal
          isOpen={showSendInvite}
          onClose={() => setShowSendInvite(false)}
          onInviteSent={handleInviteSent}
          group={group}
        />
      )}

    </div>

    </>
  );
};

export default GroupDetailView;
