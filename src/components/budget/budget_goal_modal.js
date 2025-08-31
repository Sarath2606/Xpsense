import React, { useState } from 'react';

const BudgetGoalModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    endDate: '',
    frequency: 'monthly',
    allocatedAmount: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
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
        allocatedAmount: ''
      });
      onClose();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
         <div 
       className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-[60] p-3" 
       role="dialog" 
       aria-modal="true"
       onClick={(e) => {
         if (e.target === e.currentTarget) {
           onClose();
         }
       }}
     >
             <div 
         className="w-full max-w-xs bg-white rounded-xl shadow-xl border border-gray-200 flex flex-col max-h-[70vh] overflow-hidden"
         onClick={(e) => e.stopPropagation()}
       >
                 {/* Header */}
         <div className="flex items-center justify-between p-3 border-b border-gray-100">
           <h2 className="text-base font-semibold text-gray-900">Set Budget Goal</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

                 {/* Form */}
         <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3">
           <div className="space-y-3">
                         {/* Goal Name */}
             <div>
               <label className="block text-xs font-medium text-gray-700 mb-1">
                 Goal Name
               </label>
                              <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Vacation Fund, New Car"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
            </div>

            {/* Target Amount */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Target Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  name="targetAmount"
                  value={formData.targetAmount}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Target Date
              </label>
                              <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Save Frequency
              </label>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            {/* Allocated Amount */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Amount per {formData.frequency.slice(0, -2)}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  name="allocatedAmount"
                  value={formData.allocatedAmount}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 p-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Create Goal
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetGoalModal;
