// src/components/transactions/TransactionCard.js
import React, { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import CategoryIcon from '../ui/category_icon';
import { getCategoryInfo } from '../../utils/calculations_js';

const TransactionCard = ({ 
  transaction, 
  categories, 
  onEdit, 
  onDelete, 
  showActions = true,
  variant = 'detailed' // 'simple' or 'detailed'
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: transaction.name || transaction.description || '',
    amount: transaction.amount,
    categoryId: transaction.categoryId,
    date: transaction.date,
    description: transaction.description || ''
  });

  const category = getCategoryInfo(categories, transaction.categoryId);
  const formattedDate = new Date(transaction.date).toLocaleDateString();
  const isIncome = transaction.amount > 0;
  const amountColor = isIncome ? 'text-green-600' : 'text-red-600';

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      name: transaction.name || transaction.description || '',
      amount: transaction.amount,
      categoryId: transaction.categoryId,
      date: transaction.date,
      description: transaction.description || ''
    });
  };

  const handleSave = () => {
    if (onEdit) {
      onEdit({
        ...transaction,
        ...editData
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      name: transaction.name || transaction.description || '',
      amount: transaction.amount,
      categoryId: transaction.categoryId,
      date: transaction.date,
      description: transaction.description || ''
    });
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(transaction.id);
    }
  };

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
            <h4 className="font-semibold text-gray-900">{transaction.name || transaction.description}</h4>
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
    <div className={`card-smooth bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 ${
      isEditing ? 'ring-2 ring-blue-500' : ''
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="icon-smooth">
            <CategoryIcon 
              categoryId={transaction.categoryId} 
              categories={categories} 
              size="md" 
            />
          </div>
          
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{transaction.name || transaction.description}</h3>
            <p className="text-sm text-gray-500">
              {new Date(transaction.date).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <p className={`font-semibold text-lg ${
            transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
          </p>
          <p className="text-xs text-gray-500">
            {getCategoryName(transaction.categoryId)}
          </p>
        </div>
      </div>
      
      {isEditing && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="space-y-3">
            <input
              type="text"
              value={editData.name}
              onChange={(e) => setEditData({...editData, name: e.target.value})}
              className="input-smooth w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Transaction name"
            />
            <input
              type="number"
              value={editData.amount}
              onChange={(e) => setEditData({...editData, amount: parseFloat(e.target.value)})}
              className="input-smooth w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Amount"
            />
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={handleSave}
                className="btn-smooth bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                Save
              </button>
              <button 
                onClick={handleCancel}
                className="btn-smooth bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {!isEditing && showActions && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end space-x-2">
          <button 
            onClick={handleEdit}
            className="scale-active p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={handleDelete}
            className="scale-active p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionCard;