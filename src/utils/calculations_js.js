// src/utils/calculations.js

export const calculateMetrics = (transactions) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
  });

  const income = currentMonthTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const expenses = Math.abs(currentMonthTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
  const balance = transactions.reduce((sum, t) => sum + t.amount, 0);

  // Calculate percentage changes (mock data for demo)
  const incomeChange = 24;
  const expenseChange = -12;

  return { balance, income, expenses, incomeChange, expenseChange };
};

export const getCategoryInfo = (categories, categoryId) => {
  // First try to find by id (for frontend categories)
  const categoryById = categories.find(cat => cat.id === categoryId);
  if (categoryById) {
    return categoryById;
  }
  
  // If not found by id, try to find by name (for backend categories)
  const categoryByName = categories.find(cat => cat.name === categoryId);
  if (categoryByName) {
    return categoryByName;
  }
  
  // If still not found, create a default category based on the categoryId string
  const categoryMap = {
    'FOOD_AND_DRINK': { name: 'Food & Drink', icon: '🍽️', color: 'bg-orange-100', type: 'expense' },
    'TRANSPORT': { name: 'Transport', icon: '🚗', color: 'bg-blue-100', type: 'expense' },
    'SHOPPING': { name: 'Shopping', icon: '🛍️', color: 'bg-purple-100', type: 'expense' },
    'ENTERTAINMENT': { name: 'Entertainment', icon: '🎬', color: 'bg-pink-100', type: 'expense' },
    'HEALTH': { name: 'Health', icon: '🏥', color: 'bg-red-100', type: 'expense' },
    'EDUCATION': { name: 'Education', icon: '📚', color: 'bg-indigo-100', type: 'expense' },
    'INCOME': { name: 'Income', icon: '💰', color: 'bg-green-100', type: 'income' },
    'TRANSFER': { name: 'Transfer', icon: '🔄', color: 'bg-gray-100', type: 'transfer' },
    'UTILITIES': { name: 'Utilities', icon: '⚡', color: 'bg-yellow-100', type: 'expense' },
    'RENT': { name: 'Rent', icon: '🏠', color: 'bg-teal-100', type: 'expense' }
  };
  
  return categoryMap[categoryId] || { 
    name: categoryId || 'Other', 
    icon: '❓', 
    color: 'bg-gray-100',
    type: 'expense' 
  };
};

export const filterTransactions = (transactions, searchTerm, filterCategory, categories) => {
  return transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const categoryInfo = getCategoryInfo(categories, transaction.category);
    const matchesCategory = filterCategory === 'all' || 
                           categoryInfo.type === filterCategory ||
                           transaction.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const calculateCategorySpending = (transactions, categories) => {
  // Create a map of all unique categories from transactions
  const uniqueCategories = [...new Set(transactions.map(t => t.category))];
  
  const totalExpenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
  
  return uniqueCategories.map(categoryName => {
    const categoryTransactions = transactions.filter(t => t.category === categoryName && t.amount < 0);
    const categoryTotal = Math.abs(categoryTransactions.reduce((sum, t) => sum + t.amount, 0));
    const percentage = totalExpenses > 0 ? (categoryTotal / totalExpenses * 100) : 0;
    
    const categoryInfo = getCategoryInfo(categories, categoryName);
    
    return {
      id: categoryName,
      name: categoryInfo.name,
      icon: categoryInfo.icon,
      color: categoryInfo.color,
      type: categoryInfo.type,
      total: categoryTotal,
      percentage: percentage.toFixed(1),
      transactionCount: categoryTransactions.length
    };
  }).filter(cat => cat.total > 0).sort((a, b) => b.total - a.total);
};

// Get time-based greeting
export const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  
  if (hour < 12) {
    return 'Good Morning';
  } else if (hour < 17) {
    return 'Good Afternoon';
  } else {
    return 'Good Evening';
  }
};

// Get user-friendly display name
export const getUserDisplayName = (userName) => {
  if (!userName) return 'User';
  
  // If it's a full name, get the first name
  const nameParts = userName.trim().split(' ');
  return nameParts[0];
};

// Get personalized greeting with user name and time (separate parts)
export const getPersonalizedGreetingParts = (userName) => {
  const timeGreeting = getTimeBasedGreeting();
  const displayName = getUserDisplayName(userName);
  
  return {
    greeting: timeGreeting,
    name: displayName
  };
};

// Get personalized greeting with user name and time (combined - for backward compatibility)
export const getPersonalizedGreeting = (userName) => {
  const timeGreeting = getTimeBasedGreeting();
  const displayName = getUserDisplayName(userName);
  
  return `${timeGreeting}, ${displayName}!`;
};