// src/utils/constants.js

export const CATEGORIES = [
  { id: 1, name: 'Salary', type: 'income', icon: '💰', color: 'bg-green-100' },
  { id: 2, name: 'Food', type: 'expense', icon: '🍔', color: 'bg-red-100' },
  { id: 3, name: 'Transport', type: 'expense', icon: '🚗', color: 'bg-blue-100' },
  { id: 4, name: 'Entertainment', type: 'expense', icon: '🎬', color: 'bg-purple-100' },
  { id: 5, name: 'Shopping', type: 'expense', icon: '🛍️', color: 'bg-pink-100' },
  { id: 6, name: 'Bills', type: 'expense', icon: '⚡', color: 'bg-yellow-100' },
  { id: 7, name: 'Health', type: 'expense', icon: '🏥', color: 'bg-orange-100' },
  { id: 8, name: 'Investment', type: 'income', icon: '📈', color: 'bg-green-100' }
];

export const INITIAL_TRANSACTIONS = [
  {
    id: 1,
    name: 'Dribbble Pro',
    date: '2024-01-18',
    amount: -145.00,
    categoryId: 4,
    description: 'Monthly subscription'
  },
  {
    id: 2,
    name: 'Grocery Shopping',
    date: '2024-01-17',
    amount: -85.50,
    categoryId: 2,
    description: 'Weekly groceries'
  },
  {
    id: 3,
    name: 'Salary',
    date: '2024-01-15',
    amount: 2500.00,
    categoryId: 1,
    description: 'Monthly salary'
  },
  {
    id: 4,
    name: 'Gas Bill',
    date: '2024-01-14',
    amount: -75.00,
    categoryId: 6,
    description: 'Monthly gas bill'
  }
];

export const STORAGE_KEYS = {
  TRANSACTIONS: 'transactions'
};