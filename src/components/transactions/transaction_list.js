// src/components/transactions/TransactionList.js
import React from 'react';
import TransactionCard from './transaction_card';

const TransactionList = ({ 
  transactions = [], 
  categories = [], 
  onEditTransaction, 
  onDeleteTransaction,
  showActions = false, // Set to false by default for real-time transactions
  variant = 'detailed',
  emptyMessage = 'No transactions found'
}) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-gray-400 text-2xl">📊</span>
          </div>
        </div>
        <p className="text-gray-500 text-lg font-medium mb-2">No Transactions Yet</p>
        <p className="text-gray-400 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 w-full box-border">
      {transactions.map((transaction) => (
        <TransactionCard
          key={transaction.id}
          transaction={transaction}
          categories={categories}
          onEdit={onEditTransaction}
          onDelete={onDeleteTransaction}
          showActions={showActions}
          variant={variant}
        />
      ))}
    </div>
  );
};

export default TransactionList;