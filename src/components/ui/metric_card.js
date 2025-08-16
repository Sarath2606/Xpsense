// src/components/ui/MetricCard.js
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MetricCard = ({ type, value, change, amount, title, subtitle, icon, bgColor, iconColor }) => {
  const isIncome = type === 'income';
  const isPositiveChange = change > 0;
  
  const defaultBgColor = isIncome ? 'bg-green-50' : 'bg-orange-50';
  const defaultTextColor = isIncome ? 'text-green-600' : 'text-orange-600';
  const DefaultIcon = isPositiveChange ? TrendingUp : TrendingDown;

  // Use provided props or fall back to defaults
  const finalBgColor = bgColor || defaultBgColor;
  const finalIconColor = iconColor || defaultTextColor;
  const finalIcon = icon || <DefaultIcon className="w-5 h-5" />;
  const finalTitle = title || type;
  const finalValue = value || `$${amount?.toFixed(2) || '0.00'}`;

  return (
    <div className="card-smooth bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 flex-1">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 mb-1 truncate">{finalTitle}</p>
          <p className="text-xl font-bold text-gray-900 truncate">{finalValue}</p>
        </div>
        <div className={`icon-smooth p-2 rounded-lg ${finalBgColor} ${finalIconColor} flex-shrink-0 ml-3`}>
          {finalIcon}
        </div>
      </div>
      
      {subtitle && (
        <p className="text-xs text-gray-500 mt-2 truncate">{subtitle}</p>
      )}
    </div>
  );
};

export default MetricCard;