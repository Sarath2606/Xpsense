import React, { useState } from 'react';

const CreateGroupModal = ({ isOpen, onClose, onCreateGroup }) => {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('AUD');
  const [members, setMembers] = useState([
    { id: 'current_user', name: 'You', email: 'you@email.com' }
  ]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');

  const currencies = [
    { code: 'AUD', name: 'Australian Dollar', symbol: '$' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: '$' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: '$' },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: '$' }
  ];

  const handleAddMember = () => {
    if (newMemberName.trim() && newMemberEmail.trim()) {
      const newMember = {
        id: `member_${Date.now()}`,
        name: newMemberName.trim(),
        email: newMemberEmail.trim()
      };
      setMembers([...members, newMember]);
      setNewMemberName('');
      setNewMemberEmail('');
    }
  };

  const handleRemoveMember = (memberId) => {
    if (memberId !== 'current_user') {
      setMembers(members.filter(member => member.id !== memberId));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (groupName.trim() && members.length > 1) {
      onCreateGroup({
        name: groupName.trim(),
        description: description.trim(),
        currencyCode: currency,
        members
      });
      // Reset form
      setGroupName('');
      setDescription('');
      setCurrency('AUD');
      setMembers([{ id: 'current_user', name: 'You', email: 'you@email.com' }]);
    }
  };

  const handleClose = () => {
    // Reset form
    setGroupName('');
    setDescription('');
    setCurrency('AUD');
    setMembers([{ id: 'current_user', name: 'You', email: 'you@email.com' }]);
    setNewMemberName('');
    setNewMemberEmail('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Create New Group</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Name *
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g., Apartment 3B, Study Group, Weekend Trip"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this group for?"
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {currencies.map(curr => (
                <option key={curr.code} value={curr.code}>
                  {curr.symbol} {curr.name} ({curr.code})
                </option>
              ))}
            </select>
          </div>

          {/* Members */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Members *
            </label>
            
            {/* Current Members */}
            <div className="space-y-2 mb-4">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{member.name}</div>
                    <div className="text-xs text-gray-500">{member.email}</div>
                  </div>
                  {member.id !== 'current_user' && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add New Member */}
            <div className="space-y-2">
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Member name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <input
                type="email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="Member email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleAddMember}
                disabled={!newMemberName.trim() || !newMemberEmail.trim()}
                className="w-full px-3 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-200 transition-colors"
              >
                Add Member
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!groupName.trim() || members.length < 2}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
            >
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
