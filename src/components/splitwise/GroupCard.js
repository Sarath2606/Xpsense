import React from 'react';

const GroupCard = ({ group, balance, onSelect, onDelete }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: group.currencyCode || 'AUD'
    }).format(Math.abs(amount));
  };

  const getBalanceColor = (balance) => {
    if (balance > 0) return 'text-green-600';
    if (balance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getBalanceText = (balance) => {
    if (balance > 0) return `You're owed ${formatCurrency(balance)}`;
    if (balance < 0) return `You owe ${formatCurrency(balance)}`;
    return 'All settled up';
  };

  const getGroupIcon = (groupName) => {
    const name = groupName.toLowerCase();
    if (name.includes('apartment') || name.includes('rent') || name.includes('house')) return '🏠';
    if (name.includes('food') || name.includes('grocery') || name.includes('dinner')) return '🍕';
    if (name.includes('trip') || name.includes('travel') || name.includes('vacation')) return '✈️';
    if (name.includes('study') || name.includes('class') || name.includes('course')) return '📚';
    if (name.includes('transport') || name.includes('uber') || name.includes('car')) return '🚗';
    return '👥';
  };

  const expenses = group.expenses || [];
  const members = group.members || [];
  const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const lastActivity = expenses.length > 0 
    ? new Date(Math.max(...expenses.map(e => new Date(e.date))))
    : new Date(group.createdAt);

      return (
    <div
      className="group bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-purple-300 transition-all duration-200 cursor-pointer"
      onClick={onSelect}
    >
      {/* Main Content */}
      <div className="flex items-center justify-between">
        {/* Left: Group Info */}
        <div className="flex items-center flex-1 min-w-0">
          {/* Group Icon */}
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-lg font-bold mr-3">
            {getGroupIcon(group.name)}
          </div>
          
          {/* Group Details */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-base truncate group-hover:text-purple-700 transition-colors">
              {group.name}
            </h3>
            <div className="flex items-center space-x-3 mt-1">
              <span className="text-sm text-gray-500">{members.length} members</span>
              <span className="text-sm text-gray-500">
                {new Intl.NumberFormat('en-AU', {
                  style: 'currency',
                  currency: group.currencyCode || 'AUD'
                }).format(totalExpenses)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Balance & Actions */}
        <div className="flex items-center space-x-3">
          {/* Balance */}
          <div className="text-right">
            <div className={`text-sm font-semibold ${getBalanceColor(balance)}`}>
              {balance > 0 ? `+${formatCurrency(balance)}` :
               balance < 0 ? `-${formatCurrency(balance)}` :
               formatCurrency(0)}
            </div>
            <div className="text-xs text-gray-500">
              {balance > 0 ? 'owed' : balance < 0 ? 'owe' : 'settled'}
            </div>
          </div>

          {/* Delete Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 transition-all duration-200"
            title="Delete Group"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupCard;
