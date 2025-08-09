// src/components/ui/MetricCard.js
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MetricCard = ({ type, value, change, amount }) => {
  const isIncome = type === 'income';
  const isPositiveChange = change > 0;
  
  const bgColor = isIncome ? 'bg-green-50' : 'bg-orange-50';
  const textColor = isIncome ? 'text-green-600' : 'text-orange-600';
  const Icon = isPositiveChange ? TrendingUp : TrendingDown;

  return (
    <div className={`flex-1 ${bgColor} rounded-xl p-4`}>
      <div className="flex items-center space-x-2 mb-1">
        <Icon className={`w-4 h-4 ${textColor}`} />
        <span className={`${textColor} font-semibold text-sm`}>
          {isPositiveChange ? '+' : ''}{change}%
        </span>
      </div>
      <p className="text-gray-600 text-sm capitalize">{type}</p>
      <p className={`${textColor} font-bold text-lg`}>
        ${amount.toFixed(2)}
      </p>
    </div>
  );
};

export default MetricCard;