// src/components/views/StatsView.js
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Target, Award, TrendingUp as TrendingUpIcon, DollarSign, Clock, X, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';
import CategoryIcon from '../ui/category_icon';
import { calculateCategorySpending } from '../../utils/calculations_js';
import BudgetCard from '../budget/budget_card.js';
import BudgetForm from '../budget/budget_form.js';
import UserDropdown from '../common/user_dropdown';
import SavingsGoalPost2 from '../stats/savings_goal_post2';
import SavingsGoalDetail from '../stats/savings_goal_detail';
import CurrencyConverter from '../stats/currency_converter';
import BudgetGoalModal from '../budget/budget_goal_modal';
import BudgetGoalsSection from '../budget/budget_goals_section';

const StatsView = ({
  currentView,
  setCurrentView,
  setShowAddTransaction,
  transactions = [],
  categories = [],
  metrics = {},
  budgetHook,
  userName,
  userPhotoURL,
  onSignOut,
  onSignIn,
  authLoading,
  authError,
  isAuthenticated,
  user
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [budgetFilterStatus, setBudgetFilterStatus] = useState('all');
  const [activeChart, setActiveChart] = useState('overview');
  const [showSavingsPost, setShowSavingsPost] = useState(false);
  const [showSavingsDetail, setShowSavingsDetail] = useState(false);
  const [selectedGoalForPost, setSelectedGoalForPost] = useState(null);
  const [selectedGoalForDetail, setSelectedGoalForDetail] = useState(null);
  const [showCurrencyConverter, setShowCurrencyConverter] = useState(false);
  const [showBudgetGoalModal, setShowBudgetGoalModal] = useState(false);
  const [budgetGoals, setBudgetGoals] = useState([]);

  const { balance = 0, income = 0, expenses = 0 } = metrics || {};
  const realCategorySpending = calculateCategorySpending(transactions || [], categories || []);
  
  const categorySpending = realCategorySpending.length > 0 
    ? realCategorySpending
    : [
        { id: 1, name: 'Food & Dining', total: 450, percentage: 32, transactionCount: 12 },
        { id: 2, name: 'Transportation', total: 320, percentage: 23, transactionCount: 8 },
        { id: 3, name: 'Shopping', total: 280, percentage: 20, transactionCount: 6 },
        { id: 4, name: 'Entertainment', total: 180, percentage: 13, transactionCount: 4 },
        { id: 5, name: 'Utilities', total: 150, percentage: 11, transactionCount: 3 },
        { id: 6, name: 'Healthcare', total: 120, percentage: 9, transactionCount: 2 }
      ];

  const totalTransactions = (transactions || []).length;
  const avgTransactionAmount = totalTransactions > 0 
    ? Math.abs((transactions || []).reduce((sum, t) => sum + Math.abs(t.amount), 0) / totalTransactions)
    : 0;

  const savingsRate = income > 0 ? ((income - Math.abs(expenses)) / income) * 100 : 0;
  
  const financialHealthScore = Math.min(100, Math.max(0, 
    (savingsRate * 0.4) + 
    (balance > 0 ? 30 : 0) + 
    (totalTransactions > 5 ? 20 : totalTransactions * 4) +
    (avgTransactionAmount < 100 ? 10 : 0)
  ));

  const pieChartData = categorySpending.length > 0 
    ? categorySpending.map(category => ({
        name: category.name,
        value: Math.abs(category.total),
        color: getCategoryColor(category.id)
      })).filter(item => item.value > 0)
    : [
        { name: 'Food & Dining', value: 450, color: '#3B82F6' },
        { name: 'Transportation', value: 320, color: '#10B981' },
        { name: 'Shopping', value: 280, color: '#F59E0B' },
        { name: 'Entertainment', value: 180, color: '#EF4444' },
        { name: 'Utilities', value: 150, color: '#8B5CF6' },
        { name: 'Healthcare', value: 120, color: '#06B6D4' }
      ];

  const spendingTrends = [
    { day: 'Mon', income: 0, expenses: 45, net: -45 },
    { day: 'Tue', income: 0, expenses: 32, net: -32 },
    { day: 'Wed', income: 0, expenses: 67, net: -67 },
    { day: 'Thu', income: 0, expenses: 23, net: -23 },
    { day: 'Fri', income: 3000, expenses: 89, net: 2911 },
    { day: 'Sat', income: 0, expenses: 56, net: -56 },
    { day: 'Sun', income: 0, expenses: 34, net: -34 }
  ];

  function getCategoryColor(categoryId) {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];
    const id = typeof categoryId === 'string' ? categoryId.charCodeAt(0) : categoryId;
    return colors[id % colors.length];
  }

  // Function to categorize spending into Essential vs Discretionary
  const categorizeSpending = (categories) => {
    const essentialCategories = ['Food & Dining', 'Transportation', 'Utilities', 'Healthcare', 'Housing', 'Insurance'];
    const discretionaryCategories = ['Shopping', 'Entertainment', 'Travel', 'Dining Out', 'Hobbies', 'Gifts'];
    
    const essential = categories.filter(cat => 
      essentialCategories.some(essential => 
        cat.name.toLowerCase().includes(essential.toLowerCase())
      )
    );
    
    const discretionary = categories.filter(cat => 
      discretionaryCategories.some(discretionary => 
        cat.name.toLowerCase().includes(discretionary.toLowerCase())
      )
    );
    
    // Add any remaining categories to discretionary
    const remaining = categories.filter(cat => 
      !essential.includes(cat) && !discretionary.includes(cat)
    );
    
    return {
      essential: [...essential, ...remaining],
      discretionary: discretionary
    };
  };

  const categorizedSpending = categorizeSpending(categorySpending);
  const essentialTotal = categorizedSpending.essential.reduce((sum, cat) => sum + Math.abs(cat.total), 0);
  const discretionaryTotal = categorizedSpending.discretionary.reduce((sum, cat) => sum + Math.abs(cat.total), 0);
  const totalSpending = essentialTotal + discretionaryTotal;

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

  const insights = [
    {
      type: 'positive',
      icon: '💰',
      title: 'Great Savings Rate',
      message: `You're saving ${savingsRate.toFixed(1)}% of your income this month!`
    },
    {
      type: 'info',
      icon: '📊',
      title: 'Top Spending Category',
      message: categorySpending.length > 0 ? `${categorySpending[0].name} accounts for ${categorySpending[0].percentage}% of your spending` : 'No spending data available'
    },
    {
      type: 'tip',
      icon: '💡',
      title: 'Smart Tip',
      message: 'Consider setting up automatic transfers to savings for better financial health'
    }
  ];

  const budgetsEnabled = Boolean(budgetHook);
  
  const savingsGoals = budgetsEnabled && budgetHook.getGoals ? budgetHook.getGoals() : [];
  const budgetPeriod = budgetsEnabled && budgetHook.budgetPeriod ? budgetHook.budgetPeriod : 'monthly';
  const setBudgetPeriod = budgetsEnabled && budgetHook.setBudgetPeriod ? budgetHook.setBudgetPeriod : () => {};
  const budgetStatus = budgetsEnabled && budgetHook.getBudgetStatus ? budgetHook.getBudgetStatus() : [];
  const budgetAlerts = budgetsEnabled && budgetHook.getBudgetAlerts ? budgetHook.getBudgetAlerts() : [];
  const budgetSummary = budgetsEnabled && budgetHook.getBudgetSummary ? budgetHook.getBudgetSummary() : { totalBudget: 0, totalSpent: 0, totalRemaining: 0, overallProgress: 0, budgetCount: 0, overBudgetCount: 0 };
  const filteredBudgets = budgetsEnabled && budgetHook.budgets ? budgetHook.budgets.filter(b => {
    if (budgetFilterStatus === 'all') return true;
    const budgetStatusItem = budgetStatus.find(bs => bs.id === b.id);
    if (!budgetStatusItem) return false;
    if (budgetFilterStatus === 'over_budget') return budgetStatusItem.progress.isOverBudget;
    if (budgetFilterStatus === 'near_limit') return budgetStatusItem.progress.progress >= 80 && !budgetStatusItem.progress.isOverBudget;
    if (budgetFilterStatus === 'under_budget') return budgetStatusItem.progress.progress < 80 && !budgetStatusItem.progress.isOverBudget;
    return true;
  }) : [];

  useEffect(() => {
    if (!budgetsEnabled || !budgetHook.allocateAutoSavingsForCurrentPeriod) return;
    try {
      budgetHook.allocateAutoSavingsForCurrentPeriod();
    } catch (e) {
      console.error('Error allocating auto savings:', e);
    }
  }, [budgetsEnabled, budgetPeriod]);

  const handleSaveBudget = (data) => {
    if (!budgetsEnabled) return;
    try {
      if (data.mode === 'goal') {
        if (data.id) {
          budgetHook.updateGoal && budgetHook.updateGoal(data.id, { name: data.name, amount: data.amount, deadline: data.deadline, savingsPercent: data.savingsPercent, autoAllocate: data.autoAllocate });
        } else {
          budgetHook.addGoal && budgetHook.addGoal({ name: data.name, amount: data.amount, deadline: data.deadline, savingsPercent: data.savingsPercent, autoAllocate: data.autoAllocate });
        }
        setEditingGoal(null);
      } else {
        if (editingBudget) {
          budgetHook.updateBudget && budgetHook.updateBudget(editingBudget.id, data);
          setEditingBudget(null);
        } else {
          budgetHook.addBudget && budgetHook.addBudget(data);
        }
      }
    } catch (e) {
      console.error('Error saving budget/goal:', e);
    }
    setShowBudgetForm(false);
  };

  const handleSaveBudgetGoal = (goalData) => {
    setBudgetGoals(prev => [...prev, goalData]);
  };

  const handleUpdateBudgetGoal = (goalId, updates) => {
    setBudgetGoals(prev => 
      prev.map(goal => 
        goal.id === goalId ? { ...goal, ...updates } : goal
      )
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <div className="max-w-sm mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-screen max-h-screen">
        {/* Mobile Header - Only show on main pages, not subpages */}
        {!showSavingsDetail && !showSavingsPost && !showCurrencyConverter && (
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img 
                  src="/logo.svg" 
                  alt="Xpenses Logo" 
                  className="h-8 w-auto object-contain"
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <button
                    onClick={() => {
                      if (isAuthenticated) {
                        setShowUserDropdown(!showUserDropdown);
                      } else {
                        onSignIn && onSignIn();
                      }
                    }}
                    disabled={authLoading}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-black hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {authLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </button>
                  
                  {isAuthenticated && (
                    <UserDropdown
                      user={user}
                      onSignOut={onSignOut}
                      isOpen={showUserDropdown}
                      onClose={() => setShowUserDropdown(false)}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {showSavingsDetail && selectedGoalForDetail ? (
            <SavingsGoalDetail 
                onBack={() => setShowSavingsDetail(false)}
                goal={{
                  name: selectedGoalForDetail.name,
                  amount: selectedGoalForDetail.amount,
                  saved: selectedGoalForDetail.saved || 0,
                  deadline: selectedGoalForDetail.deadline || '2024-12-26',
                  note: selectedGoalForDetail.note || 'Goal description',
                  color: ['#615df7', '#ff5130', '#90bd5a', '#1c95eb', '#f99823', '#952ea4'][(selectedGoalForDetail.id || 0) % 6]
                }}
                onAddSavings={(amt) => budgetHook?.addSavingsToGoal && budgetHook.addSavingsToGoal(selectedGoalForDetail.id, amt)}
                onWithdraw={(amt) => {
                  // Handle withdraw logic here
                  console.log('Withdrawing:', amt);
                }}
                onEditGoal={() => {
                  setEditingGoal({
                    ...selectedGoalForDetail,
                    onAddSavings: (amt) => budgetHook?.addSavingsToGoal && budgetHook.addSavingsToGoal(selectedGoalForDetail.id, amt),
                    onAchieve: () => budgetHook?.markGoalAchieved && budgetHook.markGoalAchieved(selectedGoalForDetail.id),
                    onDelete: () => budgetHook?.deleteGoal && budgetHook.deleteGoal(selectedGoalForDetail.id),
                  });
                  setShowSavingsDetail(false);
                  setShowBudgetForm(true);
                }}
              />
          ) : showSavingsPost && selectedGoalForPost ? (
            <SavingsGoalPost2 
              onBack={() => setShowSavingsPost(false)}
              goalTitle={selectedGoalForPost.name}
              goalSubtitle={`Target $${selectedGoalForPost.amount.toLocaleString()}`}
              savedAmount={(selectedGoalForPost.saved || 0)}
              targetAmount={selectedGoalForPost.amount}
              onAddSavings={(amt) => budgetHook?.addSavingsToGoal && budgetHook.addSavingsToGoal(selectedGoalForPost.id, amt)}
              onEditGoal={() => {
                setEditingGoal({
                  ...selectedGoalForPost,
                  onAddSavings: (amt) => budgetHook?.addSavingsToGoal && budgetHook.addSavingsToGoal(selectedGoalForPost.id, amt),
                  onAchieve: () => budgetHook?.markGoalAchieved && budgetHook.markGoalAchieved(selectedGoalForPost.id),
                  onDelete: () => budgetHook?.deleteGoal && budgetHook.deleteGoal(selectedGoalForPost.id),
                });
                setShowSavingsPost(false);
                setShowBudgetForm(true);
              }}
            />
          ) : showCurrencyConverter ? (
            <CurrencyConverter 
              onBack={() => setShowCurrencyConverter(false)}
            />
          ) : (
            <div className="px-6 py-6">
              {/* Chart Navigation */}
              <div className="flex space-x-2 mb-6">
                {[
                  { id: 'overview', label: 'Overview', icon: Activity },
                  { id: 'spending', label: 'Spending', icon: PieChartIcon },
                  { id: 'trends', label: 'Trends', icon: BarChart3 }
                ].map(chart => (
                  <button
                    key={chart.id}
                    onClick={() => setActiveChart(chart.id)}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeChart === chart.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <chart.icon className="w-4 h-4 mr-2" />
                    {chart.label}
                  </button>
                ))}
              </div>

              {/* Overview Section */}
              {activeChart === 'overview' && (
                <>
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

                  {/* Summary Cards */}
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

                  {/* Savings Rate */}
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



                  {/* Smart Insights */}
                  <div className="space-y-3 mb-6">
                    <h3 className="font-semibold text-gray-900">💡 Smart Insights</h3>
                    {insights.map((insight, index) => (
                      <div key={index} className={`rounded-xl p-4 border ${
                        insight.type === 'positive' ? 'bg-green-50 border-green-200' :
                        insight.type === 'info' ? 'bg-blue-50 border-blue-200' :
                        'bg-yellow-50 border-yellow-200'
                      }`}>
                        <div className="flex items-start space-x-3">
                          <span className="text-2xl">{insight.icon}</span>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{insight.title}</h4>
                            <p className="text-gray-600 text-sm mt-1">{insight.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Budget Goals Section */}
                  <BudgetGoalsSection 
                    budgetGoals={budgetGoals}
                    onUpdateGoal={handleUpdateBudgetGoal}
                  />
                </>
              )}

              {/* Spending Section */}
              {activeChart === 'spending' && (
                <>
                  {/* Spending by Category Pie Chart */}
                  <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4">Spending by Category</h3>
                    {pieChartData.length > 0 ? (
                      <div>
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={pieChartData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={70}
                              innerRadius={15}
                              fill="#8884d8"
                              dataKey="value"
                              startAngle={90}
                              endAngle={-270}
                              paddingAngle={2}
                            >
                              {pieChartData.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={entry.color}
                                  stroke="#ffffff"
                                  strokeWidth={2}
                                />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']}
                              labelStyle={{ color: '#374151' }}
                              contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        
                        {/* Legend with colored dots */}
                        <div className="mt-4 grid grid-cols-2 gap-3">
                          {pieChartData.map((entry, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <div 
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: entry.color }}
                              ></div>
                              <span className="text-sm text-gray-700 font-medium truncate">
                                {entry.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <PieChartIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500">No spending data available</p>
                      </div>
                    )}
                  </div>

                  {/* Essential Spending */}
                  <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-gray-900">Essential Spending</h3>
                      <span className="ml-auto text-sm text-gray-500">${essentialTotal.toFixed(2)}</span>
                    </div>
                    
                    {categorizedSpending.essential.length > 0 ? (
                      <div className="space-y-3">
                        {categorizedSpending.essential.map((category, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center" 
                                   style={{ backgroundColor: getCategoryColor(category.id) + '20' }}>
                                <span className="text-sm font-medium" style={{ color: getCategoryColor(category.id) }}>
                                  {category.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{category.name}</h4>
                                <p className="text-gray-500 text-sm">{category.transactionCount} transactions</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">${category.total.toFixed(2)}</p>
                              <p className="text-gray-500 text-sm">{category.percentage}%</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No essential spending data available</p>
                    )}
                  </div>

                  {/* Discretionary Spending */}
                  <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-gray-900">Discretionary Spending</h3>
                      <span className="ml-auto text-sm text-gray-500">${discretionaryTotal.toFixed(2)}</span>
                    </div>
                    
                    {categorizedSpending.discretionary.length > 0 ? (
                      <div className="space-y-3">
                        {categorizedSpending.discretionary.map((category, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center" 
                                   style={{ backgroundColor: getCategoryColor(category.id) + '20' }}>
                                <span className="text-sm font-medium" style={{ color: getCategoryColor(category.id) }}>
                                  {category.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{category.name}</h4>
                                <p className="text-gray-500 text-sm">{category.transactionCount} transactions</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">${category.total.toFixed(2)}</p>
                              <p className="text-gray-500 text-sm">{category.percentage}%</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No discretionary spending data available</p>
                    )}
                  </div>

                  {/* Spending Insights */}
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-3">💡 Spending Insights</h3>
                    <div className="space-y-2 text-sm">
                      {essentialTotal > discretionaryTotal ? (
                        <p className="text-blue-800">✅ Good balance! Your essential spending (${essentialTotal.toFixed(2)}) is higher than discretionary (${discretionaryTotal.toFixed(2)}).</p>
                      ) : (
                        <p className="text-orange-800">⚠️ Consider reviewing your spending. Discretionary expenses (${discretionaryTotal.toFixed(2)}) are higher than essential (${essentialTotal.toFixed(2)}).</p>
                      )}
                      {discretionaryTotal > (totalSpending * 0.4) && (
                        <p className="text-orange-800">💡 Your discretionary spending is over 40% of total spending. Consider setting a budget for non-essential expenses.</p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Trends Section */}
              {activeChart === 'trends' && (
                <>
                  {/* Spending Trends Chart */}
                  <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4">Weekly Spending Trends</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={spendingTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']}
                          labelStyle={{ color: '#374151' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="expenses" 
                          stackId="1"
                          stroke="#ef4444" 
                          fill="#ef4444" 
                          fillOpacity={0.6}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="income" 
                          stackId="1"
                          stroke="#10b981" 
                          fill="#10b981" 
                          fillOpacity={0.6}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Net Cash Flow Chart */}
                  <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4">Net Cash Flow</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={spendingTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => [`$${value.toFixed(2)}`, 'Net']}
                          labelStyle={{ color: '#374151' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="net" 
                          stroke="#3b82f6" 
                          strokeWidth={3}
                          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}



              {/* Quick Actions */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setShowCurrencyConverter(true)}
                    className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-xl text-sm font-medium transition-colors"
                  >
                    Convert
                  </button>
                  <button 
                    onClick={() => setShowBudgetGoalModal(true)}
                    className="bg-blue-600 text-white p-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Set Budget Goals
                  </button>
                  <button className="bg-purple-600 text-white p-3 rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors">
                    Analyze Spending
                  </button>
                  <button className="bg-orange-600 text-white p-3 rounded-xl text-sm font-medium hover:bg-orange-700 transition-colors">
                    Debt Strategy
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="bg-white border-t border-gray-200">
          <div className="flex justify-around">
            {[
              {
                id: 'home',
                label: 'Home',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                )
              },
              {
                id: 'transactions',
                label: 'Transactions',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                )
              },
              {
                id: 'stats',
                label: 'Stats',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )
              },
              {
                id: 'advisor',
                label: 'Advisor',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                )
              }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex flex-col items-center py-3 px-4 flex-1 transition-colors duration-200 ${
                  currentView === item.id
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className={`transition-colors duration-200 ${
                  currentView === item.id ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {item.icon}
                </div>
                <span className="text-xs mt-1 font-medium">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
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

      {/* Budget Goal Modal */}
      <BudgetGoalModal
        isOpen={showBudgetGoalModal}
        onClose={() => setShowBudgetGoalModal(false)}
        onSave={handleSaveBudgetGoal}
      />
    </div>
  );
};

export default StatsView;