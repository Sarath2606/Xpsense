// src/hooks/use_budget_hook.js
import { useState, useEffect } from 'react';
import { loadBudgets, saveBudgets, loadGoals, saveGoals } from '../utils/storage_js';
import { CATEGORIES } from '../utils/constants_js';

export const useBudget = (transactions = []) => {
  const [budgets, setBudgets] = useState([]);
  const [budgetPeriod, setBudgetPeriod] = useState('monthly'); // monthly, weekly, yearly
  const [goals, setGoals] = useState([]);
  const categories = CATEGORIES;

  // Load data on mount
  useEffect(() => {
    setBudgets(loadBudgets());
    setGoals(loadGoals());
  }, []);

  // Persist
  useEffect(() => {
    saveBudgets(budgets);
  }, [budgets]);

  useEffect(() => {
    saveGoals(goals);
  }, [goals]);

  // Budgets CRUD
  const addBudget = (budgetData) => {
    const newBudget = {
      id: Date.now(),
      categoryId: parseInt(budgetData.categoryId),
      amount: parseFloat(budgetData.amount),
      period: budgetData.period || 'monthly',
      startDate: budgetData.startDate || new Date().toISOString().split('T')[0],
      endDate: budgetData.endDate,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setBudgets(prev => [...prev, newBudget]);
  };

  const updateBudget = (id, budgetData) => {
    const updatedBudget = { ...budgetData, id, updatedAt: new Date().toISOString() };
    setBudgets(prev => prev.map(b => (b.id === id ? updatedBudget : b)));
  };

  const deleteBudget = (id) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  const toggleBudgetStatus = (id) => {
    setBudgets(prev => prev.map(b => (b.id === id ? { ...b, isActive: !b.isActive } : b)));
  };

  // Goals CRUD
  const addGoal = ({ name, amount, deadline, savingsPercent = 0, autoAllocate = false }) => {
    const parsedAmount = parseFloat(amount) || 0;
    const newGoal = {
      id: Date.now(),
      name: name || 'New Goal',
      amount: parsedAmount,
      deadline: deadline || new Date().toISOString().split('T')[0], // YYYY-MM-DD
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      saved: 0,
      savingsPercent: Math.max(0, Math.min(100, parseFloat(savingsPercent) || 0)),
      autoAllocate: Boolean(autoAllocate),
      lastAllocatedPeriod: null,
      allocationHistory: []
    };
    setGoals(prev => [...prev, newGoal]);
  };

  const addSavingsToGoal = (goalId, amount) => {
    const parsedAmount = parseFloat(amount) || 0;
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        const newSaved = Math.min(goal.amount, (goal.saved || 0) + parsedAmount);
        return { ...goal, saved: newSaved, updatedAt: new Date().toISOString() };
      }
      return goal;
    }));
  };

  const updateGoal = (id, data) => {
    setGoals(prev => prev.map(g => (g.id === id ? { ...g, ...data, updatedAt: new Date().toISOString() } : g)));
  };

  const deleteGoal = (id) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const setGoalSavingsPercent = (id, percent) => {
    const normalized = Math.max(0, Math.min(100, parseFloat(percent) || 0));
    updateGoal(id, { savingsPercent: normalized });
  };

  const setGoalAutoAllocate = (id, enabled) => {
    updateGoal(id, { autoAllocate: Boolean(enabled) });
  };

  const markGoalAchieved = (id) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== id) return g;
      return {
        ...g,
        saved: g.amount,
        achievedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }));
  };

  // Calculations
  const calculateBudgetProgress = (budget, periodStart, periodEnd) => {
    const periodTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const start = new Date(periodStart);
      const end = new Date(periodEnd);
      return transactionDate >= start && transactionDate <= end && t.categoryId === budget.categoryId;
    });

    const totalSpent = Math.abs(periodTransactions.reduce((sum, t) => sum + Math.min(0, t.amount), 0));
    const progress = (totalSpent / budget.amount) * 100;
    const remaining = budget.amount - totalSpent;
    const isOverBudget = totalSpent > budget.amount;

    return { totalSpent, remaining, progress: Math.min(progress, 100), isOverBudget, transactionCount: periodTransactions.length };
  };

  const getCurrentPeriodDates = (period = 'monthly') => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();

    let startDate, endDate;
    switch (period) {
      case 'weekly': {
        const weekStart = new Date(now);
        weekStart.setDate(day - now.getDay());
        startDate = weekStart.toISOString().split('T')[0];
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        endDate = weekEnd.toISOString().split('T')[0];
        break;
      }
      case 'yearly':
        startDate = `${year}-01-01`;
        endDate = `${year}-12-31`;
        break;
      case 'monthly':
      default: {
        startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month + 1, 0).getDate();
        endDate = `${year}-${String(month + 1).padStart(2, '0')}-${lastDay}`;
        break;
      }
    }
    return { startDate, endDate };
  };

  const getBudgetStatus = () => {
    const { startDate, endDate } = getCurrentPeriodDates(budgetPeriod);
    const activeBudgets = budgets.filter(b => b.isActive);
    return activeBudgets.map(budget => {
      const progress = calculateBudgetProgress(budget, startDate, endDate);
      const category = categories.find(c => c.id === budget.categoryId);
      return { ...budget, category, progress, periodDates: { startDate, endDate } };
    });
  };

  const getBudgetAlerts = () => {
    const budgetStatus = getBudgetStatus();
    const alerts = [];
    budgetStatus.forEach(budget => {
      const { progress, isOverBudget, remaining } = budget.progress;
      if (isOverBudget) {
        alerts.push({ type: 'over_budget', severity: 'high', message: `You've exceeded your ${budget.category.name} budget by $${Math.abs(remaining).toFixed(2)}`, budget });
      } else if (progress >= 80) {
        alerts.push({ type: 'near_limit', severity: 'medium', message: `You're close to your ${budget.category.name} budget limit (${progress.toFixed(1)}% used)`, budget });
      }
    });
    return alerts;
  };

  const getBudgetSummary = () => {
    const budgetStatus = getBudgetStatus();
    const totalBudget = budgetStatus.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = budgetStatus.reduce((sum, b) => sum + b.progress.totalSpent, 0);
    const totalRemaining = totalBudget - totalSpent;
    const overallProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    return { totalBudget, totalSpent, totalRemaining, overallProgress, budgetCount: budgetStatus.length, overBudgetCount: budgetStatus.filter(b => b.progress.isOverBudget).length };
  };

  const hasBudgetForCategory = (categoryId) => budgets.some(b => b.categoryId === categoryId && b.isActive);
  const getBudgetForCategory = (categoryId) => budgets.find(b => b.categoryId === categoryId && b.isActive);

  // Goal helpers
  const daysBetween = (startISO, endISO) => {
    const s = new Date(startISO);
    const e = new Date(endISO);
    return Math.max(0, Math.ceil((e - s) / (1000 * 60 * 60 * 24)));
  };

  const getGoals = () => goals;

  const getGoalProgress = (goal) => {
    if (!goal) return { saved: 0, remaining: 0, percent: 0, totalDays: 0, daysLeft: 0, requiredPerDay: 0, requiredPerWeek: 0, neededPerDayNow: 0 };
    
    const todayISO = new Date().toISOString().split('T')[0];
    const totalDays = daysBetween(goal.createdAt?.split('T')[0] || todayISO, goal.deadline || todayISO);
    const daysLeft = daysBetween(todayISO, goal.deadline || todayISO);
    const saved = goal.saved || 0;
    const remaining = Math.max(0, (goal.amount || 0) - saved);
    const percent = (goal.amount || 0) > 0 ? Math.min(100, (saved / goal.amount) * 100) : 0;
    const requiredPerDay = totalDays > 0 ? (goal.amount || 0) / totalDays : (goal.amount || 0);
    const requiredPerWeek = requiredPerDay * 7;
    const neededPerDayNow = daysLeft > 0 ? remaining / daysLeft : remaining;

    return { saved, remaining, percent, totalDays, daysLeft, requiredPerDay, requiredPerWeek, neededPerDayNow };
  };

  // Allocation helpers
  const getPeriodIncome = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return transactions
      .filter(t => t.amount > 0 && new Date(t.date) >= start && new Date(t.date) <= end)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getEstimatedAllocation = (goal) => {
    if (!goal) return 0;
    
    const { startDate, endDate } = getCurrentPeriodDates(budgetPeriod);
    const periodIncome = getPeriodIncome(startDate, endDate);
    const remaining = Math.max(0, (goal.amount || 0) - (goal.saved || 0));
    const estimate = (periodIncome * ((goal.savingsPercent || 0) / 100));
    return Math.max(0, Math.min(remaining, estimate));
  };

  const allocateAutoSavingsForCurrentPeriod = () => {
    const { startDate, endDate } = getCurrentPeriodDates(budgetPeriod);
    const periodIncome = getPeriodIncome(startDate, endDate);
    if (periodIncome <= 0) return; // nothing to allocate

    setGoals(prev => prev.map(g => {
      if (!g.autoAllocate || (g.savingsPercent || 0) <= 0) return g;
      if (g.lastAllocatedPeriod === startDate) return g; // already allocated this period
      const remaining = Math.max(0, (g.amount || 0) - (g.saved || 0));
      if (remaining <= 0) return g;
      const allocation = Math.max(0, Math.min(remaining, periodIncome * ((g.savingsPercent || 0) / 100)));
      if (allocation <= 0) return g;
      return {
        ...g,
        saved: (g.saved || 0) + allocation,
        lastAllocatedPeriod: startDate,
        updatedAt: new Date().toISOString(),
        allocationHistory: [
          ...((g.allocationHistory) || []),
          { date: new Date().toISOString(), amount: allocation, periodStart: startDate, periodEnd: endDate }
        ]
      };
    }));
  };

  return {
    // budgets
    budgets,
    budgetPeriod,
    setBudgetPeriod,
    addBudget,
    updateBudget,
    deleteBudget,
    toggleBudgetStatus,
    getBudgetStatus,
    getBudgetAlerts,
    getBudgetSummary,
    hasBudgetForCategory,
    getBudgetForCategory,
    getCurrentPeriodDates,
    calculateBudgetProgress,

    // goals
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    markGoalAchieved,
    addSavingsToGoal,
    setGoalSavingsPercent,
    setGoalAutoAllocate,
    getGoals,
    getGoalProgress,
    getEstimatedAllocation,
    allocateAutoSavingsForCurrentPeriod,
  };
};
