import React from 'react';

const BudgetGoalsSection = ({ budgetGoals, onUpdateGoal, onGoalClick }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const calculateProgress = (goal) => {
    return Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
  };

  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
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

  const CircularProgress = ({ progress, size = 60, strokeWidth = 4, color = '#3B82F6' }) => {
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
            stroke="#E5E7EB"
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
            className="transition-all duration-500 ease-in-out"
          />
        </svg>
        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-gray-900">{Math.round(progress)}%</span>
        </div>
      </div>
    );
  };

  if (!budgetGoals || budgetGoals.length === 0) {
    return (
      <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Budget Goals</h3>
        </div>
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h4 className="text-base font-medium text-gray-900 mb-2">No budget goals yet</h4>
          <p className="text-gray-500 text-sm">
            Create your first budget goal to start saving for something special.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Budget Goals</h3>
        <span className="text-sm text-gray-500">{budgetGoals.length} active</span>
      </div>
      
      <div className="space-y-3">
        {budgetGoals.map((goal) => {
          const progress = calculateProgress(goal);
          const daysRemaining = getDaysRemaining(goal.endDate);
          const isOverdue = daysRemaining === 0;
          const goalColor = getGoalColor(goal.name);
          
          return (
            <div 
              key={goal.id} 
              className={`rounded-xl p-4 border transition-colors cursor-pointer ${
                isOverdue 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
              onClick={() => onGoalClick && onGoalClick(goal)}
            >
              <div className="flex items-center justify-between">
                {/* Left Section - Icon and Goal Details */}
                <div className="flex items-center space-x-3 flex-1">
                  {/* Goal Icon */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${goalColor}`}>
                    {getGoalIcon(goal.name)}
                  </div>
                  
                  {/* Goal Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm truncate mb-1">
                      {goal.name}
                    </h4>
                    <div className="text-xs text-gray-500">
                      ${goal.savedAmount.toFixed(2)} / ${parseFloat(goal.targetAmount).toFixed(2)}
                    </div>
                  </div>
                </div>
                
                {/* Right Section - Circular Progress */}
                <div className="ml-4">
                  <CircularProgress 
                    progress={progress} 
                    size={60} 
                    strokeWidth={4}
                    color={isOverdue ? '#EF4444' : '#3B82F6'}
                  />
                </div>
              </div>
              
              {/* Additional Info */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {goal.frequency} • ${parseFloat(goal.allocatedAmount).toFixed(2)} per {goal.frequency.slice(0, -2)}
                  </span>
                  <span className={isOverdue ? 'text-red-500' : ''}>
                    {isOverdue ? 'Overdue' : `${daysRemaining} days left`}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Target: {formatDate(goal.endDate)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetGoalsSection;
