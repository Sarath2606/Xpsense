// src/components/views/StatsView.js
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Target, Award, TrendingUp as TrendingUpIcon, DollarSign, Clock, X } from 'lucide-react';
import Header from '../common/header_component';
import BottomNavigation from '../common/bottom_navigation';
import CategoryIcon from '../ui/category_icon';
import { calculateCategorySpending } from '../../utils/calculations_js';
import BudgetCard from '../budget/budget_card.js';
import BudgetForm from '../budget/budget_form.js';

const StatsView = ({
  currentView,
  setCurrentView,
  setShowAddTransaction,
  transactions,
  categories,
  metrics,
  budgetHook,
  userName,
  userPhotoURL,
  onSignOut,
  onSignIn,
  authLoading,
  authError,
  isAuthenticated
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [budgetFilterStatus, setBudgetFilterStatus] = useState('all');
  const { balance, income, expenses } = metrics;
  const categorySpending = calculateCategorySpending(transactions, categories);
  const totalTransactions = transactions.length;
  const avgTransactionAmount = totalTransactions > 0 
    ? Math.abs(transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / totalTransactions)
    : 0;

  // Calculate savings rate
  const savingsRate = income > 0 ? ((income + expenses) / income) * 100 : 0;
  
  // Calculate financial health score (0-100)
  const financialHealthScore = Math.min(100, Math.max(0, 
    (savingsRate * 0.4) + 
    (balance > 0 ? 30 : 0) + 
    (totalTransactions > 5 ? 20 : totalTransactions * 4) +
    (avgTransactionAmount < 100 ? 10 : 0)
  ));

  // Prepare data for charts
  const pieChartData = categorySpending.map(category => ({
    name: category.name,
    value: Math.abs(category.total),
    color: getCategoryColor(category.id)
  }));

  // Mock data for spending trends
  const spendingTrends = [
    { day: 'Mon', amount: 45 },
    { day: 'Tue', amount: 32 },
    { day: 'Wed', amount: 67 },
    { day: 'Thu', amount: 23 },
    { day: 'Fri', amount: 89 },
    { day: 'Sat', amount: 56 },
    { day: 'Sun', amount: 34 }
  ];

  function getCategoryColor(categoryId) {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];
    return colors[categoryId % colors.length];
  }

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getHealthScoreIcon = (score) => {
    if (score >= 80) return '😊';
    if (score >= 60) return '😐';
    return '😟';
  };

  // Mock data for insights
  const topSpendingInsights = {
    highestCategory: categorySpending.length > 0 ? categorySpending[0] : null,
    biggestExpense: transactions.length > 0 ? transactions.reduce((max, t) => Math.abs(t.amount) > Math.abs(max.amount) ? t : max) : null,
    comparativeInsights: [
      "You spent 15% less on food than last month",
      "Transportation costs increased by 8%",
      "Entertainment spending is 25% below average"
    ]
  };

  // Budgets data via hook
  const budgetsEnabled = Boolean(budgetHook);
  
  // Get real savings goals from budget hook
  const savingsGoals = budgetsEnabled ? budgetHook.getGoals() : [];
  const budgetPeriod = budgetsEnabled ? budgetHook.budgetPeriod : 'monthly';
  const setBudgetPeriod = budgetsEnabled ? budgetHook.setBudgetPeriod : () => {};
  const budgetStatus = budgetsEnabled ? budgetHook.getBudgetStatus() : [];
  const budgetAlerts = budgetsEnabled ? budgetHook.getBudgetAlerts() : [];
  const budgetSummary = budgetsEnabled ? budgetHook.getBudgetSummary() : { totalBudget: 0, totalSpent: 0, totalRemaining: 0, overallProgress: 0, budgetCount: 0, overBudgetCount: 0 };
  const filteredBudgets = budgetsEnabled ? budgetHook.budgets.filter(b => {
    if (budgetFilterStatus === 'all') return true;
    const budgetStatusItem = budgetStatus.find(bs => bs.id === b.id);
    if (!budgetStatusItem) return false;
    if (budgetFilterStatus === 'over_budget') return budgetStatusItem.progress.isOverBudget;
    if (budgetFilterStatus === 'near_limit') return budgetStatusItem.progress.progress >= 80 && !budgetStatusItem.progress.isOverBudget;
    if (budgetFilterStatus === 'under_budget') return budgetStatusItem.progress.progress < 80 && !budgetStatusItem.progress.isOverBudget;
    return true;
  }) : [];

  // Auto-allocate savings once per period on mount and when budget period changes
  useEffect(() => {
    if (!budgetsEnabled) return;
    try {
      budgetHook.allocateAutoSavingsForCurrentPeriod?.();
    } catch (e) {
      // no-op
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [budgetsEnabled, budgetPeriod]);

  const handleSaveBudget = (data) => {
    if (!budgetsEnabled) return;
    if (data.mode === 'goal') {
      if (data.id) {
        budgetHook.updateGoal(data.id, { name: data.name, amount: data.amount, deadline: data.deadline, savingsPercent: data.savingsPercent, autoAllocate: data.autoAllocate });
      } else {
        budgetHook.addGoal({ name: data.name, amount: data.amount, deadline: data.deadline, savingsPercent: data.savingsPercent, autoAllocate: data.autoAllocate });
      }
      setEditingGoal(null);
    } else {
      if (editingBudget) {
        budgetHook.updateBudget(editingBudget.id, data);
        setEditingBudget(null);
      } else {
        budgetHook.addBudget(data);
      }
    }
    setShowBudgetForm(false);
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <div className="max-w-sm mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-screen max-h-screen">
        <Header 
          title="Statistics"
          userName={userName}
          userPhotoURL={userPhotoURL}
          onSignOut={onSignOut}
          onSignIn={onSignIn}
          authLoading={authLoading}
          authError={authError}
          isAuthenticated={isAuthenticated}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-6">
            {/* Period Selector */}
            <div className="flex space-x-2 mb-6">
              {['week', 'month', 'year'].map(period => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedPeriod === period
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>

            {/* Financial Health Score */}
            <div className={`rounded-xl p-4 mb-6 ${getHealthScoreColor(financialHealthScore).split(' ')[1]}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Financial Health</h3>
                <span className="text-2xl">{getHealthScoreIcon(financialHealthScore)}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        financialHealthScore >= 80 ? 'bg-green-500' : 
                        financialHealthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${financialHealthScore}%` }}
                    ></div>
                  </div>
                </div>
                <span className={`font-bold text-lg ${getHealthScoreColor(financialHealthScore).split(' ')[0]}`}>
                  {Math.round(financialHealthScore)}
                </span>
              </div>
              <p className="text-gray-600 text-sm mt-2">
                {financialHealthScore >= 80 ? 'Excellent! Keep up the great work!' :
                 financialHealthScore >= 60 ? 'Good! Room for improvement.' :
                 'Needs attention. Consider reviewing your spending habits.'}
              </p>
            </div>

            {/* Summary Cards - 3rd position */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center mb-1">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <h3 className="text-green-600 font-bold text-2xl">
                    ${income.toFixed(2)}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm">Total Income</p>
              </div>
              <div className="bg-red-50 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center mb-1">
                  <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                  <h3 className="text-red-600 font-bold text-2xl">
                    ${Math.abs(expenses).toFixed(2)}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm">Total Expenses</p>
              </div>
            </div>

            {/* Savings Rate - 4th position */}
            <div className="bg-blue-50 rounded-xl p-4 mb-6 text-center">
              <h3 className="text-blue-600 font-bold text-2xl">
                {savingsRate.toFixed(1)}%
              </h3>
              <p className="text-gray-600 text-sm">Savings Rate</p>
              <p className="text-gray-500 text-xs mt-1">
                {savingsRate > 20 ? 'Great savings rate!' : 
                 savingsRate > 10 ? 'Good progress!' : 'Consider increasing savings'}
              </p>
            </div>

            {/* Savings Goals Tracker - 5th position */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-purple-600" />
                  Savings Goals Tracker
                </h3>
              </div>
              
              <div className="space-y-4">
                {savingsGoals.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No savings goals yet</p>
                    <p className="text-gray-400 text-sm">Create your first savings goal to start tracking</p>
                    <button
                      onClick={() => setShowBudgetForm(true)}
                      className="mt-4 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Add Savings Goal
                    </button>
                  </div>
                ) : (
                  savingsGoals.map(goal => {
                    const goalProgress = budgetsEnabled ? budgetHook.getGoalProgress(goal) : { saved: 0, remaining: goal.amount, percent: 0, daysLeft: 0 };
                    const estimated = budgetsEnabled ? budgetHook.getEstimatedAllocation(goal) : 0;
                    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500'];
                    const colorIndex = goal.id % colors.length;
                    
                    return (
                      <div key={goal.id} className="bg-white rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">{goal.name}</h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">${goalProgress.saved.toFixed(0)} / ${goal.amount.toFixed(0)}</span>
                            <button
                              onClick={() => {
                                setEditingGoal({
                                  ...goal,
                                  onAddSavings: (amt) => budgetHook.addSavingsToGoal(goal.id, amt),
                                  onAchieve: () => budgetHook.markGoalAchieved(goal.id),
                                  onDelete: () => budgetHook.deleteGoal(goal.id),
                                });
                                setShowBudgetForm(true);
                              }}
                              className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
                              title="Edit goal"
                            >
                              <span className="text-xs font-bold">✎</span>
                            </button>
                          </div>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-500 ${colors[colorIndex]}`}
                            style={{ width: `${Math.min(goalProgress.percent, 100)}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="text-gray-600">
                            {goalProgress.percent >= 100 ? 'Goal achieved!' : `$${goalProgress.remaining.toFixed(0)} remaining`}
                          </span>
                          <span className="text-gray-500">Est. this {budgetPeriod}: ${estimated.toFixed(0)}</span>
                          <div className="flex items-center text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{goalProgress.daysLeft > 0 ? `${goalProgress.daysLeft} days left` : 'Overdue'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                
                {/* Add Goal Button when goals exist */}
                {savingsGoals.length > 0 && (
                  <div className="text-center pt-2">
                    <button
                      onClick={() => setShowBudgetForm(true)}
                      className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors flex items-center justify-center mx-auto"
                    >
                      <span className="mr-1">+</span>
                      Add Another Goal
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Spending Trends Chart */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Spending Trends</h3>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={spendingTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Breakdown with Chart */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Spending by Category</h3>
              
              {categorySpending.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-gray-400 text-2xl">📊</span>
                  </div>
                  <p className="text-gray-500">No expense data available</p>
                  <p className="text-gray-400 text-sm">Start adding expenses to see category breakdown</p>
                </div>
              ) : (
                <>
                  {/* Pie Chart */}
                  <div className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Category List */}
                  <div className="space-y-3">
                    {categorySpending.map(category => (
                      <div 
                        key={category.id} 
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <CategoryIcon 
                            categoryId={category.id} 
                            categories={categories} 
                            size="sm" 
                          />
                          <div>
                            <span className="font-medium text-gray-900">
                              {category.name}
                            </span>
                            <p className="text-gray-500 text-xs">
                              {category.transactionCount} transaction{category.transactionCount !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ${category.total.toFixed(2)}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {category.percentage}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Top Spending Insights */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-blue-600" />
                Top Spending Insights
              </h3>
              
              <div className="space-y-4">
                {/* Highest Expense Category */}
                {topSpendingInsights.highestCategory && (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-blue-900">Highest Expense Category</h4>
                      <TrendingUpIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-blue-800 font-semibold">{topSpendingInsights.highestCategory.name}</p>
                    <p className="text-blue-600 text-sm">${topSpendingInsights.highestCategory.total.toFixed(2)} this month</p>
                  </div>
                )}

                {/* Biggest Single Expense */}
                {topSpendingInsights.biggestExpense && (
                  <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-red-900">Biggest Single Expense</h4>
                      <DollarSign className="w-4 h-4 text-red-600" />
                    </div>
                    <p className="text-red-800 font-semibold">{topSpendingInsights.biggestExpense.description || 'Transaction'}</p>
                    <p className="text-red-600 text-sm">${Math.abs(topSpendingInsights.biggestExpense.amount).toFixed(2)}</p>
                  </div>
                )}

                {/* Comparative Insights */}
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-green-900">Comparative Insights</h4>
                    <TrendingDown className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="space-y-2">
                    {topSpendingInsights.comparativeInsights.map((insight, index) => (
                      <p key={index} className="text-green-800 text-sm">• {insight}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setShowAddTransaction(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-medium transition-colors"
                >
                  Add Transaction
                </button>
                <button 
                  onClick={() => setCurrentView('transactions')}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 p-3 rounded-lg font-medium transition-colors"
                >
                  View All
                </button>
              </div>
            </div>
          </div>
        </div>

        <BottomNavigation
          currentView={currentView}
          setCurrentView={setCurrentView}
          setShowAddTransaction={setShowAddTransaction}
        />
      </div>

      {/* Budget Form Modal */}
      {showBudgetForm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-3" 
          role="dialog" 
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowBudgetForm(false);
              setEditingBudget(null);
            }
          }}
        >
          <div 
            className="w-full max-w-xs sm:max-w-sm bg-white rounded-xl shadow-xl border border-gray-200 flex flex-col max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">
                {editingGoal ? 'Edit Goal' : editingBudget ? 'Edit Budget' : 'Add Budget / Goal'}
              </h3>
              <button
                onClick={() => {
                  setShowBudgetForm(false);
                  setEditingBudget(null);
                  setEditingGoal(null);
                }}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 sm:p-4">
              <BudgetForm
                onClose={() => {
                  setShowBudgetForm(false);
                  setEditingBudget(null);
                  setEditingGoal(null);
                }}
                onSave={handleSaveBudget}
                categories={categories}
                editingBudget={editingBudget}
                editingGoal={editingGoal}
                budgetPeriod={budgetPeriod}
                showHeader={false}
                useCardContainer={false}
                compact
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsView;