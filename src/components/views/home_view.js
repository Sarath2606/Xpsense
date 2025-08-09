// src/components/views/HomeView.js
import React from 'react';
import Header from '../common/header_component';
import BottomNavigation from '../common/bottom_navigation';
import BalanceCard from '../ui/balance_card';
import MetricCard from '../ui/metric_card';
import TransactionList from '../transactions/transaction_list';

const HomeView = ({ 
  currentView, 
  setCurrentView, 
  setShowAddTransaction,
  transactions,
  categories,
  metrics,
  onEditTransaction,
  onDeleteTransaction
}) => {
  const { balance, income, expenses, incomeChange, expenseChange } = metrics;

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-sm mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <Header 
          subtitle="Good Morning!"
          showNotification={true}
        />

        {/* Balance Card */}
        <div className="px-6 mb-6">
          <BalanceCard 
            balance={balance}
            income={income}
            expenses={expenses}
          />
        </div>

        {/* Transactions Section */}
        <div className="px-6 py-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Transactions</h3>
            <button
              onClick={() => setCurrentView('transactions')}
              className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors"
            >
              View All
            </button>
          </div>

          {/* Income/Expense Summary Cards */}
          <div className="flex space-x-4 mb-6">
            <MetricCard 
              type="income"
              value={income}
              change={incomeChange}
              amount={income}
            />
            <MetricCard 
              type="expense"
              value={expenses}
              change={expenseChange}
              amount={expenses}
            />
          </div>

          {/* Recent Transactions */}
          <div>
            <TransactionList
              transactions={transactions}
              categories={categories}
              onEditTransaction={onEditTransaction}
              onDeleteTransaction={onDeleteTransaction}
              showActions={false}
              variant="simple"
              emptyMessage="Start by adding your first transaction!"
            />
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

export default HomeView;