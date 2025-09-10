// src/components/views/HomeView.js
import React, { useState } from 'react';
import BalanceCard from '../ui/balance_card';
import ConnectBankModal from '../accounts/connect_bank_modal';
import UserDropdown from '../common/user_dropdown';
import BottomNavigation from '../common/bottom_navigation';

const HomeView = ({ 
  onConnectBank,
  currentView,
  setCurrentView,
  setShowAddTransaction,
  userName,
  userPhotoURL,
  onSignOut,
  onSignIn,
  authLoading,
  authError,
  isAuthenticated,
  user
}) => {
  const [showConnectBankModal, setShowConnectBankModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  



  
  const handleConnectBank = () => {
    if (onConnectBank) {
      onConnectBank();
    } else {
      setShowConnectBankModal(true);
    }
  };



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
                Welcome back!
              </h1>
              <p className="text-gray-600 text-sm">
                Here's your financial overview
              </p>
            </div>

            {/* Add Card Section */}
            <div className="space-y-4 mb-6">
              <BalanceCard
                onAddCard={handleConnectBank}
              />
            </div>


            {/* Recent Transactions Section */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Transactions
                </h2>
                <button 
                  onClick={() => setCurrentView('transactions')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>

              <div className="text-center py-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-base font-medium text-gray-900 mb-2">No transactions yet</h3>
                <p className="text-gray-500 text-sm">
                  Connect your bank account to see your transactions here.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation - Integrated within container */}
        <BottomNavigation currentView={currentView} setCurrentView={setCurrentView} />
      </div>

      {/* Connect Bank Modal */}
      <ConnectBankModal
        isOpen={showConnectBankModal}
        onClose={() => setShowConnectBankModal(false)}
      />
    </div>
  );
};

export default HomeView;