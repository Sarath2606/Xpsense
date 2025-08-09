// src/components/views/StatsView.js
import React from 'react';
import Header from '../common/header_component';
import BottomNavigation from '../common/bottom_navigation';
import CategoryIcon from '../ui/category_icon';
import { calculateCategorySpending } from '../../utils/calculations_js';

const StatsView = ({
  currentView,
  setCurrentView,
  setShowAddTransaction,
  transactions,
  categories,
  metrics
}) => {
  const { balance, income, expenses } = metrics;
  const categorySpending = calculateCategorySpending(transactions, categories);
  const totalTransactions = transactions.length;
  const avgTransactionAmount = totalTransactions > 0 
    ? Math.abs(transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / totalTransactions)
    : 0;

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-sm mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        <Header title="Statistics" />

        <div className="px-6 py-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <h3 className="text-green-600 font-bold text-2xl">
                ${income.toFixed(2)}
              </h3>
              <p className="text-gray-600 text-sm">Total Income</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <h3 className="text-red-600 font-bold text-2xl">
                ${expenses.toFixed(2)}
              </h3>
              <p className="text-gray-600 text-sm">Total Expenses</p>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <h3 className="text-blue-600 font-bold text-xl">
                {totalTransactions}
              </h3>
              <p className="text-gray-600 text-sm">Total Transactions</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <h3 className="text-purple-600 font-bold text-xl">
                ${avgTransactionAmount.toFixed(2)}
              </h3>
              <p className="text-gray-600 text-sm">Avg Amount</p>
            </div>
          </div>

          {/* Net Worth */}
          <div className={`rounded-xl p-4 text-center mb-6 ${
            balance >= 0 ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <h3 className={`font-bold text-3xl ${
              balance >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              ${balance.toFixed(2)}
            </h3>
            <p className="text-gray-600 text-sm">Current Balance</p>
          </div>

          {/* Category Breakdown */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Spending by Category
            </h3>
            
            {categorySpending.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-gray-400 text-2xl">📊</span>
                </div>
                <p className="text-gray-500">No expense data available</p>
                <p className="text-gray-400 text-sm">Start adding expenses to see category breakdown</p>
              </div>
            ) : (
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
            )}
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

        <BottomNavigation
          currentView={currentView}
          setCurrentView={setCurrentView}
          setShowAddTransaction={setShowAddTransaction}
        />
      </div>
    </div>
  );
};

export default StatsView;