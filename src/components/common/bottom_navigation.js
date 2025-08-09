// src/components/common/BottomNavigation.js
import React from 'react';
import { Home, CreditCard, Plus, BarChart3, User } from 'lucide-react';

const BottomNavigation = ({ currentView, setCurrentView, setShowAddTransaction }) => {
  return (
    <div className="bg-white border-t border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <button
          onClick={() => setCurrentView('home')}
          className={`p-2 rounded-lg transition-colors ${
            currentView === 'home' ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Home className="w-6 h-6" />
        </button>
        
        <button
          onClick={() => setCurrentView('transactions')}
          className={`p-2 rounded-lg transition-colors ${
            currentView === 'transactions' ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <CreditCard className="w-6 h-6" />
        </button>
        
        <button
          onClick={() => setShowAddTransaction(true)}
          className="bg-gray-900 hover:bg-gray-800 p-3 rounded-full transition-colors"
        >
          <Plus className="w-6 h-6 text-white" />
        </button>
        
        <button
          onClick={() => setCurrentView('stats')}
          className={`p-2 rounded-lg transition-colors ${
            currentView === 'stats' ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <BarChart3 className="w-6 h-6" />
        </button>
        
        <button className="text-gray-400 hover:text-gray-600 p-2 rounded-lg transition-colors">
          <User className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default BottomNavigation;