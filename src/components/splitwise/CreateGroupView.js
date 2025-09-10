import React, { useState } from 'react';

const CreateGroupView = ({ onBack, onCreateGroup, currentUser }) => {
  const [groupName, setGroupName] = useState('');
  const [groupType, setGroupType] = useState('home');
  const [currency, setCurrency] = useState('AUD');
  const [members, setMembers] = useState([
    { 
      id: 'current_user', 
      name: currentUser?.displayName || currentUser?.email || 'You', 
      email: currentUser?.email || 'you@email.com', 
      role: 'admin' 
    }
  ]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [memberError, setMemberError] = useState('');

  const groupTypes = [
    { id: 'trip', name: 'Trip', icon: 'airplane' },
    { id: 'home', name: 'Home', icon: 'home' },
    { id: 'couple', name: 'Couple', icon: 'heart' },
    { id: 'other', name: 'Other', icon: 'list' }
  ];

  const currencies = [
    { code: 'AUD', name: 'Australian Dollar', symbol: '$' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: '$' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: '$' },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: '$' }
  ];

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddMember = () => {
    setMemberError('');
    
    const trimmedName = newMemberName.trim();
    const trimmedEmail = newMemberEmail.trim();
    
    // Validation
    if (!trimmedName) {
      setMemberError('Please enter a member name.');
      return;
    }
    
    if (!trimmedEmail) {
      setMemberError('Please enter a member email.');
      return;
    }
    
    if (!validateEmail(trimmedEmail)) {
      setMemberError('Please enter a valid email address.');
      return;
    }
    
    // Check if member already exists
    const existingMember = members.find(member => 
      member.email.toLowerCase() === trimmedEmail.toLowerCase()
    );
    
    if (existingMember) {
      setMemberError('A member with this email already exists in the group.');
      return;
    }
    
    // Add the new member
    const newMember = {
      id: `member_${Date.now()}`,
      name: trimmedName,
      email: trimmedEmail,
      role: 'member'
    };
    
    setMembers([...members, newMember]);
    setNewMemberName('');
    setNewMemberEmail('');
    setMemberError('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddMember();
    }
  };

  const handleRemoveMember = (memberId) => {
    if (memberId !== 'current_user') {
      setMembers(members.filter(member => member.id !== memberId));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMemberError('');
    
    if (groupName.trim() && members.length > 1) {
      onCreateGroup({
        name: groupName.trim(),
        type: groupType,
        currencyCode: currency,
        members
      });
      // Reset form
      setGroupName('');
      setGroupType('home');
      setCurrency('AUD');
      setMembers([{ 
        id: 'current_user', 
        name: currentUser?.displayName || currentUser?.email || 'You', 
        email: currentUser?.email || 'you@email.com', 
        role: 'admin' 
      }]);
      setNewMemberName('');
      setNewMemberEmail('');
      setMemberError('');
    }
  };

  const handleCancel = () => {
    // Reset form
    setGroupName('');
    setGroupType('home');
    setCurrency('AUD');
    setMembers([{ 
      id: 'current_user', 
      name: currentUser?.displayName || currentUser?.email || 'You', 
      email: currentUser?.email || 'you@email.com', 
      role: 'admin' 
    }]);
    setNewMemberName('');
    setNewMemberEmail('');
    setMemberError('');
    onBack();
  };

  return (
    <div className="max-w-2xl">
        {/* Back Button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back to Groups</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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

          {/* Group Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Type
            </label>
            <div className="grid grid-cols-4 gap-3">
              {groupTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setGroupType(type.id)}
                  className={`flex flex-col items-center p-3 rounded-lg border-2 transition-colors ${
                    groupType === type.id
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                    groupType === type.id ? 'bg-teal-500' : 'bg-gray-100'
                  }`}>
                    {type.icon === 'airplane' && (
                      <svg className={`w-4 h-4 ${groupType === type.id ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                    {type.icon === 'home' && (
                      <svg className={`w-4 h-4 ${groupType === type.id ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    )}
                    {type.icon === 'heart' && (
                      <svg className={`w-4 h-4 ${groupType === type.id ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    )}
                    {type.icon === 'list' && (
                      <svg className={`w-4 h-4 ${groupType === type.id ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-xs font-medium ${
                    groupType === type.id ? 'text-teal-600' : 'text-gray-600'
                  }`}>
                    {type.name}
                  </span>
                </button>
              ))}
            </div>
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
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Group Members *
              </label>
              <span className="text-xs text-gray-500">
                {members.length} member{members.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            {/* Current Members */}
            <div className="space-y-2 mb-4">
              {members.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No members added yet. Add at least one member to continue.
                </div>
              ) : (
                members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        member.role === 'admin' ? 'bg-purple-100' : 'bg-gray-100'
                      }`}>
                        <span className={`font-medium text-sm ${
                          member.role === 'admin' ? 'text-purple-600' : 'text-gray-600'
                        }`}>
                          {(member.name || '?').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">{member.name}</span>
                          {member.role === 'admin' && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                              Admin
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{member.email}</div>
                      </div>
                    </div>
                    {member.id !== 'current_user' && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Remove member"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Add New Member */}
            <div className="space-y-3">
              <div className="text-sm text-gray-600 mb-2">
                Add members to your group. You can add as many members as you need.
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => {
                    setNewMemberName(e.target.value);
                    if (memberError) setMemberError('');
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Member name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => {
                    setNewMemberEmail(e.target.value);
                    if (memberError) setMemberError('');
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Member email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              {/* Error Message */}
              {memberError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-800 text-sm">{memberError}</span>
                  </div>
                </div>
              )}
              
              <button
                type="button"
                onClick={handleAddMember}
                disabled={!newMemberName.trim() || !newMemberEmail.trim()}
                className="w-full px-3 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-200 transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Member</span>
              </button>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!groupName.trim() || members.length < 2}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
            >
              Create Group ({members.length} member{members.length !== 1 ? 's' : ''})
            </button>
          </div>
        </form>
      </div>
  );
};

export default CreateGroupView;
