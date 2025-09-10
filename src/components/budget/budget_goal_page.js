import React, { useState } from 'react';

const BudgetGoalPage = ({ onBack, onSave, isBankConnected = false, onConnectBank }) => {
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    endDate: '',
    frequency: 'monthly',
    allocatedAmount: '',
    enableNotifications: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isBankConnected) {
      // If bank is not connected, show connect bank prompt
      return;
    }
    
    if (formData.name && formData.targetAmount && formData.endDate && formData.allocatedAmount) {
      onSave({
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString(),
        progress: 0,
        savedAmount: 0
      });
      setFormData({
        name: '',
        targetAmount: '',
        endDate: '',
        frequency: 'monthly',
        allocatedAmount: '',
        enableNotifications: true
      });
      onBack();
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getFrequencyText = (frequency) => {
    switch (frequency) {
      case 'weekly': return 'weekly';
      case 'monthly': return 'monthly';
      case 'yearly': return 'yearly';
      default: return 'monthly';
    }
  };

  // Show bank connection required message if bank is not connected
  if (!isBankConnected) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={onBack} className="text-gray-700 font-medium flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Stats
            </button>
          </div>

          {/* Bank Connection Required */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-2">Bank Connection Required</h2>
            <p className="text-gray-600 mb-6">
              To create real-time budget goals, you need to connect your bank account first. 
              This allows us to track your actual balance and savings progress automatically.
            </p>
            
            <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Why connect your bank?</h3>
              <ul className="text-sm text-blue-800 space-y-1 text-left">
                <li>• Real-time balance tracking</li>
                <li>• Automatic savings progress updates</li>
                <li>• Smart notifications when you're behind</li>
                <li>• Accurate financial insights</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onBack}
                className="flex-1 px-6 py-3 text-sm text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Go Back
              </button>
              <button
                onClick={onConnectBank}
                className="flex-1 px-6 py-3 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm"
              >
                Connect Bank
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="text-gray-700 font-medium flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Stats
          </button>
        </div>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Set Budget Goal</h1>
          <p className="text-gray-600">Create a new savings target to track your progress</p>
        </div>

        {/* Bank Connected Status */}
        <div className="bg-green-50 rounded-xl p-4 mb-6 border border-green-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-green-900">Bank Connected</p>
              <p className="text-xs text-green-700">Real-time tracking enabled</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Goal Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Goal Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Vacation Fund, New Car, Emergency Fund"
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
              />
            </div>

            {/* Target Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  name="targetAmount"
                  value={formData.targetAmount}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Date
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
              />
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Save Frequency
              </label>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            {/* Allocated Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount per {formData.frequency.slice(0, -2)}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  name="allocatedAmount"
                  value={formData.allocatedAmount}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-start space-x-3">
                <div className="flex items-center h-5">
                  <input
                    id="enableNotifications"
                    name="enableNotifications"
                    type="checkbox"
                    checked={formData.enableNotifications}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="enableNotifications" className="text-sm font-medium text-gray-900 cursor-pointer">
                    Notify me when I'm behind on savings
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    Get alerts when your balance doesn't match your {getFrequencyText(formData.frequency)} savings target of ${formData.allocatedAmount || '0.00'}. 
                    This helps you stay on track and reminds you to save or earn more.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 px-6 py-3 text-sm text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm"
              >
                Create Goal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BudgetGoalPage;
