// src/components/ui/BalanceCard.js
import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, TrendingDown, Eye, EyeOff } from 'lucide-react';

const BalanceCard = ({ balance, income, expenses }) => {
  const [currentMonth, setCurrentMonth] = useState(0);
  const [showBalance, setShowBalance] = useState(false);
  
  // Only current and previous month
  const months = ['Aug 2025', 'Jul 2025'];

  // Simulate different income/expense data for each month
  const getMonthlyData = (monthIndex) => {
    const baseIncome = income;
    const baseExpenses = Math.abs(expenses);
    
    // Add some variation to make it realistic
    const variation = 0.1; // 10% variation
    const incomeVariation = baseIncome * (1 + (Math.random() - 0.5) * variation);
    const expenseVariation = baseExpenses * (1 + (Math.random() - 0.5) * variation);
    
    return {
      income: incomeVariation,
      expenses: expenseVariation
    };
  };

  // Change month every 3 seconds (only between current and previous month)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMonth((prev) => (prev + 1) % months.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const currentMonthData = getMonthlyData(currentMonth);
  const expenseRatio = income + expenses > 0 ? (expenses / (income + expenses)) * 100 : 0;

  // Generate hidden balance with X's
  const getHiddenBalance = () => {
    const balanceStr = balance.toFixed(2);
    return balanceStr.replace(/\d/g, 'X');
  };

  const handleBalanceClick = () => {
    setShowBalance(!showBalance);
  };

  return (
    <div className="card-smooth bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Total Balance</h2>
        <div className="icon-smooth">
          <Wallet className="w-6 h-6" />
        </div>
      </div>
      
      <div className="mb-4">
        <button 
          onClick={handleBalanceClick}
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <p className="text-3xl font-bold">
            {showBalance ? `$${balance.toFixed(2)}` : `$${getHiddenBalance()}`}
          </p>
          {showBalance ? (
            <EyeOff className="w-5 h-5 text-gray-300" />
          ) : (
            <Eye className="w-5 h-5 text-gray-300" />
          )}
        </button>
        <p className="text-gray-300 text-sm">Available funds</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white bg-opacity-10 rounded-lg p-3 transition-all duration-500">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-gray-300">Income</p>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-lg font-semibold">${currentMonthData.income.toFixed(2)}</p>
          <p className="text-xs text-gray-400">({months[currentMonth]})</p>
        </div>
        <div className="bg-white bg-opacity-10 rounded-lg p-3 transition-all duration-500">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-gray-300">Expenses</p>
            <TrendingDown className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-lg font-semibold">${currentMonthData.expenses.toFixed(2)}</p>
          <p className="text-xs text-gray-400">({months[currentMonth]})</p>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;