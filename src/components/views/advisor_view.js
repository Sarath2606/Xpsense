// src/components/views/AdvisorView.js
import React, { useState } from 'react';
import { Brain, TrendingUp, Target, Lightbulb } from 'lucide-react';
import UserDropdown from '../common/user_dropdown';
import BottomNavigation from '../common/bottom_navigation';

const AdvisorView = ({
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
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const insights = [
    {
      id: 1,
      type: 'spending',
      title: 'Spending Alert',
      message: 'Your dining out expenses are 25% higher than last month. Consider cooking at home to save money.',
      icon: TrendingUp,
      color: 'text-orange-500'
    },
    {
      id: 2,
      type: 'goal',
      title: 'Goal Progress',
      message: 'You\'re on track to reach your savings goal! Keep up the good work.',
      icon: Target,
      color: 'text-green-500'
    },
    {
      id: 3,
      type: 'tip',
      title: 'Smart Tip',
      message: 'Consider setting up automatic transfers to your savings account on payday.',
      icon: Lightbulb,
      color: 'text-blue-500'
    }
  ];

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <div className="max-w-sm mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-screen max-h-screen">
        {/* Mobile Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left Side - Empty for now */}
            <div className="flex items-center">
            </div>
            
            {/* User Icon Button - Right side */}
            <div className="flex items-center space-x-3 relative">
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

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-6">
            {/* Welcome Section */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Your AI Financial Advisor</h2>
              <p className="text-gray-600 text-sm">Get personalized insights and advice to improve your financial health</p>
            </div>

            {/* Insights Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Insights</h3>
              
              {insights.map((insight) => {
                const IconComponent = insight.icon;
                return (
                  <div key={insight.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 bg-white rounded-lg flex items-center justify-center ${insight.color}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm">{insight.title}</h4>
                        <p className="text-gray-600 text-sm mt-1">{insight.message}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>


          </div>
        </div>

        {/* Bottom Navigation - Integrated within container */}
        <BottomNavigation currentView={currentView} setCurrentView={setCurrentView} />
      </div>
    </div>
  );
};

export default AdvisorView;
