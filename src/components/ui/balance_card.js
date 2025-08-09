// src/components/ui/BalanceCard.js
import React from 'react';

const BalanceCard = ({ balance, income, expenses }) => {
  const expenseRatio = income + expenses > 0 ? (expenses / (income + expenses)) * 100 : 0;

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 text-white relative overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-gray-300 text-sm mb-1">Balance</p>
          <h2 className="text-3xl font-bold">${balance.toFixed(2)}</h2>
        </div>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-red-500 to-yellow-500 h-2 rounded-full transition-all duration-300" 
            style={{width: `${Math.min(expenseRatio, 100)}%`}}
          ></div>
        </div>
      </div>

      {/* Card number */}
      <div className="flex justify-between items-center">
        <p className="text-gray-300 tracking-wider">**** **** 402</p>
        <div className="flex">
          <div className="w-8 h-5 bg-red-500 rounded-sm opacity-90"></div>
          <div className="w-8 h-5 bg-yellow-500 rounded-sm -ml-2 opacity-90"></div>
        </div>
      </div>

      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-5 rounded-full"></div>
      <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-white opacity-5 rounded-full"></div>
    </div>
  );
};

export default BalanceCard;