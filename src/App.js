// src/App.js
import React, { useState } from 'react';
import { useTransactions } from './hooks/use_transactions_hook';
import HomeView from './components/views/home_view';
import TransactionsView from './components/views/transactions_view';
import StatsView from './components/views/stats_view';
import TransactionForm from './components/transactions/transaction_form';
import './index.css';

const App = () => {
  const [currentView, setCurrentView] = useState('home');
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    categories,
    filteredTransactions,
    metrics
  } = useTransactions(searchTerm, filterCategory);

  const handleAddTransaction = (transactionData) => {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, transactionData);
      setEditingTransaction(null);
    } else {
      addTransaction(transactionData);
    }
    setShowAddTransaction(false);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setShowAddTransaction(true);
  };

  const handleCloseForm = () => {
    setShowAddTransaction(false);
    setEditingTransaction(null);
  };

  const commonProps = {
    currentView,
    setCurrentView,
    setShowAddTransaction,
    categories,
    metrics
  };

  return (
    <div className="app">
      {currentView === 'home' && (
        <HomeView
          {...commonProps}
          transactions={filteredTransactions.slice(0, 3)}
          onEditTransaction={handleEditTransaction}
          onDeleteTransaction={deleteTransaction}
        />
      )}

      {currentView === 'transactions' && (
        <TransactionsView
          {...commonProps}
          transactions={filteredTransactions}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          onEditTransaction={handleEditTransaction}
          onDeleteTransaction={deleteTransaction}
        />
      )}

      {currentView === 'stats' && (
        <StatsView
          {...commonProps}
          transactions={transactions}
        />
      )}

      {showAddTransaction && (
        <TransactionForm
          categories={categories}
          editingTransaction={editingTransaction}
          onSubmit={handleAddTransaction}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default App;