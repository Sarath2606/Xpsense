// src/components/views/AdvisorView.js
import React, { useState } from 'react';
import { Brain, TrendingUp, Target, Lightbulb } from 'lucide-react';
import UserDropdown from '../common/user_dropdown';

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
            {/* Logo - Moved to left */}
            <div className="flex items-center">
              <img 
                src="/logo.svg" 
                alt="Xpenses Logo" 
                className="h-8 w-auto object-contain"
              />
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
                ) : (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
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
    </div>
  );
};

export default AdvisorView;
