// src/components/transactions/TransactionForm.js
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const TransactionForm = ({ categories, editingTransaction, onSave, onClose, budgetHook }) => {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    categoryId: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        name: editingTransaction.name || editingTransaction.description || '',
        amount: Math.abs(editingTransaction.amount).toString(),
        categoryId: editingTransaction.categoryId.toString(),
        date: editingTransaction.date,
        description: editingTransaction.description || ''
      });
    }
  }, [editingTransaction]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    
    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        categoryId: parseInt(formData.categoryId)
      };
      onSave(transactionData);
      handleReset();
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      amount: '',
      categoryId: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
    setErrors({});
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Check budget status for selected category
  const getBudgetWarning = () => {
    if (!budgetHook || !formData.categoryId || !formData.amount) return null;
    
    const categoryId = parseInt(formData.categoryId);
    const amount = parseFloat(formData.amount);
    const budget = budgetHook.getBudgetForCategory(categoryId);
    
    if (!budget) return null;
    
    const { startDate, endDate } = budgetHook.getCurrentPeriodDates(budget.period);
    const progress = budgetHook.calculateBudgetProgress(budget, startDate, endDate);
    
    // Check if this transaction would exceed budget
    const newTotalSpent = progress.totalSpent + amount;
    const newProgress = (newTotalSpent / budget.amount) * 100;
    
    if (newTotalSpent > budget.amount) {
      return {
        type: 'exceed',
        message: `This transaction would exceed your ${budget.category?.name} budget by $${(newTotalSpent - budget.amount).toFixed(2)}`,
        severity: 'high'
      };
    } else if (newProgress >= 80) {
      return {
        type: 'near_limit',
        message: `This transaction would use ${newProgress.toFixed(1)}% of your ${budget.category?.name} budget`,
        severity: 'medium'
      };
    }
    
    return null;
  };

  const budgetWarning = getBudgetWarning();

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <div className="bg-white p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
        </h2>
        <button 
          onClick={handleClose}
          className="scale-active p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transaction Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={`input-smooth w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              errors.name ? 'border-red-500' : ''
            }`}
            placeholder="Enter transaction name"
            required
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount *
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            step="0.01"
            className={`input-smooth w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              errors.amount ? 'border-red-500' : ''
            }`}
            placeholder="0.00"
            required
          />
          {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={(e) => handleChange('categoryId', e.target.value)}
            className={`input-smooth w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              errors.categoryId ? 'border-red-500' : ''
            }`}
            required
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name} ({category.type})
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>}
          
          {/* Budget Warning */}
          {budgetWarning && (
            <div className={`mt-3 p-3 rounded-lg border ${
              budgetWarning.severity === 'high' 
                ? 'bg-red-50 border-red-200 text-red-800' 
                : 'bg-yellow-50 border-yellow-200 text-yellow-800'
            }`}>
              <div className="flex items-center space-x-2">
                <span className="text-sm">⚠️</span>
                <p className="text-sm font-medium">{budgetWarning.message}</p>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date *
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            className={`input-smooth w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              errors.date ? 'border-red-500' : ''
            }`}
            required
          />
          {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="input-smooth w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Optional description"
          />
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            className="btn-smooth flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl font-medium transition-colors"
          >
            {editingTransaction ? 'Update' : 'Add'} Transaction
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="btn-smooth flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-4 px-6 rounded-xl font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;