// src/utils/storage.js
import { STORAGE_KEYS, INITIAL_TRANSACTIONS } from './constants_js';

export const loadTransactions = () => {
  try {
    const savedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (savedTransactions) {
      return JSON.parse(savedTransactions);
    }
    // Return empty list if no saved data exists (disable demo data)
    return [];
  } catch (error) {
    console.error('Error loading transactions:', error);
    return [];
  }
};

export const saveTransactions = (transactions) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (error) {
    console.error('Error saving transactions:', error);
  }
};

export const clearTransactions = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
  } catch (error) {
    console.error('Error clearing transactions:', error);
  }
};

export const exportTransactions = () => {
  const transactions = loadTransactions();
  const dataStr = JSON.stringify(transactions, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `transactions-${new Date().toISOString().split('T')[0]}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

// Budget storage functions
export const loadBudgets = () => {
  try {
    const savedBudgets = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    if (savedBudgets) {
      return JSON.parse(savedBudgets);
    }
    // Return empty array if no saved budgets exist
    return [];
  } catch (error) {
    console.error('Error loading budgets:', error);
    return [];
  }
};

export const saveBudgets = (budgets) => {
  try {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  } catch (error) {
    console.error('Error saving budgets:', error);
  }
};

export const clearBudgets = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.BUDGETS);
  } catch (error) {
    console.error('Error clearing budgets:', error);
  }
};

// Goals storage functions
export const loadGoals = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Error loading goals:', e);
    return [];
  }
};

export const saveGoals = (goals) => {
  try {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  } catch (e) {
    console.error('Error saving goals:', e);
  }
};

export const clearGoals = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.GOALS);
  } catch (e) {
    console.error('Error clearing goals:', e);
  }
};