// src/hooks/useTransactions.js
import { useState, useEffect } from 'react';
import { CATEGORIES } from '../utils/constants_js';
import { loadTransactions, saveTransactions } from '../utils/storage_js';
import { calculateMetrics, filterTransactions, getCategoryInfo } from '../utils/calculations_js';

export const useTransactions = (searchTerm = '', filterCategory = 'all') => {
  const [transactions, setTransactions] = useState([]);
  const categories = CATEGORIES;

  // Load transactions on mount
  useEffect(() => {
    const savedTransactions = loadTransactions();
    setTransactions(savedTransactions);
  }, []);

  // Save transactions whenever they change
  useEffect(() => {
    if (transactions.length > 0) {
      saveTransactions(transactions);
    }
  }, [transactions]);

  // Add new transaction
  const addTransaction = (transactionData) => {
    const category = getCategoryInfo(categories, parseInt(transactionData.categoryId));
    const amount = parseFloat(transactionData.amount);
    const finalAmount = category.type === 'expense' ? -Math.abs(amount) : Math.abs(amount);

    const newTransaction = {
      id: Date.now(),
      name: transactionData.name,
      amount: finalAmount,
      categoryId: parseInt(transactionData.categoryId),
      date: transactionData.date,
      description: transactionData.description
    };

    setTransactions(prev => [...prev, newTransaction]);
  };

  // Update existing transaction
  const updateTransaction = (id, transactionData) => {
    const category = getCategoryInfo(categories, parseInt(transactionData.categoryId));
    const amount = parseFloat(transactionData.amount);
    const finalAmount = category.type === 'expense' ? -Math.abs(amount) : Math.abs(amount);

    const updatedTransaction = {
      id,
      name: transactionData.name,
      amount: finalAmount,
      categoryId: parseInt(transactionData.categoryId),
      date: transactionData.date,
      description: transactionData.description
    };

    setTransactions(prev => 
      prev.map(t => t.id === id ? updatedTransaction : t)
    );
  };

  // Delete transaction
  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Get filtered transactions
  const filteredTransactions = filterTransactions(transactions, searchTerm, filterCategory, categories);

  // Calculate metrics
  const metrics = calculateMetrics(transactions);

  return {
    transactions,
    categories,
    filteredTransactions,
    metrics,
    addTransaction,
    updateTransaction,
    deleteTransaction
  };
};