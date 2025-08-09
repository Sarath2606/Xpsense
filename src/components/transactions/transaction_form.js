// src/components/transactions/TransactionForm.js
import React, { useState, useEffect } from 'react';
import Modal from '../common/modal_component';

const TransactionForm = ({ categories, editingTransaction, onSubmit, onClose }) => {
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
        name: editingTransaction.name,
        amount: Math.abs(editingTransaction.amount).toString(),
        categoryId: editingTransaction.categoryId.toString(),
        date: editingTransaction.date,
        description: editingTransaction.description
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
      onSubmit(formData);
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

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title={editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transaction Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-200'
            }`}
            placeholder="Enter transaction name"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.amount ? 'border-red-500' : 'border-gray-200'
            }`}
            placeholder="0.00"
          />
          {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            value={formData.categoryId}
            onChange={(e) => handleChange('categoryId', e.target.value)}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.categoryId ? 'border-red-500' : 'border-gray-200'
            }`}
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name} ({category.type})
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date *
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.date ? 'border-red-500' : 'border-gray-200'
            }`}
          />
          {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Optional description"
          />
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            {editingTransaction ? 'Update' : 'Add'} Transaction
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TransactionForm;