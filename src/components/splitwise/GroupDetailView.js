import React, { useState, useEffect, useCallback } from 'react';
import AddExpenseForm from './AddExpenseForm';
import AddMemberModal from './AddMemberModal';
import SendInviteModal from './SendInviteModal';
import { useSplitwiseApi } from '../../hooks/use_splitwise_api';
import { useAuth } from '../../hooks/use_auth_hook';
import { useSplitwiseRealtime } from '../../hooks/use_splitwise_realtime';

const GroupDetailView = ({ group, onUpdateGroup, onBack, onAddExpenseClick }) => {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showSendInvite, setShowSendInvite] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState(null);
  const [loading, setLoading] = useState(false);

  // Move all hooks to the top before any conditional returns
  const { expenses: expensesApi, balances: balancesApi } = useSplitwiseApi();
  const { user } = useAuth();

  // Determine the current member id for this group based on authenticated user
  const currentMember = (group?.members || []).find((member) => {
    const memberEmail = (member.email || '').toLowerCase();
    const userEmail = (user?.email || '').toLowerCase();
    return memberEmail && userEmail && memberEmail === userEmail;
  }) || (group?.members || []).find((member) => member.id === 'current_user');
  const currentMemberId = currentMember?.id || 'current_user';

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
    } finally {
      setLoading(false);
    }
  }, [group?.id, expensesApi, balancesApi]);

  // Load expenses and balances when group changes
  useEffect(() => {
    if (group?.id) {
      loadGroupData();
    }
  }, [loadGroupData]);

  // Realtime updates: join group room and handle events
  useSplitwiseRealtime(group?.id, {
    onExpenseCreated: (expense) => {
      setExpenses(prev => [...prev, expense]);
    },
    onBalancesUpdated: () => {
      loadGroupData();
    }
  });

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
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: group.currency || 'AUD'
    }).format(amount);
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const currentUserBalanceCents = balances?.userBalances?.find(b => b.userId === currentMemberId)?.netAmount || 0;
  const currentUserBalance = (currentUserBalanceCents || 0) / 100;

  // Check if current user is admin
  const currentUser = (group.members || []).find(member => member.id === currentMemberId);
  const isAdmin = currentUser?.role === 'admin';

  const handleAddExpense = async (newExpense) => {
    try {
      // Ensure payer is the authenticated member id
      const expenseToCreate = { ...newExpense, paidBy: currentMemberId };
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

  const handleSettleExpense = (expenseId) => {
    const updatedExpenses = (group.expenses || []).map(expense =>
      expense.id === expenseId ? { ...expense, settled: true } : expense
    );
    
    const updatedGroup = {
      ...group,
      expenses: updatedExpenses
    };
    
    onUpdateGroup(updatedGroup);
  };

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
            onClick={() => setShowAddMember(true)}
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

      {/* Empty Group State - Show when group has only the creator or no members */}
      {!loading && group.members && group.members.length <= 1 && (
        <div className="mb-6">
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">You're the only one here!</h3>
            <p className="text-gray-300 mb-4">Add members to start splitting expenses together</p>
            
            <div className="space-y-3">
              <button
                onClick={() => setShowAddMember(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span>Add group members</span>
              </button>
              
              <button
                onClick={() => {
                  // TODO: Implement share group link functionality
                  alert('Share group link functionality will be implemented soon!');
                }}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                <span>Share group link</span>
              </button>
            </div>
          </div>
        </div>
      )}

                           {/* Stats Cards - Financial Overview */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-xs text-gray-500">You're Owed</div>
            <div className="text-lg font-bold text-green-600 truncate">
              {balances?.userBalances ? 
                formatCurrency(
                  (balances.userBalances
                    .filter(b => b.userId !== currentMemberId && (b.netAmount || 0) > 0)
                    .reduce((sum, b) => sum + (b.netAmount || 0), 0)) / 100
                ) : 
                formatCurrency(0)
              }
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-xs text-gray-500">You Owe</div>
            <div className="text-lg font-bold text-red-600 truncate">
              {balances?.userBalances ? 
                formatCurrency(
                  Math.abs(
                    (balances.userBalances
                      .filter(b => b.userId !== currentMemberId && (b.netAmount || 0) < 0)
                      .reduce((sum, b) => sum + (b.netAmount || 0), 0)) / 100
                  )
                ) : 
                formatCurrency(0)
              }
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-xs text-gray-500">Members</div>
            <div className="text-lg font-bold text-gray-900">{group.members?.length || 0}</div>
          </div>
        </div>

      {/* Members List */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-4">
        <div className="divide-y divide-gray-200">
          {(group.members || []).map((member) => (
            <div key={member.id} className="px-4 py-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-sm font-medium text-purple-700">
                    {(member.name || member.email || '?').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{member.name || 'Unknown'}</div>
                  <div className="text-sm text-gray-500">{member.email || 'No email'}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  member.role === 'admin' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {member.role || 'member'}
                </span>
                {member.id === 'current_user' && (
                  <span className="text-xs text-gray-400">(You)</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

                           {/* Detailed Balance Breakdown - Two Sections */}
        <div className="mb-4 space-y-3">
          {/* You're Owed Section */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-4 border-b border-gray-200 bg-green-50">
              <h4 className="font-semibold text-green-800">You're Owed</h4>
              <p className="text-sm text-green-600 mt-1">People who owe you money</p>
            </div>
            
            {balances?.userBalances ? (
              <div>
                {balances.userBalances
                  .filter(balance => balance.userId !== currentMemberId && (balance.netAmount || 0) > 0)
                  .sort((a, b) => b.netBalance - a.netBalance)
                  .map((balance) => {
                    const member = (group.members || []).find(m => m.id === balance.userId);
                    
                    return (
                      <div key={balance.userId} className="px-4 py-4 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-sm font-medium text-green-700">
                                {(member?.name || member?.email || 'Unknown').charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {member?.name || member?.email || 'Unknown'}
                              </div>
                              <div className="text-sm text-green-600">
                                Owes you {formatCurrency((balance.netAmount || 0) / 100)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right text-green-600">
                            <div className="text-lg font-bold text-green-600">
                              +{formatCurrency((balance.netAmount || 0) / 100)}
                            </div>
                            <div className="text-xs text-green-500">
                              You're owed
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                
                {/* Show message if no one owes you */}
                {balances.userBalances.filter(b => b.userId !== currentMemberId && (b.netAmount || 0) > 0).length === 0 && (
                  <div className="px-6 py-8 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-green-600 font-medium">No one owes you money</p>
                    <p className="text-sm text-green-500 mt-1">Great! You're all caught up</p>
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
            <div className="px-4 py-4 border-b border-gray-200 bg-red-50">
              <h4 className="font-semibold text-red-800">You Owe</h4>
              <p className="text-sm text-red-600 mt-1">People you owe money to</p>
            </div>
            
            {balances?.userBalances ? (
              <div>
                {balances.userBalances
                  .filter(balance => balance.userId !== currentMemberId && (balance.netAmount || 0) < 0)
                  .sort((a, b) => a.netBalance - b.netBalance)
                  .map((balance) => {
                    const member = (group.members || []).find(m => m.id === balance.userId);
                    
                    return (
                      <div key={balance.userId} className="px-4 py-4 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-sm font-medium text-red-700">
                                {(member?.name || member?.email || 'Unknown').charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {member?.name || member?.email || 'Unknown'}
                              </div>
                              <div className="text-sm text-red-600">
                                You owe {formatCurrency(Math.abs((balance.netAmount || 0) / 100))}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right text-red-600">
                            <div className="text-lg font-bold text-red-600">
                              -{formatCurrency(Math.abs((balance.netAmount || 0) / 100))}
                            </div>
                            <div className="text-xs text-red-500">
                              You owe
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                
                {/* Show message if you don't owe anyone */}
                {balances.userBalances.filter(b => b.userId !== currentMemberId && (b.netAmount || 0) < 0).length === 0 && (
                  <div className="px-6 py-8 text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-red-600 font-medium">You don't owe anyone</p>
                    <p className="text-sm text-red-500 mt-1">You're all paid up!</p>
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
        <div className="px-4 py-4 border-b border-gray-200 bg-gray-50">
          <h4 className="font-semibold text-gray-900">Expenses</h4>
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
          <div className="divide-y divide-gray-200">
            {expenses.slice().reverse().map((expense) => {
              const paidByMember = (group.members || []).find(m => m.id === expense.paidBy);
              return (
                <div key={expense.id} className="px-6 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-medium text-gray-900">{expense.description}</h5>
                        <span className="font-semibold text-gray-900">{formatCurrency(expense.amount)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Paid by {paidByMember?.name || 'Unknown'}</span>
                        <span>{new Date(expense.date).toLocaleDateString('en-AU')}</span>
                      </div>
                      {expense.splits && (
                        <div className="mt-2 text-xs text-gray-400">
                          Split: {expense.splits.map(split => {
                            const member = (group.members || []).find(m => m.id === split.userId);
                            return `${member?.name || 'Unknown'}: ${formatCurrency(split.amount)}`;
                          }).join(', ')}
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      {expense.settled ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Settled
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSettleExpense(expense.id)}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors"
                        >
                          Mark Settled
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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

      {/* Add Member Modal */}
      {showAddMember && (
        <AddMemberModal
          isOpen={showAddMember}
          onClose={() => setShowAddMember(false)}
          onMemberAdded={handleAddMember}
          group={group}
        />
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
