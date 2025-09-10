import React, { useState } from 'react';

const BudgetGoalDetail = ({ goal, onBack, onAddSavings, onWithdraw, onEditGoal }) => {
  const [showAddSavingsModal, setShowAddSavingsModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');

  const calculateProgress = () => {
    return Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
  };

  const getDaysRemaining = () => {
    const today = new Date();
    const end = new Date(goal.endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getGoalIcon = (goalName) => {
    const name = goalName.toLowerCase();
    if (name.includes('vacation') || name.includes('travel')) {
      return '✈️';
    } else if (name.includes('car') || name.includes('vehicle')) {
      return '🚗';
    } else if (name.includes('house') || name.includes('home')) {
      return '🏠';
    } else if (name.includes('phone') || name.includes('mobile')) {
      return '📱';
    } else if (name.includes('laptop') || name.includes('computer')) {
      return '💻';
    } else if (name.includes('emergency') || name.includes('savings')) {
      return '🛡️';
    } else {
      return '💰';
    }
  };

  const getGoalColor = (goalName) => {
    const name = goalName.toLowerCase();
    if (name.includes('vacation') || name.includes('travel')) {
      return 'bg-blue-100 text-blue-600';
    } else if (name.includes('car') || name.includes('vehicle')) {
      return 'bg-green-100 text-green-600';
    } else if (name.includes('house') || name.includes('home')) {
      return 'bg-purple-100 text-purple-600';
    } else if (name.includes('phone') || name.includes('mobile')) {
      return 'bg-pink-100 text-pink-600';
    } else if (name.includes('laptop') || name.includes('computer')) {
      return 'bg-indigo-100 text-indigo-600';
    } else if (name.includes('emergency') || name.includes('savings')) {
      return 'bg-orange-100 text-orange-600';
    } else {
      return 'bg-gray-100 text-gray-600';
    }
  };

  const CircularProgress = ({ progress, size = 200, strokeWidth = 8, color = '#752ff0' }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#ebebeb"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-in-out"
          />
        </svg>
        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{Math.round(progress)}%</div>
            <div className="text-sm text-gray-500">Complete</div>
          </div>
        </div>
      </div>
    );
  };

  const handleAddSavings = () => {
    if (amount && parseFloat(amount) > 0) {
      onAddSavings(parseFloat(amount));
      setAmount('');
      setShowAddSavingsModal(false);
    }
  };

  const handleWithdraw = () => {
    if (amount && parseFloat(amount) > 0 && parseFloat(amount) <= goal.savedAmount) {
      onWithdraw(parseFloat(amount));
      setAmount('');
      setShowWithdrawModal(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'short', 
      year: 'numeric'
    });
  };

  const calculateDailySavings = () => {
    const daysRemaining = getDaysRemaining();
    if (daysRemaining === 0) return 0;
    const remainingAmount = goal.targetAmount - goal.savedAmount;
    return remainingAmount / daysRemaining;
  };

  const calculateWeeklySavings = () => {
    return calculateDailySavings() * 7;
  };

  const calculateMonthlySavings = () => {
    return calculateDailySavings() * 30;
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="text-gray-700 font-medium flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Goals
          </button>
          <button 
            onClick={onEditGoal}
            className="text-gray-700 font-medium flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
        </div>

        {/* Goal Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl ${getGoalColor(goal.name)}`}>
              {getGoalIcon(goal.name)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{goal.name}</h1>
              <p className="text-gray-600">Deadline: {formatDate(goal.endDate)}</p>
            </div>
          </div>
          
          {/* Progress Circle */}
          <div className="flex justify-center mb-6">
            <CircularProgress 
              progress={calculateProgress()} 
              size={200} 
              strokeWidth={8}
              color="#752ff0"
            />
          </div>

          {/* Progress Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">${goal.savedAmount.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Saved</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">${(goal.targetAmount - goal.savedAmount).toLocaleString()}</div>
              <div className="text-sm text-gray-500">Remaining</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">${goal.targetAmount.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Goal</div>
            </div>
          </div>
        </div>

        {/* Savings Breakdown */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Savings Breakdown</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-gray-900">${calculateDailySavings().toFixed(2)}</div>
              <div className="text-sm text-gray-500">Daily Savings</div>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">${calculateWeeklySavings().toFixed(2)}</div>
              <div className="text-sm text-gray-500">Weekly Savings</div>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">${calculateMonthlySavings().toFixed(2)}</div>
              <div className="text-sm text-gray-500">Monthly Savings</div>
            </div>
          </div>
        </div>

        {/* Goal Details */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Goal Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Frequency:</span>
              <span className="font-medium">{goal.frequency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount per {goal.frequency.slice(0, -2)}:</span>
              <span className="font-medium">${parseFloat(goal.allocatedAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Days Remaining:</span>
              <span className="font-medium">{getDaysRemaining()} days</span>
            </div>
            {goal.note && (
              <div className="pt-3 border-t border-gray-200">
                <span className="text-gray-600">Note:</span>
                <p className="text-gray-900 mt-1">{goal.note}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-2xl font-medium hover:bg-gray-200 transition-colors"
          >
            Withdraw
          </button>
          <button
            onClick={() => setShowAddSavingsModal(true)}
            className="flex-1 bg-purple-600 text-white py-4 px-6 rounded-2xl font-medium hover:bg-purple-700 transition-colors"
          >
            Add Savings
          </button>
        </div>
      </div>

      {/* Add Savings Modal */}
      {showAddSavingsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Savings</h3>
            <div className="relative mb-4">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddSavingsModal(false)}
                className="flex-1 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSavings}
                className="flex-1 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Withdraw Savings</h3>
            <div className="relative mb-4">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                max={goal.savedAmount}
                className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <p className="text-sm text-gray-500 mb-4">Available: ${goal.savedAmount.toFixed(2)}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                className="flex-1 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetGoalDetail;
