// src/components/budget/budget_card.js
import React from 'react';
import { MoreVertical, AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import CategoryIcon from '../ui/category_icon';

const BudgetCard = ({ 
  budget, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  showActions = true 
}) => {
  const { category, progress, periodDates } = budget;
  const { totalSpent, remaining, progress: progressPercentage, isOverBudget } = progress;

  const getProgressColor = () => {
    if (isOverBudget) return 'bg-red-500';
    if (progressPercentage >= 80) return 'bg-yellow-500';
    if (progressPercentage >= 60) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getStatusIcon = () => {
    if (isOverBudget) return <AlertTriangle className="w-4 h-4 text-red-500" />;
    if (progressPercentage >= 80) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (isOverBudget) return 'Over Budget';
    if (progressPercentage >= 80) return 'Near Limit';
    if (progressPercentage >= 60) return 'On Track';
    return 'Under Budget';
  };

  const getStatusColor = () => {
    if (isOverBudget) return 'text-red-600 bg-red-50';
    if (progressPercentage >= 80) return 'text-yellow-600 bg-yellow-50';
    if (progressPercentage >= 60) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  const formatPeriod = (period) => {
    switch (period) {
      case 'weekly': return 'Week';
      case 'monthly': return 'Month';
      case 'yearly': return 'Year';
      default: return period;
    }
  };

  const formatDateRange = () => {
    if (!periodDates) return '';
    const start = new Date(periodDates.startDate).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    const end = new Date(periodDates.endDate).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    return `${start} - ${end}`;
  };

  return (
    <div className={`bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow ${
      isOverBudget ? 'border-red-200 bg-red-50' : ''
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <CategoryIcon categoryId={category.id} categories={[category]} size="md" />
          <div>
            <h3 className="font-semibold text-gray-900">{category.name}</h3>
            <p className="text-gray-500 text-sm">{formatPeriod(budget.period)} Budget</p>
          </div>
        </div>
        
        {showActions && (
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <button className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
              <MoreVertical className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        )}
      </div>

      {/* Budget Amount */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-gray-600 text-sm">Budget</p>
          <p className="font-bold text-gray-900">${budget.amount.toFixed(2)}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-600 text-sm">Spent</p>
          <p className={`font-bold ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
            ${totalSpent.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-medium text-gray-900">
            {progressPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${getProgressColor()}`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Status and Remaining */}
      <div className="flex items-center justify-between">
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </div>
        <div className="text-right">
          <p className="text-gray-600 text-xs">Remaining</p>
          <p className={`text-sm font-semibold ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
            {remaining < 0 ? '-' : ''}${Math.abs(remaining).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Date Range */}
      {periodDates && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-gray-500 text-xs">{formatDateRange()}</p>
        </div>
      )}

      {/* Action Menu (if showActions is true) */}
      {showActions && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[120px]">
            <button
              onClick={() => onEdit(budget)}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              Edit Budget
            </button>
            <button
              onClick={() => onToggleStatus(budget.id)}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              {budget.isActive ? 'Deactivate' : 'Activate'}
            </button>
            <button
              onClick={() => onDelete(budget.id)}
              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetCard;
