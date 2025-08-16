// src/components/views/HomeView.js
import React, { useState } from 'react';
import { useBackendAccounts } from '../../hooks/use_backend_accounts';
import { useBackendTransactions } from '../../hooks/use_backend_transactions';
import BalanceCard from '../ui/balance_card';
import TransactionCard from '../transactions/transaction_card';
import ConnectBankModal from '../accounts/connect_bank_modal';

const HomeView = ({ onConnectBank }) => {
  const [showConnectBankModal, setShowConnectBankModal] = useState(false);
  
  const { 
    accounts, 
    loading: accountsLoading, 
    error: accountsError,
    balanceSummary,
    syncAllAccounts 
  } = useBackendAccounts();
  
  const { 
    transactions, 
    loading: transactionsLoading,
    error: transactionsError,
    stats,
    getRecentTransactions 
  } = useBackendTransactions();

  const recentTransactions = getRecentTransactions(5);

  const handleConnectBank = () => {
    if (onConnectBank) {
      onConnectBank();
    } else {
      setShowConnectBankModal(true);
    }
  };

  const handleSyncAccounts = async () => {
    try {
      await syncAllAccounts();
    } catch (error) {
      console.error('Failed to sync accounts:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back!
          </h1>
          <p className="text-gray-600">
            Here's your financial overview
          </p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <BalanceCard
            title="Total Balance"
            amount={balanceSummary?.balanceSummary?.USD || 0}
            currency="USD"
            icon="wallet"
            trend="up"
            trendValue="+2.5%"
            loading={accountsLoading}
          />
          
          <BalanceCard
            title="Monthly Income"
            amount={stats?.totalIncome || 0}
            currency="USD"
            icon="income"
            trend="up"
            trendValue="+12.3%"
            loading={transactionsLoading}
          />
          
          <BalanceCard
            title="Monthly Expenses"
            amount={stats?.totalExpenses || 0}
            currency="USD"
            trend="down"
            trendValue="-5.2%"
            loading={transactionsLoading}
          />
        </div>

        {/* Connected Accounts Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Connected Accounts
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={handleSyncAccounts}
                disabled={accountsLoading}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors disabled:opacity-50"
              >
                {accountsLoading ? 'Syncing...' : 'Sync'}
              </button>
              <button
                onClick={handleConnectBank}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Connect Bank
              </button>
            </div>
          </div>

          {accountsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading accounts...</p>
            </div>
          ) : accountsError ? (
            <div className="text-center py-8">
              <p className="text-red-600">Error loading accounts: {accountsError}</p>
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts connected</h3>
              <p className="text-gray-500 mb-4">
                Connect your bank account to automatically import transactions and track your spending.
              </p>
              <button
                onClick={handleConnectBank}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Connect Your First Account
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{account.accountName}</h3>
                      <p className="text-sm text-gray-500">{account.bankName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${Number(account.balance).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">{account.currency}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Transactions
            </h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </button>
          </div>

          {transactionsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading transactions...</p>
            </div>
          ) : transactionsError ? (
            <div className="text-center py-8">
              <p className="text-red-600">Error loading transactions: {transactionsError}</p>
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
              <p className="text-gray-500">
                Connect your bank account or add transactions manually to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  showAccount={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Connect Bank Modal */}
      <ConnectBankModal
        isOpen={showConnectBankModal}
        onClose={() => setShowConnectBankModal(false)}
        onSuccess={() => {
          setShowConnectBankModal(false);
          // Optionally refresh data
        }}
      />
    </div>
  );
};

export default HomeView;