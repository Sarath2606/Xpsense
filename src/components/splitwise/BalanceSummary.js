import React from 'react';

const BalanceSummary = ({ balances, members, currency }) => {
  // Safety check for required props
  if (!members || !Array.isArray(members) || members.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900">Balance Summary</h4>
          <p className="text-sm text-gray-600 mt-1">Who owes what to whom</p>
        </div>
        <div className="p-6 text-center text-gray-500">
          <p>No members found</p>
        </div>
      </div>
    );
  }

  // Safety check for balances prop
  if (!balances || typeof balances !== 'object') {
    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900">Balance Summary</h4>
          <p className="text-sm text-gray-600 mt-1">Who owes what to whom</p>
        </div>
        <div className="p-6 text-center text-gray-500">
          <p>Loading balances...</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: currency || 'AUD'
    }).format(Math.abs(amount));
  };

  const getBalanceColor = (balance) => {
    if (balance > 0) return 'text-green-600';
    if (balance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getBalanceText = (balance) => {
    if (balance > 0) return `+${formatCurrency(balance)}`;
    if (balance < 0) return `-${formatCurrency(balance)}`;
    return formatCurrency(0);
  };

  const getBalanceStatus = (balance) => {
    if (balance > 0) return 'owed';
    if (balance < 0) return 'owe';
    return 'settled';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'owed': return 'bg-green-100 text-green-800';
      case 'owe': return 'bg-red-100 text-red-800';
      case 'settled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'owed': return 'You\'re owed';
      case 'owe': return 'You owe';
      case 'settled': return 'All settled';
      default: return 'Unknown';
    }
  };

  // Sort members by balance (positive first, then negative, then zero)
  const sortedMembers = members.sort((a, b) => {
    const balanceA = balances?.[a.id]?.net || 0;
    const balanceB = balances?.[b.id]?.net || 0;
    
    // Current user always first
    if (a.id === 'current_user') return -1;
    if (b.id === 'current_user') return 1;
    
    // Then by balance (positive first)
    if (balanceA > 0 && balanceB <= 0) return -1;
    if (balanceA <= 0 && balanceB > 0) return 1;
    
    // Then by absolute value
    return Math.abs(balanceB) - Math.abs(balanceA);
  });

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h4 className="font-semibold text-gray-900">Balance Summary</h4>
        <p className="text-sm text-gray-600 mt-1">Who owes what to whom</p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {sortedMembers.map((member) => {
          const balance = balances?.[member.id]?.net || 0;
          const status = getBalanceStatus(balance);
          const isCurrentUser = member.id === 'current_user';
          
          return (
            <div key={member.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isCurrentUser ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {(member.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">
                      {isCurrentUser ? 'You' : (member.name || 'Unknown')}
                    </div>
                    <div className="text-sm text-gray-500">{member.email || 'No email'}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-lg font-bold ${getBalanceColor(balance)}`}>
                    {getBalanceText(balance)}
                  </div>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                    {getStatusText(status)}
                  </div>
                </div>
              </div>
              
              {/* Additional balance details */}
              {balance !== 0 && (
                <div className="mt-3 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Paid:</span>
                    <span>{formatCurrency(balances?.[member.id]?.paid || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Owed:</span>
                    <span>{formatCurrency(balances?.[member.id]?.owed || 0)}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Summary footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total group expenses:</span>
          <span className="font-medium">
            {formatCurrency(
              Object.values(balances || {}).reduce((sum, balance) => sum + (balance?.paid || 0), 0)
            )}
          </span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-gray-600">Average per person:</span>
          <span className="font-medium">
            {formatCurrency(
              Object.values(balances || {}).reduce((sum, balance) => sum + (balance?.paid || 0), 0) / (members.length || 1)
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BalanceSummary;
