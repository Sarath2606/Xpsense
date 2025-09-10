// src/components/views/TransactionsView.js
import React, { useState } from 'react';
import TransactionList from '../transactions/transaction_list';
import UserDropdown from '../common/user_dropdown';
import BottomNavigation from '../common/bottom_navigation';

const TransactionsView = ({
  currentView,
  setCurrentView,
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

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <div className="max-w-sm mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-screen max-h-screen">
        {/* Mobile Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left Side - Empty for now */}
            <div className="flex items-center">
            </div>
            
            {/* Right Side - User Icon Button */}
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
                
                {/* User Dropdown */}
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

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-6">
            {/* Welcome Section */}
            <div className="mb-6">
              <h1 className="text-xl font-bold text-gray-900 mb-1">
                All Transactions
              </h1>
              <p className="text-gray-600 text-sm">
                Manage your transactions
              </p>
            </div>

            {/* Transaction List Section */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Transactions
                </h2>
              </div>
              
              <div className="w-full">
                <TransactionList
                  transactions={[]}
                  categories={[]}
                  onEditTransaction={() => {}}
                  onDeleteTransaction={() => {}}
                  showActions={false}
                  variant="detailed"
                  emptyMessage="Connect your bank account to see your transactions here."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation - Integrated within container */}
        <BottomNavigation currentView={currentView} setCurrentView={setCurrentView} />
      </div>
    </div>
  );
};

export default TransactionsView;