import React, { useState } from 'react';

const SettlementDetailView = ({ 
  selectedBalance, 
  onBack, 
  formatCurrency,
  onSettlementComplete
}) => {
  
  const member = selectedBalance?.member;
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [editableAmount, setEditableAmount] = useState(Math.abs((Number(selectedBalance?.netAmount) || 0) / 100));

  const handleAmountEdit = () => {
    setIsEditingAmount(true);
  };

  const handleAmountSave = () => {
    setIsEditingAmount(false);
  };

  const handleAmountCancel = () => {
    setEditableAmount(Math.abs((Number(selectedBalance?.netAmount) || 0) / 100));
    setIsEditingAmount(false);
  };

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setEditableAmount(value);
  };

  const handleMarkAsSettled = () => {
    if (onSettlementComplete) {
      onSettlementComplete({
        balance: selectedBalance,
        settledAmount: editableAmount,
        member: member
      });
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Back</span>
        </button>
        
        <h2 className="text-xl font-semibold text-white">Settle with {member?.name || 'User'}</h2>
        
        <div className="w-20"></div> {/* Spacer for centering */}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* User Info Card */}
        <div className="bg-white rounded-xl p-6">
          <div className="flex items-center mb-4">
            {/* Avatar */}
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-400 rounded-full flex items-center justify-center mr-4">
              <span className="text-white font-medium text-xl">
                {(member?.name || member?.email || 'Unknown').charAt(0).toUpperCase()}
              </span>
            </div>
            
            {/* User Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {member?.name || member?.email || 'Unknown'}
              </h3>
              <p className="text-gray-500">
                {selectedBalance?.netAmount && Number(selectedBalance.netAmount) < 0 
                  ? 'You owe them' 
                  : 'They owe you'}
              </p>
            </div>
          </div>

          {/* Amount */}
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            {isEditingAmount ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center">
                  <span className="text-gray-600 mr-2">$</span>
                  <input
                    type="text"
                    value={editableAmount}
                    onChange={handleAmountChange}
                    className="text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-blue-500 outline-none text-center w-32"
                    autoFocus
                  />
                </div>
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={handleAmountSave}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleAmountCancel}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div 
                className="cursor-pointer hover:bg-gray-100 rounded-lg p-2 transition-colors"
                onClick={handleAmountEdit}
                title="Click to edit amount"
              >
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(editableAmount)}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {selectedBalance?.netAmount && Number(selectedBalance.netAmount) < 0 
                    ? 'Outstanding balance' 
                    : 'Amount owed to you'}
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  Tap to edit
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Settlement Action */}
        <div className="bg-white rounded-xl p-6">
          <button 
            onClick={handleMarkAsSettled}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-4 rounded-lg font-medium transition-colors text-lg"
          >
            Mark as Settled
          </button>
        </div>

      </div>
    </div>
  );
};

export default SettlementDetailView;
