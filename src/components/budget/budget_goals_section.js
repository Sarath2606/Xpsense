import React from 'react';

const BudgetGoalsSection = ({ budgetGoals, onUpdateGoal }) => {
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
    } else {
      return '💰';
    }
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
          
          return (
            <div 
              key={goal.id} 
              className={`rounded-xl p-4 border transition-colors ${
                isOverdue 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {/* Goal Icon */}
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-lg">
                    {getGoalIcon(goal.name)}
                  </div>
                  
                  {/* Goal Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-900 text-sm truncate">
                        {goal.name}
                      </h4>
                      <span className={`text-sm font-medium ${
                        isOverdue ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        ${goal.savedAmount.toFixed(2)} / ${parseFloat(goal.targetAmount).toFixed(2)}
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isOverdue ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    
                    {/* Goal Info */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {goal.frequency} • ${parseFloat(goal.allocatedAmount).toFixed(2)} per {goal.frequency.slice(0, -2)}
                      </span>
                      <span className={isOverdue ? 'text-red-500' : ''}>
                        {isOverdue ? 'Overdue' : `${daysRemaining} days left`}
                      </span>
                    </div>
                    
                    {/* Target Date */}
                    <div className="text-xs text-gray-400 mt-1">
                      Target: {formatDate(goal.endDate)}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Progress Percentage */}
              <div className="mt-2 text-right">
                <span className={`text-sm font-medium ${
                  isOverdue ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {progress.toFixed(1)}% complete
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetGoalsSection;
