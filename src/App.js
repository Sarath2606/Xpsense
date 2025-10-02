// src/App.js
import React, { useState } from 'react';
import { useAuth } from './hooks/use_auth_hook';
import { useBackendTransactions } from './hooks/use_backend_transactions';
import AuthModal from './components/auth/auth_modal';
import HomeView from './components/views/home_view';
import TransactionsView from './components/views/transactions_view';
import StatsView from './components/views/stats_view';
import AdvisorView from './components/views/advisor_view';
import SplitwiseViewPage from './components/views/splitwise_view';
import ConnectBankModal from './components/accounts/connect_bank_modal';
import InviteAcceptPage from './components/splitwise/InviteAcceptPage';
import { useBudget } from './hooks/use_budget_hook';
import apiService from './config/api';

// Main app content component
const AppContent = () => {
  const { user, loading, signOutUser, isAuthenticated, signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, error, clearError } = useAuth();
  const [currentView, setCurrentView] = useState('home');
  const [showConnectBankModal, setShowConnectBankModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Use real transaction data
  const {
    transactions,
    loading: transactionsLoading,
    error: transactionsError,
    stats,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    filterTransactions
  } = useBackendTransactions();

  // Budgets & goals hook (uses transactions for income-based allocations)
  const budgetHook = useBudget(transactions);

  // Filter transactions based on search and category
  const filteredTransactions = filterTransactions({
    search: searchTerm,
    type: filterCategory !== 'all' ? filterCategory : undefined
  });

  // Handle transaction actions
  const handleEditTransaction = (transactionId, updates) => {
    updateTransaction(transactionId, updates);
  };

  const handleDeleteTransaction = (transactionId) => {
    deleteTransaction(transactionId);
  };

  // Close auth modal when user becomes authenticated
  React.useEffect(() => {
    if (isAuthenticated && showAuthModal) {
      setShowAuthModal(false);
    }
  }, [isAuthenticated, showAuthModal]);

  // Handle pending invitation after login
  React.useEffect(() => {
    const handlePendingInvitation = async () => {
      if (isAuthenticated && user) {
        const pendingToken = localStorage.getItem('pendingInviteToken');
        if (pendingToken) {
          try {
            console.log('🎯 Processing pending invitation after login:', pendingToken);
            const response = await apiService.splitwise.invites.acceptInvite(pendingToken);
            console.log('✅ Pending invitation accepted:', response);
            
            // Clear the pending token
            localStorage.removeItem('pendingInviteToken');
            
            // Show success message and redirect to Splitwise
            alert(`Successfully joined "${response.group.name}"!`);
            setCurrentView('splitwise');
          } catch (error) {
            console.error('❌ Failed to accept pending invitation:', error);
            localStorage.removeItem('pendingInviteToken');
            
            let errorMessage = 'Failed to accept invitation: ' + (error.message || 'Invalid or expired invitation');
            if (error.message && error.message.includes('Email mismatch')) {
              errorMessage = 'This invitation was sent to a different email address. Please log in with the email address that received the invitation.';
            }
            
            alert(errorMessage);
          }
        }
      }
    };

    handlePendingInvitation();
  }, [isAuthenticated, user]);

  // Handle legacy invite URLs (without hash) by redirecting to hash-based URLs
  React.useEffect(() => {
    const pathname = window.location.pathname;
    const search = window.location.search;
    
    // If user clicked an old-style invite link (path-based instead of hash-based)
    if (pathname.includes('/splitwise/invite/accept') && search.includes('token=')) {
      const token = new URLSearchParams(search).get('token');
      if (token) {
        // Redirect to hash-based URL
        const newUrl = `/#splitwise/invite/accept?token=${token}`;
        console.log('🔄 Redirecting legacy invite URL to:', newUrl);
        window.location.href = newUrl;
        return;
      }
    }
  }, []);

  // Check if we're on an invitation acceptance page
  const isInviteAcceptPage = window.location.hash.includes('splitwise/invite/accept') ||
                            window.location.hash.includes('token=');

  // Debug URL detection
  console.log('🔍 URL Detection Debug:', {
    pathname: window.location.pathname,
    hash: window.location.hash,
    search: window.location.search,
    fullUrl: window.location.href,
    isInviteAcceptPage
  });

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

  // Show invitation acceptance page if on invite URL
  if (isInviteAcceptPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <InviteAcceptPage 
          onBack={() => setCurrentView('splitwise')}
          onInviteAccepted={(response) => {
            console.log('Invitation accepted:', response);
            setCurrentView('splitwise');
          }}
        />
        {/* Show auth modal if not authenticated and on invite page */}
        {!isAuthenticated && (
          <AuthModal
            isOpen={true}
            onClose={() => {}} // Prevent closing - user must authenticate to accept invite
            onGoogleSignIn={signInWithGoogle}
            onEmailSignIn={signInWithEmail}
            onEmailSignUp={signUpWithEmail}
            onResetPassword={resetPassword}
            loading={loading}
            error={error}
            isAuthenticated={isAuthenticated}
          />
        )}
      </div>
    );
  }

  // Show authentication modal if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AuthModal
          isOpen={true}
          onClose={() => {}} // Prevent closing - user must authenticate
          onGoogleSignIn={signInWithGoogle}
          onEmailSignIn={signInWithEmail}
          onEmailSignUp={signUpWithEmail}
          onResetPassword={resetPassword}
          loading={loading}
          error={error}
          isAuthenticated={isAuthenticated}
        />
      </div>
    );
  }

  // Main app interface for authenticated users
  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return (
          <HomeView 
            onConnectBank={() => setShowConnectBankModal(true)}
            currentView={currentView}
            setCurrentView={setCurrentView}
            setShowAddTransaction={() => {}}
            transactions={filteredTransactions}
            categories={[
              { id: 1, name: 'Salary', type: 'income', icon: '💰', color: 'bg-green-100' },
              { id: 2, name: 'Food', type: 'expense', icon: '🍔', color: 'bg-red-100' },
              { id: 3, name: 'Transport', type: 'expense', icon: '🚗', color: 'bg-blue-100' },
              { id: 4, name: 'Entertainment', type: 'expense', icon: '🎬', color: 'bg-purple-100' },
              { id: 5, name: 'Shopping', type: 'expense', icon: '🛍️', color: 'bg-pink-100' },
              { id: 6, name: 'Bills', type: 'expense', icon: '⚡', color: 'bg-yellow-100' },
              { id: 7, name: 'Health', type: 'expense', icon: '🏥', color: 'bg-orange-100' },
              { id: 8, name: 'Investment', type: 'income', icon: '📈', color: 'bg-green-100' }
            ]}
            userName={user?.displayName || user?.email}
            userPhotoURL={user?.photoURL}
            onSignOut={signOutUser}
            onSignIn={() => setShowAuthModal(true)}
            authLoading={loading}
            authError={error}
            isAuthenticated={isAuthenticated}
            user={user}
          />
        );
      case 'transactions':
        return (
          <TransactionsView 
            currentView={currentView}
            setCurrentView={setCurrentView}
            setShowAddTransaction={() => {}}
            userName={user?.displayName || user?.email}
            userPhotoURL={user?.photoURL}
            onSignOut={signOutUser}
            onSignIn={() => setShowAuthModal(true)}
            authLoading={loading}
            authError={error}
            isAuthenticated={isAuthenticated}
            user={user}
          />
        );
      case 'stats':
        return (
          <StatsView 
            currentView={currentView}
            setCurrentView={setCurrentView}
            setShowAddTransaction={() => {}}
            transactions={filteredTransactions}
            categories={[
              { id: 1, name: 'Salary', type: 'income', icon: '💰', color: 'bg-green-100' },
              { id: 2, name: 'Food', type: 'expense', icon: '🍔', color: 'bg-red-100' },
              { id: 3, name: 'Transport', type: 'expense', icon: '🚗', color: 'bg-blue-100' },
              { id: 4, name: 'Entertainment', type: 'expense', icon: '🎬', color: 'bg-purple-100' },
              { id: 5, name: 'Shopping', type: 'expense', icon: '🛍️', color: 'bg-pink-100' },
              { id: 6, name: 'Bills', type: 'expense', icon: '⚡', color: 'bg-yellow-100' },
              { id: 7, name: 'Health', type: 'expense', icon: '🏥', color: 'bg-orange-100' },
              { id: 8, name: 'Investment', type: 'income', icon: '📈', color: 'bg-green-100' }
            ]}
            metrics={stats}
            budgetHook={budgetHook}
            userName={user?.displayName || user?.email}
            userPhotoURL={user?.photoURL}
            onSignOut={signOutUser}
            onSignIn={() => setShowAuthModal(true)}
            authLoading={loading}
            authError={error}
            isAuthenticated={isAuthenticated}
            user={user}
          />
        );
      case 'advisor':
        return (
          <AdvisorView 
            currentView={currentView}
            setCurrentView={setCurrentView}
            setShowAddTransaction={() => {}}
            userName={user?.displayName || user?.email}
            userPhotoURL={user?.photoURL}
            onSignOut={signOutUser}
            onSignIn={() => setShowAuthModal(true)}
            authLoading={loading}
            authError={error}
            isAuthenticated={isAuthenticated}
            user={user}
          />
        );
      case 'splitwise':
        return (
          <SplitwiseViewPage 
            currentView={currentView}
            setCurrentView={setCurrentView}
            userName={user?.displayName || user?.email}
            userPhotoURL={user?.photoURL}
            onSignOut={signOutUser}
            onSignIn={() => setShowAuthModal(true)}
            authLoading={loading}
            authError={error}
            isAuthenticated={isAuthenticated}
            user={user}
          />
        );
      default:
        return (
          <HomeView 
            onConnectBank={() => setShowConnectBankModal(true)}
            currentView={currentView}
            setCurrentView={setCurrentView}
            setShowAddTransaction={() => {}}
            transactions={filteredTransactions}
            categories={[
              { id: 1, name: 'Salary', type: 'income', icon: '💰', color: 'bg-green-100' },
              { id: 2, name: 'Food', type: 'expense', icon: '🍔', color: 'bg-red-100' },
              { id: 3, name: 'Transport', type: 'expense', icon: '🚗', color: 'bg-blue-100' },
              { id: 4, name: 'Entertainment', type: 'expense', icon: '🎬', color: 'bg-purple-100' },
              { id: 5, name: 'Shopping', type: 'expense', icon: '🛍️', color: 'bg-pink-100' },
              { id: 6, name: 'Bills', type: 'expense', icon: '⚡', color: 'bg-yellow-100' },
              { id: 7, name: 'Health', type: 'expense', icon: '🏥', color: 'bg-orange-100' },
              { id: 8, name: 'Investment', type: 'income', icon: '📈', color: 'bg-green-100' }
            ]}
            userName={user?.displayName || user?.email}
            userPhotoURL={user?.photoURL}
            onSignOut={signOutUser}
            onSignIn={() => setShowAuthModal(true)}
            authLoading={loading}
            authError={error}
            isAuthenticated={isAuthenticated}
            user={user}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main>
        {renderCurrentView()}
      </main>
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onGoogleSignIn={signInWithGoogle}
        onEmailSignIn={signInWithEmail}
        onEmailSignUp={signUpWithEmail}
        onResetPassword={resetPassword}
        loading={loading}
        error={error}
        isAuthenticated={isAuthenticated}
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

// Main App component
const App = () => {
  return <AppContent />;
};

export default App;