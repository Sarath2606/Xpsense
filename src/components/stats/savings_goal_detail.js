import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Target, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import CircularProgress from './CircularProgress';

const SavingsGoalDetail = ({
  onBack,
  goal = {
    name: 'Travel & Vacation',
    amount: 25000,
    saved: 15500,
    deadline: '2024-12-26',
    note: 'Vacation with family',
    color: '#615df7'
  },
  onAddSavings,
  onWithdraw,
  onEditGoal
}) => {
  // Debug: Log the goal data to see what's being passed
  console.log('Goal data received:', goal);
  const [showWithdrawConfirmation, setShowWithdrawConfirmation] = useState(false);
  const [showCompleteGoalConfirmation, setShowCompleteGoalConfirmation] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [amount, setAmount] = useState('');
  const menuRef = useRef(null);

  // Ensure we have valid goal data with fallbacks
  const goalData = {
    name: goal?.name || 'Unnamed Goal',
    amount: goal?.amount || 0,
    saved: goal?.saved || 0,
    deadline: goal?.deadline || '2024-12-26',
    note: goal?.note || 'Goal description',
    color: goal?.color || '#615df7'
  };

  const remaining = goalData.amount - goalData.saved;
  const progressPercent = Math.min(100, Math.round((goalData.saved / goalData.amount) * 100));
  
  // Calculate savings rates
  const daysLeft = Math.max(0, Math.ceil((new Date(goalData.deadline) - new Date()) / (1000 * 60 * 60 * 24)));
  const dailySavings = daysLeft > 0 ? remaining / daysLeft : 0;
  const weeklySavings = dailySavings * 7;
  const monthlySavings = dailySavings * 30;

  // Function to get goal-specific emoji icon
  const getGoalEmoji = (goalName) => {
    const name = goalName.toLowerCase();
    if (name.includes('travel') || name.includes('vacation')) {
      return '🏝️';
    }
    if (name.includes('home') || name.includes('house')) {
      return '🏠';
    }
    if (name.includes('car') || name.includes('vehicle')) {
      return '🚗';
    }
    if (name.includes('education') || name.includes('school')) {
      return '🎓';
    }
    if (name.includes('emergency') || name.includes('fund')) {
      return '🛡️';
    }
    if (name.includes('retirement')) {
      return '💰';
    }
    if (name.includes('wedding')) {
      return '💒';
    }
    if (name.includes('business') || name.includes('startup')) {
      return '💼';
    }
    // Default icon for other goals
    return '🎯';
  };

  const handleCompleteGoalClick = () => {
    // Show confirmation modal instead of directly completing
    setShowCompleteGoalConfirmation(true);
  };

  const handleCompleteGoal = () => {
    // This would mark the goal as completed/achieved
    console.log('Completing goal:', goalData.name);
    // You can add logic here to mark the goal as completed
    // For example: onCompleteGoal?.(goalData.id);
    setShowCompleteGoalConfirmation(false);
  };

  const resetCompleteGoalModal = () => {
    setShowCompleteGoalConfirmation(false);
  };

  const handleWithdraw = () => {
    const parsedAmount = parseFloat(amount);
    if (parsedAmount > 0 && parsedAmount <= goalData.saved) {
      onWithdraw?.(parsedAmount);
      setAmount('');
      setShowWithdrawConfirmation(false);
    }
  };

  const handleWithdrawClick = () => {
    // Set amount to full saved amount and show confirmation directly
    setAmount(goalData.saved.toString());
    setShowWithdrawConfirmation(true);
  };

  const resetWithdrawModals = () => {
    setShowWithdrawConfirmation(false);
    setAmount('');
  };

  const handleEditGoal = () => {
    setShowMenuDropdown(false);
    onEditGoal?.();
  };

  const handleMarkAsCompleted = () => {
    setShowMenuDropdown(false);
    // This would mark the goal as achieved/completed
    console.log('Marking goal as completed:', goalData.name);
  };

  const handleDeleteGoal = () => {
    setShowMenuDropdown(false);
    if (window.confirm(`Are you sure you want to delete "${goalData.name}"? This action cannot be undone.`)) {
      // This would delete the goal
      console.log('Deleting goal:', goalData.name);
    }
  };

  const handleShareGoal = () => {
    setShowMenuDropdown(false);
    // This would share the goal progress
    console.log('Sharing goal:', goalData.name);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenuDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

     return (
     <div className="h-full flex flex-col bg-white">
       {/* Header */}
       <div className="bg-white border-b border-gray-200 px-6 py-4">
         <div className="flex items-center justify-between">
           <button
             onClick={onBack}
             className="flex items-center text-gray-700 font-medium"
           >
             <ArrowLeft className="w-4 h-4 mr-2" />
             Back
           </button>
                       <h1 className="text-lg font-semibold text-gray-900">{goalData.name}</h1>
                       <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setShowMenuDropdown(!showMenuDropdown)}
                className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              
              {/* Menu Dropdown */}
              {showMenuDropdown && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <button
                    onClick={handleEditGoal}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Goal
                  </button>
                  
                  <button
                    onClick={handleMarkAsCompleted}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Mark as Completed
                  </button>
                  
                  <button
                    onClick={handleShareGoal}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    Share Progress
                  </button>
                  
                  <div className="border-t border-gray-200 my-1"></div>
                  
                  <button
                    onClick={handleDeleteGoal}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Goal
                  </button>
                </div>
              )}
            </div>
         </div>
       </div>

       {/* Main Content */}
       <div className="flex-1 overflow-y-auto">
         <div className="p-6">
           {/* Circular Progress Section */}
           <div className="flex flex-col items-center mb-8">
                                                                                                                                                             {/* Circular Progress Indicator */}
                                              <div className="flex justify-center mb-6">
                                     <CircularProgress 
                    progress={progressPercent}
                    icon={getGoalEmoji(goalData.name)}
                    size="lg"
                  />
                 </div>

             {/* Tabs */}
             <div className="flex space-x-2 mb-6">
               <button className="px-6 py-2 bg-purple-600 text-white text-sm rounded-lg font-medium">
                 Goal
               </button>
               <button className="px-6 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg font-medium">
                 Records
               </button>
             </div>
           </div>

           {/* Savings Summary */}
           <div className="mb-6">
             <h3 className="text-sm text-gray-500 mb-4">Savings</h3>
             <div className="grid grid-cols-3 gap-4 text-center">
                               <div>
                  <div className="text-lg font-bold text-gray-900">${goalData.saved.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Saved</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">${remaining.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Remaining</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">${goalData.amount.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Goal</div>
                </div>
             </div>
           </div>

           {/* Divider */}
           <div className="border-t border-gray-200 mb-6"></div>

           {/* Deadline */}
           <div className="mb-6">
                           <div className="text-sm text-gray-500">
                Deadline: {new Date(goalData.deadline).toLocaleDateString('en-US', { 
                  day: 'numeric',
                  month: 'short', 
                  year: 'numeric' 
                })}
              </div>
           </div>

           {/* Divider */}
           <div className="border-t border-gray-200 mb-6"></div>

           {/* Savings Rates */}
           <div className="mb-6">
             <div className="grid grid-cols-3 gap-4 text-center">
               <div>
                 <div className="text-lg font-bold text-gray-900">${dailySavings.toFixed(2)}</div>
                 <div className="text-sm text-gray-500">Daily Savings</div>
               </div>
               <div>
                 <div className="text-lg font-bold text-gray-900">${weeklySavings.toFixed(2)}</div>
                 <div className="text-sm text-gray-500">Weekly Savings</div>
               </div>
               <div>
                 <div className="text-lg font-bold text-gray-900">${monthlySavings.toFixed(2)}</div>
                 <div className="text-sm text-gray-500">Monthly savings</div>
               </div>
             </div>
           </div>

           {/* Divider */}
           <div className="border-t border-gray-200 mb-6"></div>

           {/* Note Section */}
           <div className="mb-8">
             <div className="text-sm text-gray-500 mb-2">Note</div>
                           <div className="text-sm text-gray-900">{goalData.note}</div>
           </div>

                       {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleWithdrawClick}
                className="py-3 px-4 bg-purple-100 hover:bg-purple-200 text-purple-700 font-medium rounded-lg transition-colors text-sm"
              >
                Withdraw
              </button>
                             <button
                 onClick={handleCompleteGoalClick}
                 className="py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors text-sm"
               >
                 Complete Goal
               </button>
            </div>
         </div>
       </div>

      

      

                           {/* Withdraw Confirmation Modal */}
        {showWithdrawConfirmation && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl p-6 w-full max-w-sm">
             <div className="text-center">
               <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                 </svg>
               </div>
               <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Withdrawal</h3>
               <p className="text-gray-600 mb-6">
                 Are you sure you want to withdraw <span className="font-semibold">${parseFloat(amount).toLocaleString()}</span> from your <span className="font-semibold">{goalData.name}</span> goal?
               </p>
               <p className="text-sm text-gray-500 mb-6">
                 This action cannot be undone. The withdrawn amount will be removed from your goal progress.
               </p>
               <div className="flex space-x-3">
                 <button
                   onClick={resetWithdrawModals}
                   className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium"
                 >
                   Cancel
                 </button>
                 <button
                   onClick={handleWithdraw}
                   className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                 >
                   Yes, Withdraw
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}

       {/* Complete Goal Confirmation Modal */}
       {showCompleteGoalConfirmation && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl p-6 w-full max-w-sm">
             <div className="text-center">
               <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
               </div>
               <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Goal</h3>
               <p className="text-gray-600 mb-6">
                 Are you sure you want to mark <span className="font-semibold">{goalData.name}</span> as completed?
               </p>
               <p className="text-sm text-gray-500 mb-6">
                 This will mark your goal as achieved. You can still view your progress history.
               </p>
               <div className="flex space-x-3">
                 <button
                   onClick={resetCompleteGoalModal}
                   className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium"
                 >
                   Cancel
                 </button>
                 <button
                   onClick={handleCompleteGoal}
                   className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                 >
                   Yes, Complete
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}
    </div>
  );
};

export default SavingsGoalDetail;

