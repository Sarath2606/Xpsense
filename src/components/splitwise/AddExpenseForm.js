import React, { useState } from 'react';

const AddExpenseForm = ({ onClose, onAddExpense, group }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [splitType, setSplitType] = useState('equal');
  const [customSplits, setCustomSplits] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: group.currency || 'AUD'
    }).format(value);
  };

  const calculateEqualSplit = () => {
    const totalAmount = parseFloat(amount) || 0;
    return totalAmount / group.members.length;
  };

  const handleSplitTypeChange = (newSplitType) => {
    setSplitType(newSplitType);
    
    if (newSplitType === 'equal') {
      setCustomSplits({});
    } else if (newSplitType === 'custom') {
      const equalAmount = calculateEqualSplit();
      const initialSplits = {};
      group.members.forEach(member => {
        initialSplits[member.id] = equalAmount;
      });
      setCustomSplits(initialSplits);
    }
  };

  const handleCustomSplitChange = (memberId, value) => {
    const numValue = parseFloat(value) || 0;
    setCustomSplits({
      ...customSplits,
      [memberId]: numValue
    });
  };

  const getTotalCustomSplit = () => {
    return Object.values(customSplits).reduce((sum, amount) => sum + (parseFloat(amount) || 0), 0);
  };

  const getSplitDifference = () => {
    const totalAmount = parseFloat(amount) || 0;
    const totalSplit = getTotalCustomSplit();
    return totalAmount - totalSplit;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const totalAmount = parseFloat(amount);
    if (!description.trim() || !totalAmount || totalAmount <= 0) return;

    let splits = [];
    
    if (splitType === 'equal') {
      const equalAmount = totalAmount / group.members.length;
      splits = group.members.map(member => ({
        userId: member.id,
        amount: equalAmount
      }));
    } else if (splitType === 'custom') {
      splits = Object.entries(customSplits).map(([memberId, amount]) => ({
        userId: memberId,
        amount: parseFloat(amount) || 0
      }));
    }

    const newExpense = {
      description: description.trim(),
      amount: totalAmount,
      // payer will be enforced in parent using authenticated member id
      paidBy: group.members.find(m => (m.email || '').length > 0 && (m.email || '').toLowerCase() === (group.currentUserEmail || '').toLowerCase())?.id || 'current_user',
      date,
      splitType,
      splits,
      settled: false
    };

    onAddExpense(newExpense);
    
    setDescription('');
    setAmount('');
    setSplitType('equal');
    setCustomSplits({});
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleClose = () => {
    setDescription('');
    setAmount('');
    setSplitType('equal');
    setCustomSplits({});
    setDate(new Date().toISOString().split('T')[0]);
    onClose();
  };

  const splitDifference = getSplitDifference();
  const isSplitValid = splitType === 'equal' || Math.abs(splitDifference) < 0.01;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-2">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-base font-medium text-white">Add expense</span>
        </button>
      </div>

      <div className="mb-3">
        <p className="text-xs text-gray-400">Split an expense with your group members</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Basic Information Section */}
        <div className="bg-gray-800 rounded-xl p-3">
          <h4 className="text-sm font-medium text-white mb-2">Expense Details</h4>
          
          <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  What was this expense for? *
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Grocery shopping, Dinner, Rent"
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-700 text-white placeholder-gray-400"
                  required
                />
              </div>

            <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Amount *
                  </label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">
                      {group.currency || 'AUD'}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-700 text-white placeholder-gray-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-700 text-white"
                  />
                </div>
              </div>

            </div>
          </div>

        {/* Split Type Section */}
        <div className="bg-gray-800 rounded-xl p-3">
          <h4 className="text-sm font-medium text-white mb-2">How should this be split?</h4>
            
            <div className="grid grid-cols-2 gap-2">
              <label className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all cursor-pointer ${
                splitType === 'equal' 
                  ? 'border-blue-500 bg-blue-900/20' 
                  : 'border-gray-600 bg-gray-700 hover:border-gray-500'
              }`}>
                <input
                  type="radio"
                  value="equal"
                  checked={splitType === 'equal'}
                  onChange={(e) => handleSplitTypeChange(e.target.value)}
                  className="sr-only"
                />
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${
                  splitType === 'equal' ? 'bg-blue-500' : 'bg-gray-600'
                }`}>
                  <svg className={`w-3 h-3 ${splitType === 'equal' ? 'text-white' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className={`text-xs font-medium text-center ${
                  splitType === 'equal' ? 'text-blue-300' : 'text-gray-300'
                }`}>
                  Equal split
                </span>
                <span className={`text-xs mt-1 ${
                  splitType === 'equal' ? 'text-blue-400' : 'text-gray-400'
                }`}>
                  {group.members.length} people
                </span>
              </label>

              <label className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all cursor-pointer ${
                splitType === 'custom' 
                  ? 'border-blue-500 bg-blue-900/20' 
                  : 'border-gray-600 bg-gray-700 hover:border-gray-500'
              }`}>
                <input
                  type="radio"
                  value="custom"
                  checked={splitType === 'custom'}
                  onChange={(e) => handleSplitTypeChange(e.target.value)}
                  className="sr-only"
                />
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${
                  splitType === 'custom' ? 'bg-blue-500' : 'bg-gray-600'
                }`}>
                  <svg className={`w-3 h-3 ${splitType === 'custom' ? 'text-white' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <span className={`text-xs font-medium text-center ${
                  splitType === 'custom' ? 'text-blue-300' : 'text-gray-300'
                }`}>
                  Custom amounts
                </span>
                <span className={`text-xs mt-1 ${
                  splitType === 'custom' ? 'text-blue-400' : 'text-gray-400'
                }`}>
                  Set individual amounts
                </span>
              </label>
            </div>
          </div>

        {/* Custom Split Section */}
        {splitType === 'custom' && (
          <div className="bg-gray-800 rounded-xl p-3">
            <h4 className="text-sm font-medium text-white mb-2">Set individual amounts</h4>
              
              <div className="space-y-2">
                {group.members.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg border border-gray-600">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-xs">
                          {(member.name || '?').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-200">
                        {member.id === 'current_user' ? 'You' : member.name}
                      </span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">
                        {group.currency || 'AUD'}
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={customSplits[member.id] || ''}
                        onChange={(e) => handleCustomSplitChange(member.id, e.target.value)}
                        className="w-24 pl-8 pr-2 py-1 border border-gray-600 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-600 text-white placeholder-gray-400"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className={`mt-3 p-3 rounded-lg border ${
                Math.abs(splitDifference) > 0.01 
                  ? 'bg-red-900/20 border-red-600' 
                  : 'bg-green-900/20 border-green-600'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${
                    Math.abs(splitDifference) > 0.01 ? 'text-red-300' : 'text-green-300'
                  }`}>
                    Total split: {formatCurrency(getTotalCustomSplit())}
                  </span>
                  <span className={`text-xs font-medium ${
                    Math.abs(splitDifference) > 0.01 ? 'text-red-300' : 'text-green-300'
                  }`}>
                    Expense: {formatCurrency(parseFloat(amount) || 0)}
                  </span>
                </div>
                {Math.abs(splitDifference) > 0.01 && (
                  <div className="mt-1 text-xs text-red-400 font-medium">
                    ⚠️ Difference: {formatCurrency(splitDifference)}
                  </div>
                )}
              </div>
            </div>
          )}

        {/* Equal Split Preview */}
        {splitType === 'equal' && amount && (
          <div className="bg-green-900/20 rounded-xl p-3 border border-green-600">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-sm font-medium text-green-300">Split Summary</h4>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-200 mb-1">
                  {formatCurrency(calculateEqualSplit())}
                </div>
                <div className="text-xs text-green-400">
                  Each person pays
                </div>
              </div>
            </div>
          )}

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!description.trim() || !amount || parseFloat(amount) <= 0 || !isSplitValid}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              Add Expense
            </button>
          </div>
        </form>
    </div>
  );
};

export default AddExpenseForm;
