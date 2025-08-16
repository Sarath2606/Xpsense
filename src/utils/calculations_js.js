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
  return categories.find(cat => cat.id === categoryId) || { 
    name: 'Other', 
    icon: '❓', 
    color: 'bg-gray-100',
    type: 'expense' 
  };
};

export const filterTransactions = (transactions, searchTerm, filterCategory, categories) => {
  return transactions.filter(transaction => {
    const matchesSearch = transaction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const categoryInfo = getCategoryInfo(categories, transaction.categoryId);
    const matchesCategory = filterCategory === 'all' || 
                           categoryInfo.type === filterCategory ||
                           transaction.categoryId.toString() === filterCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const calculateCategorySpending = (transactions, categories) => {
  const expenseCategories = categories.filter(cat => cat.type === 'expense');
  const totalExpenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
  
  return expenseCategories.map(category => {
    const categoryTransactions = transactions.filter(t => t.categoryId === category.id && t.amount < 0);
    const categoryTotal = Math.abs(categoryTransactions.reduce((sum, t) => sum + t.amount, 0));
    const percentage = totalExpenses > 0 ? (categoryTotal / totalExpenses * 100) : 0;
    
    return {
      ...category,
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