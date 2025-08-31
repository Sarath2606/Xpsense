// src/components/budget/budget_form.js
import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, DollarSign, Target } from 'lucide-react';

const BudgetForm = ({ 
  onClose, 
  onSave, 
  categories, 
  editingBudget = null,
  budgetPeriod = 'monthly',
  editingGoal = null,
  // UI controls
  useCardContainer = true,
  showHeader = true,
  compact = false
}) => {
  // Simple state for goal form only
  const [goalName, setGoalName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');
  const [savingsPercent, setSavingsPercent] = useState('');
  const [autoAllocate, setAutoAllocate] = useState(false);
  const [errors, setErrors] = useState({});

  // Prefill when editing a goal
  useEffect(() => {
    if (editingGoal) {
      setGoalName(editingGoal.name || '');
      setGoalAmount(
        typeof editingGoal.amount === 'number' ? String(editingGoal.amount) : (editingGoal.amount || '')
      );
      setGoalDeadline(editingGoal.deadline || '');
      setSavingsPercent(
        typeof editingGoal.savingsPercent === 'number' ? String(editingGoal.savingsPercent) : (editingGoal.savingsPercent ?? '')
      );
      setAutoAllocate(Boolean(editingGoal.autoAllocate));
    } else {
      // If switching from edit to create, reset the form
      setGoalName('');
      setGoalAmount('');
      setGoalDeadline('');
      setSavingsPercent('');
      setAutoAllocate(false);
    }
  }, [editingGoal]);

  const validateForm = () => {
    const newErrors = {};
    if (!goalName.trim()) newErrors.name = 'Please enter a name';
    if (!goalAmount || parseFloat(goalAmount) <= 0) newErrors.amount = 'Enter a valid amount';
    if (!goalDeadline) newErrors.deadline = 'Please pick a deadline';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    onSave({
      mode: 'goal',
      id: editingGoal ? editingGoal.id : undefined,
      name: goalName,
      amount: parseFloat(goalAmount) || 0,
      deadline: goalDeadline,
      savingsPercent: savingsPercent === '' ? 0 : parseFloat(savingsPercent) || 0,
      autoAllocate,
    });
  };

  return (
    <div className={useCardContainer ? `bg-white rounded-2xl ${compact ? 'p-4' : 'p-6'} max-w-md w-full mx-4` : undefined}>
      {showHeader && (
        <div className={`flex items-center justify-between ${compact ? 'mb-4' : 'mb-6'}`}>
          <div className="flex items-center space-x-3">
            <div className={`rounded-lg flex items-center justify-center ${compact ? 'w-8 h-8' : 'w-10 h-10'} bg-blue-100`}>
              <Target className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-blue-600`} />
            </div>
            <div>
              <h2 className={`${compact ? 'text-lg' : 'text-xl'} font-bold text-gray-900`}>
                {editingGoal ? 'Edit Goal' : 'Create Goal'}
              </h2>
              <p className="text-gray-500 text-sm">{editingGoal ? 'Update your savings goal' : 'Set a savings goal'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      )}

      {/* Simple Goal Form */}
      <form onSubmit={handleSubmit} className={compact ? 'space-y-4' : 'space-y-6'}>
        {/* Goal Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
          <input
            type="text"
            value={goalName}
            onChange={(e) => setGoalName(e.target.value)}
            className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Send money home"
            autoComplete="off"
            autoFocus
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              step="0.01"
              min="0"
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="500"
            />
          </div>
          {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
        </div>

        {/* Deadline */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              value={goalDeadline}
              onChange={(e) => setGoalDeadline(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {errors.deadline && <p className="text-red-500 text-sm mt-1">{errors.deadline}</p>}
        </div>

        {/* Savings Percentage */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Savings Percentage per Period</label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={savingsPercent}
              onChange={(e) => setSavingsPercent(e.target.value)}
              className="block w-full pr-10 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g. 10 for 10%"
            />
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">%</span>
          </div>
          <p className="text-gray-500 text-xs mt-1">Applies to your income for the selected period. Auto-allocation uses this.</p>
        </div>

        {/* Auto allocate toggle */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Auto-allocate each {budgetPeriod}</label>
          <input
            type="checkbox"
            checked={autoAllocate}
            onChange={(e) => setAutoAllocate(e.target.checked)}
            className="h-4 w-4"
          />
        </div>

        {/* Guidance */}
        {goalAmount && goalDeadline && (
          <GoalGuidance amount={parseFloat(goalAmount)} deadline={goalDeadline} />
        )}

        {/* Action Buttons */}
        <div className={`flex flex-wrap gap-2 ${compact ? 'pt-2' : 'pt-4'}`}>
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 px-4 ${compact ? 'py-2.5' : 'py-3'} border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors`}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`flex-1 px-4 ${compact ? 'py-2.5' : 'py-3'} bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2`}
          >
            <Save className="w-4 h-4" />
            <span>{editingGoal ? 'Save Changes' : 'Create Goal'}</span>
          </button>
          {editingGoal && (
            <>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Mark \"${goalName || editingGoal.name}\" as achieved?`)) {
                    editingGoal.onAchieve?.();
                    onClose();
                  }
                }}
                className={`flex-1 px-4 ${compact ? 'py-2.5' : 'py-3'} bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors`}
              >
                ✓ Mark Achieved
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Delete goal \"${goalName || editingGoal.name}\"? This cannot be undone.`)) {
                    editingGoal.onDelete?.();
                    onClose();
                  }
                }}
                className={`flex-1 px-4 ${compact ? 'py-2.5' : 'py-3'} bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors`}
              >
                × Delete
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

// Inline helper component to display guidance for goals
const GoalGuidance = ({ amount, deadline }) => {
  const today = new Date();
  const end = new Date(deadline);
  const diffDays = Math.max(1, Math.ceil((end - today) / (1000 * 60 * 60 * 24)));
  const perDay = amount / diffDays;
  const perWeek = perDay * 7;
  return (
    <div className="mt-2 p-3 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-700">
      <p>
        Save <span className="font-semibold">${perDay.toFixed(2)}/day</span> or{' '}
        <span className="font-semibold">${perWeek.toFixed(2)}/week</span> to reach your goal in time.
      </p>
    </div>
  );
};

export default BudgetForm;
