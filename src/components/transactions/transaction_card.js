// src/components/transactions/TransactionCard.js - Fixed onViewChange error
import React from 'react';
import CategoryIcon from '../ui/category_icon';
import { getCategoryInfo } from '../../utils/calculations_js';

const TransactionCard = ({ 
  transaction, 
  categories = [], 
  onEdit, 
  onDelete, 
  showActions = false, // Set to false by default for real-time transactions
  variant = 'detailed' // 'simple' or 'detailed'
}) => {
  // Early return if transaction is not provided
  if (!transaction) {
    return null;
  }

  const category = getCategoryInfo(categories, transaction.category);
  const formattedDate = new Date(transaction.date).toLocaleDateString();
  const isIncome = transaction.amount > 0;
  const amountColor = isIncome ? 'text-green-600' : 'text-red-600';

  if (variant === 'simple') {
    return (
      <div className="flex items-center justify-between py-2 w-full box-border">
        <div className="flex items-center space-x-3">
          <CategoryIcon 
            categoryId={transaction.category} 
            categories={categories} 
            size="sm" 
          />
          <div>
            <h4 className="font-medium text-gray-900 text-sm">{transaction.description}</h4>
            <p className="text-gray-500 text-xs">{formattedDate}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`font-semibold text-sm ${amountColor}`}>
            {isIncome ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-smooth bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 w-full box-border">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="icon-smooth mt-0.5">
            <CategoryIcon 
              categoryId={transaction.category} 
              categories={categories} 
              size="sm" 
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 text-sm truncate">
                  {transaction.description}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formattedDate}
                </p>
              </div>
              
              <div className="text-right ml-2 flex-shrink-0">
                <p className={`font-semibold text-sm ${amountColor}`}>
                  {isIncome ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionCard;