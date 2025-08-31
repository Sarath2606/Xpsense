// src/components/common/UserDropdown.js
import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings } from 'lucide-react';

const UserDropdown = ({ user, onSignOut, isOpen, onToggle, onClose }) => {
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSignOut = () => {
    onSignOut();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50" ref={dropdownRef}>
      {/* User Info */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.displayName || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-1">
        <button
          onClick={handleSignOut}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default UserDropdown;
