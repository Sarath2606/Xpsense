// src/components/views/AdvisorView.js
import React from 'react';
import { Brain, TrendingUp, Target, Lightbulb } from 'lucide-react';
import Header from '../common/header_component';
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
  isAuthenticated
}) => {
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
        {/* Header */}
        <Header 
          title="Financial Advisor"
          showNotification={true}
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

            {/* Quick Actions */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-blue-600 text-white p-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
                  Set Budget Goals
                </button>
                <button className="bg-green-600 text-white p-3 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors">
                  Get Savings Tips
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

export default AdvisorView;
