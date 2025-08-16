// src/components/views/TransactionsView.js
import React from 'react';
import { Search } from 'lucide-react';
import Header from '../common/header_component';
import BottomNavigation from '../common/bottom_navigation';
import TransactionList from '../transactions/transaction_list';

const TransactionsView = ({
  currentView,
  setCurrentView,
  setShowAddTransaction,
  transactions,
  categories,
  searchTerm,
  setSearchTerm,
  filterCategory,
  setFilterCategory,
  onEditTransaction,
  onDeleteTransaction,
  userName,
  userPhotoURL,
  onSignOut,
  onSignIn,
  authLoading,
  authError,
  isAuthenticated
}) => {
  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' },
  ];

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <div className="max-w-sm mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-screen max-h-screen">
        {/* Header */}
        <Header 
          title="All Transactions"
          showAddButton={true}
          onAddClick={() => setShowAddTransaction(true)}
          userName={userName}
          userPhotoURL={userPhotoURL}
          onSignOut={onSignOut}
          onSignIn={onSignIn}
          authLoading={authLoading}
          authError={authError}
          isAuthenticated={isAuthenticated}
        />

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* Search and Filter Section */}
          <div className="px-6 pb-4 space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex space-x-2 overflow-x-auto">
              {filterOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setFilterCategory(option.value)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                    filterCategory === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Results Count */}
            {searchTerm && (
              <p className="text-sm text-gray-500">
                {transactions.length} result{transactions.length !== 1 ? 's' : ''} 
                {searchTerm && ` for "${searchTerm}"`}
              </p>
            )}
          </div>

          {/* Transaction List */}
          <div className="px-6 py-4 flex-1">
            <TransactionList
              transactions={transactions}
              categories={categories}
              onEditTransaction={onEditTransaction}
              onDeleteTransaction={onDeleteTransaction}
              showActions={true}
              variant="detailed"
              emptyMessage={
                searchTerm || filterCategory !== 'all'
                  ? 'No transactions match your search criteria'
                  : 'No transactions yet. Add your first transaction!'
              }
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

export default TransactionsView;