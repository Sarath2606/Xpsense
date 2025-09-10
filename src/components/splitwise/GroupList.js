import React from 'react';
import GroupCard from './GroupCard';

const GroupList = ({ groups, onSelectGroup, onCreateGroup, onDeleteGroup, loading }) => {
  const calculateGroupBalance = (group) => {
    // This is a simplified calculation - we'll implement proper balance logic later
    // Add null checks for expenses and members
    const expenses = group.expenses || [];
    const members = group.members || [];
    
    if (expenses.length === 0 || members.length === 0) {
      return 0;
    }
    
    const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    // For now, we'll calculate a simple balance - in a real app, you'd get the current user ID
    const userExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    const userShare = totalExpenses / members.length;
    return userExpenses - userShare;
  };

  return (
    <div className="h-full">


      {/* Groups Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="animate-spin w-8 h-8 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading groups...</h3>
          <p className="text-gray-600">Please wait while we fetch your groups</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No groups yet</h3>
          <p className="text-gray-600 mb-4">Create your first group to start tracking shared expenses</p>
          <button
            onClick={onCreateGroup}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl font-medium transition-colors"
          >
            Create Your First Group
          </button>
        </div>
             ) : (
         <div className="space-y-4">
           {groups.map((group) => (
             <GroupCard
               key={group.id}
               group={group}
               balance={calculateGroupBalance(group)}
               onSelect={() => onSelectGroup(group)}
               onDelete={() => onDeleteGroup(group.id)}
             />
           ))}
         </div>
       )}

      {/* Quick Tips */}
      {groups.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 rounded-xl">
          <h4 className="font-medium text-gray-900 mb-2">💡 Quick Tips</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Tap on a group to view details and add expenses</li>
            <li>• Green balance means you're owed money, red means you owe money</li>
            <li>• Add all group members to ensure fair splits</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default GroupList;
