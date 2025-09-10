// src/components/views/StatsView.js
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Target, Award, TrendingUp as TrendingUpIcon, DollarSign, Clock, X, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';
import CategoryIcon from '../ui/category_icon';
import { calculateCategorySpending } from '../../utils/calculations_js';
import BudgetCard from '../budget/budget_card.js';
import UserDropdown from '../common/user_dropdown';
import BottomNavigation from '../common/bottom_navigation';
import SavingsGoalPost2 from '../stats/savings_goal_post2';
import SavingsGoalDetail from '../stats/savings_goal_detail';
import CurrencyConverter from '../stats/currency_converter';
import BudgetGoalPage from '../budget/budget_goal_page';
import BudgetGoalDetail from '../budget/budget_goal_detail';
import BudgetGoalsSection from '../budget/budget_goals_section';
import { useBackendAccounts } from '../../hooks/use_backend_accounts';

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
  user,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [budgetFilterStatus, setBudgetFilterStatus] = useState('all');
  const [activeChart, setActiveChart] = useState('overview');
  const [showSavingsPost, setShowSavingsPost] = useState(false);
  const [showSavingsDetail, setShowSavingsDetail] = useState(false);
  const [selectedGoalForPost, setSelectedGoalForPost] = useState(null);
  const [selectedGoalForDetail, setSelectedGoalForDetail] = useState(null);
  const [showCurrencyConverter, setShowCurrencyConverter] = useState(false);
  const [showBudgetGoalPage, setShowBudgetGoalPage] = useState(false);
  const [showBudgetGoalDetail, setShowBudgetGoalDetail] = useState(false);
  const [selectedBudgetGoal, setSelectedBudgetGoal] = useState(null);
  const [budgetGoals, setBudgetGoals] = useState([]);

  // Bank connection status
  const { accounts, loading: accountsLoading } = useBackendAccounts();
  const hasConnectedAccounts = accounts && accounts.length > 0;
  
  const isUsingRealData = hasConnectedAccounts && transactions && transactions.length > 0;

  const { balance = 0, income = 0, expenses = 0 } = metrics || {};
  const realCategorySpending = calculateCategorySpending(transactions || [], categories || []);
  
  // Only use real data when bank is connected, otherwise empty array
  const categorySpending = hasConnectedAccounts ? realCategorySpending : [];

  const totalTransactions = hasConnectedAccounts ? (transactions || []).length : 0;
  const avgTransactionAmount = hasConnectedAccounts && totalTransactions > 0 
    ? Math.abs((transactions || []).reduce((sum, t) => sum + Math.abs(t.amount), 0) / totalTransactions)
    : 0;

  const savingsRate = hasConnectedAccounts && income > 0 ? ((income - Math.abs(expenses)) / income) * 100 : 0;
  
  const financialHealthScore = hasConnectedAccounts ? Math.min(100, Math.max(0, 
    (savingsRate * 0.4) + 
    (balance > 0 ? 30 : 0) + 
    (totalTransactions > 5 ? 20 : totalTransactions * 4) +
    (avgTransactionAmount < 100 ? 10 : 0)
  )) : 0;

  const pieChartData = categorySpending.length > 0 
    ? categorySpending.map(category => ({
        name: category.name,
        value: Math.abs(category.total),
        color: getCategoryColor(category.id)
      })).filter(item => item.value > 0)
    : [];

  // Real-time spending trends based on actual data
  const generateRealTimeTrends = () => {
    if (!hasConnectedAccounts || !isUsingRealData) {
      return [];
    }

    // Group transactions by day of the week
    const dayTotals = {
      'Mon': { income: 0, expenses: 0 },
      'Tue': { income: 0, expenses: 0 },
      'Wed': { income: 0, expenses: 0 },
      'Thu': { income: 0, expenses: 0 },
      'Fri': { income: 0, expenses: 0 },
      'Sat': { income: 0, expenses: 0 },
      'Sun': { income: 0, expenses: 0 }
    };

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const dayName = days[date.getDay()];
      
      if (transaction.amount > 0) {
        dayTotals[dayName].income += transaction.amount;
      } else {
        dayTotals[dayName].expenses += Math.abs(transaction.amount);
      }
    });

    return Object.entries(dayTotals).map(([day, totals]) => ({
      day,
      income: totals.income,
      expenses: totals.expenses,
      net: totals.income - totals.expenses
    }));
  };

  const spendingTrends = generateRealTimeTrends();

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

  // Real-time insights based on actual data
  const generateRealTimeInsights = () => {
    if (!hasConnectedAccounts) {
      return [
        {
          type: 'tip',
          icon: '💡',
          title: 'Connect Your Bank Account',
          message: 'Connect your bank account to get personalized financial insights and recommendations.'
        },
        {
          type: 'info',
          icon: '📊',
          title: 'Real-Time Analysis',
          message: 'Get detailed spending analysis, trends, and smart recommendations based on your actual transactions.'
        },
        {
          type: 'positive',
          icon: '💰',
          title: 'Smart Financial Management',
          message: 'Track your spending, set budgets, and achieve your financial goals with real-time data.'
        }
      ];
    }

    const insights = [];

    // Savings rate insight
    if (savingsRate > 20) {
      insights.push({
        type: 'positive',
        icon: '💰',
        title: 'Excellent Savings Rate',
        message: `You're saving ${savingsRate.toFixed(1)}% of your income! This is above the recommended 20% target.`
      });
    } else if (savingsRate > 10) {
      insights.push({
        type: 'info',
        icon: '📈',
        title: 'Good Savings Progress',
        message: `You're saving ${savingsRate.toFixed(1)}% of your income. Consider increasing to 20% for better financial security.`
      });
    } else {
      insights.push({
        type: 'tip',
        icon: '💡',
        title: 'Improve Savings',
        message: `Your savings rate is ${savingsRate.toFixed(1)}%. Try to save at least 20% of your income for better financial health.`
      });
    }

    // Top spending category insight
    if (categorySpending.length > 0) {
      const topCategory = categorySpending[0];
      if (topCategory.percentage > 40) {
        insights.push({
          type: 'tip',
          icon: '🎯',
          title: 'High Category Concentration',
          message: `${topCategory.name} accounts for ${topCategory.percentage}% of your spending. Consider diversifying your expenses.`
        });
      } else {
        insights.push({
          type: 'positive',
          icon: '📊',
          title: 'Well-Distributed Spending',
          message: `${topCategory.name} is your top category at ${topCategory.percentage}%. Your spending is well-balanced across categories.`
        });
      }
    }

    // Transaction frequency insight
    if (totalTransactions > 0) {
      const avgAmount = avgTransactionAmount;
      if (avgAmount > 200) {
        insights.push({
          type: 'tip',
          icon: '💳',
          title: 'High Transaction Values',
          message: `Your average transaction is $${avgAmount.toFixed(2)}. Consider reviewing large purchases for potential savings.`
        });
      } else if (avgAmount < 50) {
        insights.push({
          type: 'positive',
          icon: '✅',
          title: 'Good Transaction Management',
          message: `Your average transaction is $${avgAmount.toFixed(2)}. You're managing your spending well with smaller, controlled purchases.`
        });
      }
    }

    // Essential vs discretionary spending insight
    if (totalSpending > 0) {
      const discretionaryPercentage = (discretionaryTotal / totalSpending) * 100;
      if (discretionaryPercentage > 50) {
        insights.push({
          type: 'tip',
          icon: '🎯',
          title: 'High Discretionary Spending',
          message: `${discretionaryPercentage.toFixed(1)}% of your spending is discretionary. Consider reducing non-essential expenses.`
        });
      } else {
        insights.push({
          type: 'positive',
          icon: '✅',
          title: 'Balanced Spending',
          message: `${discretionaryPercentage.toFixed(1)}% of your spending is discretionary. You're maintaining a good balance between essential and non-essential expenses.`
        });
      }
    }

    // Add a general tip if we have room
    if (insights.length < 3) {
      insights.push({
        type: 'tip',
        icon: '💡',
        title: 'Smart Tip',
        message: 'Connect your bank account to get real-time insights and automatic transaction categorization.'
      });
    }

    return insights.slice(0, 3); // Limit to 3 insights
  };

  const insights = generateRealTimeInsights();

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
    if (!budgetsEnabled || !budgetHook?.allocateAutoSavingsForCurrentPeriod) return;
    try {
      budgetHook.allocateAutoSavingsForCurrentPeriod();
    } catch (e) {
      console.error('Error allocating auto savings:', e);
    }
  }, [budgetsEnabled]); // Removed budgetHook from dependencies to prevent infinite re-renders

  const handleSaveBudgetGoal = (goal) => {
    if (budgetsEnabled && budgetHook.addGoal) {
      budgetHook.addGoal(goal);
    }
    setShowBudgetGoalPage(false);
  };

  const handleUpdateBudgetGoal = (goalId, updates) => {
    if (budgetsEnabled && budgetHook.updateGoal) {
      budgetHook.updateGoal(goalId, updates);
    }
  };

  const handleGoalClick = (goal) => {
    setSelectedBudgetGoal(goal);
    setShowBudgetGoalDetail(true);
  };

  const handleAddSavings = (goalId, amount) => {
    if (budgetsEnabled && budgetHook.addSavings) {
      budgetHook.addSavings(goalId, amount);
    }
  };

  const handleWithdraw = (goalId, amount) => {
    if (budgetsEnabled && budgetHook.withdraw) {
      budgetHook.withdraw(goalId, amount);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <div className="max-w-sm mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-screen max-h-screen">
        {/* Mobile Header - Only show on main pages, not subpages */}
        {!showSavingsDetail && !showSavingsPost && !showCurrencyConverter && (
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left Side - Empty for now */}
              <div className="flex items-center">
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
                    ) : user?.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt="Profile" 
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-white">
                        {user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
                      </span>
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
                  // TODO: Add edit functionality for savings goals
                  console.log('Edit savings goal clicked');
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
                // TODO: Add edit functionality for savings goals
                console.log('Edit savings goal clicked');
              }}
            />
          ) : showCurrencyConverter ? (
            <CurrencyConverter 
              onBack={() => setShowCurrencyConverter(false)}
            />
          ) : showBudgetGoalPage ? (
            <BudgetGoalPage
              onBack={() => setShowBudgetGoalPage(false)}
              onSave={handleSaveBudgetGoal}
              isBankConnected={hasConnectedAccounts}
              onConnectBank={() => {
                setShowBudgetGoalPage(false);
                // TODO: Add logic to show bank connection modal
                console.log('Connect bank clicked');
              }}
            />
          ) : showBudgetGoalDetail && selectedBudgetGoal ? (
            <BudgetGoalDetail
              goal={selectedBudgetGoal}
              onBack={() => {
                setShowBudgetGoalDetail(false);
                setSelectedBudgetGoal(null);
              }}
              onAddSavings={handleAddSavings}
              onWithdraw={handleWithdraw}
              onEditGoal={() => {
                setShowBudgetGoalDetail(false);
                // TODO: Add edit functionality
                console.log('Edit goal clicked');
              }}
            />
          ) : (
            <div className="px-6 py-6 relative">
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



              {/* Bank Connection Required Section */}
              {!hasConnectedAccounts && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Connect Your Bank Account</h3>
                    <p className="text-gray-600 mb-4">
                      Get personalized financial insights, real-time spending analysis, and smart recommendations based on your actual transactions.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Real-time transaction analysis</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Personalized spending insights</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Smart financial recommendations</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        // TODO: Add logic to show bank connection modal
                        console.log('Connect bank clicked from stats overview');
                      }}
                      className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg"
                    >
                      Connect Bank Account
                    </button>
                  </div>
                </div>
              )}

              {/* Overview Section - Show for all users */}
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
                      {!hasConnectedAccounts ? 'Connect your bank account to get your personalized financial health score' :
                       financialHealthScore >= 80 ? 'Excellent! Keep up the great work!' :
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
                          ${hasConnectedAccounts ? income.toFixed(2) : '0.00'}
                        </h3>
                      </div>
                      <p className="text-gray-600 text-sm">Total Income</p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center mb-1">
                        <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                        <h3 className="text-red-600 font-bold text-2xl">
                          ${hasConnectedAccounts ? Math.abs(expenses).toFixed(2) : '0.00'}
                        </h3>
                      </div>
                      <p className="text-gray-600 text-sm">Total Expenses</p>
                    </div>
                  </div>

                  {/* Savings Rate */}
                  <div className="bg-blue-50 rounded-xl p-4 mb-6 text-center">
                    <h3 className="text-blue-600 font-bold text-2xl">
                      {hasConnectedAccounts ? savingsRate.toFixed(1) : '0.0'}%
                    </h3>
                    <p className="text-gray-600 text-sm">Savings Rate</p>
                    <p className="text-gray-500 text-xs mt-1">
                      {!hasConnectedAccounts ? 'Connect bank account to see your savings rate' :
                       savingsRate > 20 ? 'Great savings rate!' : 
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
                    onGoalClick={handleGoalClick}
                  />

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
                          onClick={() => setShowBudgetGoalPage(true)}
                          className="bg-blue-600 text-white p-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          Set Budget Goals
                        </button>
                        <button className="bg-purple-600 text-white p-3 rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors">
                          Analyze Spending
                        </button>
                        <button 
                          onClick={() => setCurrentView('splitwise')}
                          className="bg-purple-600 text-white p-3 rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors"
                        >
                          Split Expenses
                        </button>
                      </div>
                    </div>
                </>
              )}

              {/* Spending Section */}


              {/* Spending Section - Only show when bank is connected */}
              {activeChart === 'spending' && hasConnectedAccounts && (
                <>
                  {/* Spending by Category Pie Chart */}
                  <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4">Spending by Category</h3>
                    {pieChartData.length > 0 ? (
                      <div>
                        <div style={{ width: '100%', height: '300px' }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={pieChartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                innerRadius={20}
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
                        </div>
                        
                        {/* Legend with colored dots */}
                        <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
                          <h4 className="font-medium text-gray-900 mb-3">Category Breakdown</h4>
                          <div className="space-y-3">
                            {pieChartData.map((entry, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <div 
                                    className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm"
                                    style={{ backgroundColor: entry.color }}
                                  ></div>
                                  <div>
                                    <span className="text-sm font-medium text-gray-900">
                                      {entry.name}
                                    </span>
                                    <p className="text-xs text-gray-500">
                                      ${entry.value.toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                                <span className="text-sm font-semibold text-gray-700">
                                  {((entry.value / pieChartData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%
                                </span>
                              </div>
                            ))}
                          </div>
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
                                  {(category.name || '?').charAt(0)}
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
                                  {(category.name || '?').charAt(0)}
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


              {/* Trends Section - Only show when bank is connected */}
              {activeChart === 'trends' && hasConnectedAccounts && (
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
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation currentView={currentView} setCurrentView={setCurrentView} />
      </div>


    </div>
  );
};

export default StatsView;