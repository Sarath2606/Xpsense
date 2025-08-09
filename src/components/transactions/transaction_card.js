// src/components/transactions/TransactionCard.js
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import CategoryIcon from '../ui/category_icon';
import { getCategoryInfo } from '../../utils/calculations_js';

const TransactionCard = ({ 
  transaction, 
  categories, 
  onEdit, 
  onDelete, 
  showActions = false,
  variant = 'simple' // 'simple' or 'detailed'
}) => {
  const category = getCategoryInfo(categories, transaction.categoryId);
  const formattedDate = new Date(transaction.date).toLocaleDateString();
  const isIncome = transaction.amount > 0;
  const amountColor = isIncome ? 'text-green-600' : 'text-red-600';

  if (variant === 'simple') {
    return (
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center space-x-4">
          <CategoryIcon 
            categoryId={transaction.categoryId} 
            categories={categories} 
            size="lg" 
          />
          <div>
            <h4 className="font-semibold text-gray-900">{transaction.name}</h4>
            <p className="text-gray-500 text-sm">{formattedDate}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`font-bold ${amountColor}`}>
            {isIncome ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <CategoryIcon 
            categoryId={transaction.categoryId} 
            categories={categories} 
            size="md" 
          />
          <div>
            <h4 className="font-semibold text-gray-900">{transaction.name}</h4>
            <p className="text-gray-500 text-sm">{category.name}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <p className={`font-bold ${amountColor}`}>
            {isIncome ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
          </p>
          
          {showActions && (
            <>
              <button
                onClick={() => onEdit(transaction)}
                className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                title="Edit transaction"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(transaction.id)}
                className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                title="Delete transaction"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="flex justify-between text-sm text-gray-500">
        <span>{formattedDate}</span>
        <span className="truncate ml-2">{transaction.description}</span>
      </div>
    </div>
  );
};

export default TransactionCard;