// src/App.js
import React, { useState } from 'react';
import { BackendAuthProvider, useBackendAuth } from './hooks/use_backend_auth';
import BackendLoginScreen from './components/auth/backend_login_screen';
import BackendRegisterScreen from './components/auth/backend_register_screen';
import HomeView from './components/views/home_view';
import TransactionsView from './components/views/transactions_view';
import StatsView from './components/views/stats_view';
import AdvisorView from './components/views/advisor_view';
import BottomNavigation from './components/common/bottom_navigation';
import HeaderComponent from './components/common/header_component';
import ConnectBankModal from './components/accounts/connect_bank_modal';

// Main app content component
const AppContent = () => {
  const { user, loading, logout, isAuthenticated } = useBackendAuth();
  const [currentView, setCurrentView] = useState('home');
  const [showConnectBankModal, setShowConnectBankModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show authentication screens if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        {authMode === 'login' ? (
          <BackendLoginScreen onSwitchToRegister={() => setAuthMode('register')} />
        ) : (
          <BackendRegisterScreen onSwitchToLogin={() => setAuthMode('login')} />
        )}
      </div>
    );
  }

  // Main app interface for authenticated users
  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView onConnectBank={() => setShowConnectBankModal(true)} />;
      case 'transactions':
        return <TransactionsView />;
      case 'stats':
        return <StatsView />;
      case 'advisor':
        return <AdvisorView />;
      default:
        return <HomeView onConnectBank={() => setShowConnectBankModal(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <HeaderComponent 
        user={user} 
        onLogout={logout}
        onConnectBank={() => setShowConnectBankModal(true)}
      />
      
      {/* Main Content */}
      <main className="pb-20">
        {renderCurrentView()}
      </main>
      
      {/* Bottom Navigation */}
      <BottomNavigation 
        currentView={currentView} 
        onViewChange={setCurrentView} 
      />
      
      {/* Connect Bank Modal */}
      <ConnectBankModal
        isOpen={showConnectBankModal}
        onClose={() => setShowConnectBankModal(false)}
        onSuccess={() => {
          setShowConnectBankModal(false);
          // Optionally refresh data or show success message
        }}
      />
    </div>
  );
};

// Main App component with providers
const App = () => {
  return (
    <BackendAuthProvider>
      <AppContent />
    </BackendAuthProvider>
  );
};

export default App;