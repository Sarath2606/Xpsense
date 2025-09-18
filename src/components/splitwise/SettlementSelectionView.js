import React from 'react';
import ProfilePicture from '../common/ProfilePicture';

const SettlementSelectionView = ({ 
  group, 
  balances, 
  onBack, 
  onSelectUser,
  formatCurrency 
}) => {
  
  // Calculate balances with better error handling
  const calculateBalances = () => {
    if (!balances?.userBalances || !Array.isArray(balances.userBalances)) {
      return {
        youOweList: [],
        youAreOwedList: []
      };
    }

    // FIXED: Use the same correct logic as GroupDetailView
    // If someone has a negative balance, it means they owe money, so YOU are owed money
    // If someone has a positive balance, it means they are owed money, so YOU owe them money
    const youOweList = balances.userBalances.filter(balance => {
      // Convert netAmount to number (handle both string and number types)
      const netAmount = Number(balance.netAmount) || 0;
      return netAmount > 0; // They are owed money, so you owe them
    });

    const youAreOwedList = balances.userBalances.filter(balance => {
      // Convert netAmount to number (handle both string and number types)
      const netAmount = Number(balance.netAmount) || 0;
      return netAmount < 0; // They owe money, so you are owed
    });

    return {
      youOweList,
      youAreOwedList
    };
  };

  const balanceData = calculateBalances();

  const handleSelectUser = (balance) => {
    // Find the member by matching their user ID with the balance user ID
    const member = (group.members || []).find(m => {
      const memberUserId = m.userId || m.user?.id;
      return memberUserId === balance.userId || m.id === balance.userId;
    });
    onSelectUser({
      ...balance,
      member: member
    });
  };

  return (
    <div className="w-full">
      {/* Header with Back Button */}
      <div className="mb-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Back</span>
        </button>
        
        {/* Centered Heading */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white">Select a buddy to settle</h2>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* You Owe Section */}
        {balanceData.youOweList.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">You owe to:</h3>
            <div className="space-y-2">
              {balanceData.youOweList
                .sort((a, b) => (Number(a.netAmount) || 0) - (Number(b.netAmount) || 0))
                .map((balance) => {
                  const member = (group.members || []).find(m => {
                    const memberUserId = m.userId || m.user?.id;
                    return memberUserId === balance.userId || m.id === balance.userId;
                  });
                  
                  return (
                    <button
                      key={balance.userId}
                      onClick={() => handleSelectUser(balance)}
                      className="w-full bg-white rounded-xl p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center">
                        {/* Avatar */}
                        <ProfilePicture
                          email={member?.email || member?.user?.email}
                          name={member?.name || member?.user?.name}
                          size="lg"
                          className="mr-4"
                        />
                        
                        {/* User Info */}
                        <div className="text-left">
                          <div className="font-medium text-gray-900">
                            {member?.name || member?.email || 'Unknown'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Amount Info */}
                      <div className="text-right">
                        <div className="text-sm text-orange-600">you owe</div>
                        <div className="text-lg font-semibold text-orange-600">
                          {formatCurrency(Math.abs((Number(balance.netAmount) || 0) / 100))}
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        )}

        {/* You're Owed Section - HIDDEN because you can't settle when you're owed money */}
        {/* The person who owes you money should be the one settling with you */}
        {false && balanceData.youAreOwedList.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">You're owed by:</h3>
            <div className="space-y-2">
              {balanceData.youAreOwedList
                .sort((a, b) => (Number(b.netAmount) || 0) - (Number(a.netAmount) || 0))
                .map((balance) => {
                  const member = (group.members || []).find(m => {
                    const memberUserId = m.userId || m.user?.id;
                    return memberUserId === balance.userId || m.id === balance.userId;
                  });
                  
                  return (
                    <button
                      key={balance.userId}
                      onClick={() => handleSelectUser(balance)}
                      className="w-full bg-white rounded-xl p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center">
                        {/* Avatar */}
                        <ProfilePicture
                          email={member?.email || member?.user?.email}
                          name={member?.name || member?.user?.name}
                          size="lg"
                          className="mr-4"
                        />
                        
                        {/* User Info */}
                        <div className="text-left">
                          <div className="font-medium text-gray-900">
                            {member?.name || member?.email || 'Unknown'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Amount Info */}
                      <div className="text-right">
                        <div className="text-sm text-green-600">owes you</div>
                        <div className="text-lg font-semibold text-green-600">
                          {formatCurrency((Number(balance.netAmount) || 0) / 100)}
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {balanceData.youOweList.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No settlements needed!</h3>
            <p className="text-gray-500">You don't owe anyone money, so there's nothing to settle.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettlementSelectionView;
