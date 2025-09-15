// src/components/views/SplitwiseView.js
import React, { useState } from 'react';
import UserDropdown from '../common/user_dropdown';
import BottomNavigation from '../common/bottom_navigation';
import SplitwiseView from '../splitwise/SplitwiseView';

const SplitwiseViewPage = ({
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
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [floatingButtonClickHandler, setFloatingButtonClickHandler] = useState(null);

  const handleFloatingButtonStateChange = (shouldShow, group, clickHandler) => {
    setShowFloatingButton(shouldShow);
    setFloatingButtonClickHandler(() => clickHandler);
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <div className="max-w-sm w-full mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-screen max-h-screen relative">
        {/* Mobile Header - Fixed Header with Profile Button */}
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

        {/* Main Content - Scrollable; force consistent scrollbar to avoid width shift */}
        <div className="flex-1 overflow-y-scroll" style={{ scrollbarGutter: 'stable both-edges' }}>
          <div className="px-6 py-6 w-full">
            <SplitwiseView
              onBack={() => setCurrentView('home')}
              onFloatingButtonStateChange={handleFloatingButtonStateChange}
            />
          </div>
        </div>

        {/* Bottom Navigation - Fixed Footer */}
        <BottomNavigation currentView={currentView} setCurrentView={setCurrentView} />

        {/* Floating Action Button - Fixed within container */}
        {showFloatingButton && floatingButtonClickHandler && (
          <div className="absolute bottom-20 right-4 z-[100] pointer-events-none">
            <button
              onClick={floatingButtonClickHandler}
              className="pointer-events-auto bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
              title="Add expense"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SplitwiseViewPage;
