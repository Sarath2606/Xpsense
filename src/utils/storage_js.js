// src/utils/storage.js
import { STORAGE_KEYS, INITIAL_TRANSACTIONS } from './constants_js';

export const loadTransactions = () => {
  try {
    const savedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (savedTransactions) {
      return JSON.parse(savedTransactions);
    }
    // Return initial demo data if no saved data exists
    return INITIAL_TRANSACTIONS;
  } catch (error) {
    console.error('Error loading transactions:', error);
    return INITIAL_TRANSACTIONS;
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