// src/components/common/Header.js
import React from 'react';
import { Bell, Plus } from 'lucide-react';

const Header = ({ 
  title, 
  subtitle, 
  showNotification = false, 
  showAddButton = false, 
  onAddClick,
  userName = "Iqbal Hossain" 
}) => {
  return (
    <div className="bg-gray-50 px-6 py-6">
      <div className="flex justify-between items-center">
        <div>
          {subtitle && (
            <p className="text-gray-500 text-sm">{subtitle}</p>
          )}
          <h1 className="text-xl font-bold text-gray-900">
            {title || userName}
          </h1>
        </div>
        
        <div className="flex items-center space-x-3">
          {showAddButton && (
            <button
              onClick={onAddClick}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
          
          {showNotification && (
            <div className="relative cursor-pointer">
              <Bell className="w-6 h-6 text-gray-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;