import React, { useState } from 'react';
import ProfilePicture from '../common/ProfilePicture';
import { useSplitwiseApi } from '../../hooks/use_splitwise_api';
import TestInviteAPI from './TestInviteAPI';

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
  const [isCreating, setIsCreating] = useState(false);
  const [invitationStatus, setInvitationStatus] = useState({});
  const [showInvitationResults, setShowInvitationResults] = useState(false);
  
  const { groups: groupsApi, invites: invitesApi } = useSplitwiseApi();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMemberError('');
    
    if (!groupName.trim() || members.length < 2) {
      return;
    }

    setIsCreating(true);
    setInvitationStatus({});
    setShowInvitationResults(false);

    try {
      // Step 1: Create the group
      const groupData = {
        name: groupName.trim(),
        type: groupType,
        currencyCode: currency,
        members
      };
      
      console.log('🚀 Creating group with data:', groupData);
      const response = await groupsApi.create(groupData);
      const createdGroup = response.group;
      console.log('✅ Group created successfully:', createdGroup);
      
      // Step 2: Send invitations to all non-current-user members
      const membersToInvite = members.filter(member => member.id !== 'current_user');
      const invitationResults = {};
      
      console.log('📧 Members to invite:', membersToInvite);
      
      if (membersToInvite.length > 0) {
        setShowInvitationResults(true);
        
        // Send invitations in parallel
        const invitationPromises = membersToInvite.map(async (member) => {
          try {
            console.log(`📤 Sending invitation to ${member.email} for group ${createdGroup.id}`);
            const inviteResponse = await invitesApi.sendInvite(createdGroup.id, {
              email: member.email,
              message: `You've been invited to join "${groupName.trim()}" group!`
            });
            console.log(`✅ Invitation sent successfully to ${member.email}:`, inviteResponse);
            invitationResults[member.email] = { 
              status: 'success', 
              message: 'Invitation sent successfully',
              invitation: inviteResponse.invitation
            };
          } catch (error) {
            console.error(`❌ Failed to send invitation to ${member.email}:`, error);
            invitationResults[member.email] = { 
              status: 'error', 
              message: error.message || 'Failed to send invitation'
            };
          }
        });
        
        // Wait for all invitations to complete
        await Promise.all(invitationPromises);
        console.log('📊 Final invitation results:', invitationResults);
        setInvitationStatus(invitationResults);
      }
      
      // Step 3: Call the original onCreateGroup callback with the created group
      onCreateGroup(createdGroup);
      
      // Step 4: Reset form after a short delay to show results
      setTimeout(() => {
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
        setInvitationStatus({});
        setShowInvitationResults(false);
      }, 3000);
      
    } catch (error) {
      console.error('❌ Failed to create group:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.status,
        response: error.response,
        stack: error.stack
      });
      setMemberError(error.message || 'Failed to create group. Please try again.');
    } finally {
      setIsCreating(false);
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
      {/* Temporary Debug Component */}
      <div className="mb-6">
        <TestInviteAPI />
      </div>
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
                members.map((member) => {
                  const userName = member.user?.name || member.name || 'Unknown';
                  const userEmail = member.user?.email || member.email || 'No email';
                  const displayName = userName === 'Unknown' && userEmail !== 'No email' 
                    ? userEmail.split('@')[0] 
                    : userName;
                  
                  return (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <ProfilePicture
                        email={userEmail}
                        name={displayName}
                        size="sm"
                        isAdmin={member.role === 'admin'}
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">{displayName}</span>
                          {member.role === 'admin' && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                              Admin
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{userEmail}</div>
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
                  );
                })
              )}
            </div>

            {/* Add New Member */}
            <div className="space-y-3">
              <div className="text-sm text-gray-600 mb-2">
                Add members to your group. Email invitations will be sent automatically when you create the group.
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
              
              {/* Info Box */}
              {members.length > 1 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="text-sm text-blue-800">
                      <div className="font-medium mb-1">Ready to create your group!</div>
                      <p className="text-xs">
                        When you click "Create Group", we'll automatically send email invitations to all {members.length - 1} member{members.length - 1 !== 1 ? 's' : ''} you've added. 
                        They'll receive a link to join your group.
                      </p>
                    </div>
                  </div>
                </div>
              )}
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
              disabled={!groupName.trim() || members.length < 2 || isCreating}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors flex items-center justify-center"
            >
              {isCreating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Group & Sending Invitations...
                </>
              ) : (
                `Create Group & Send Invitations (${members.length} member${members.length !== 1 ? 's' : ''})`
              )}
            </button>
          </div>
        </form>

        {/* Invitation Results */}
        {showInvitationResults && Object.keys(invitationStatus).length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Invitation Results
            </h3>
            <div className="space-y-2">
              {Object.entries(invitationStatus).map(([email, result]) => (
                <div key={email} className={`flex items-center justify-between p-3 rounded-lg ${
                  result.status === 'success' 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      result.status === 'success' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {result.status === 'success' ? (
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className={`font-medium text-sm ${
                        result.status === 'success' ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {email}
                      </div>
                      <div className={`text-xs ${
                        result.status === 'success' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {result.message}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-blue-700">
              <p>✅ Group created successfully! Invitations have been sent to all members.</p>
              <p>📧 Members will receive email invitations to join the group.</p>
            </div>
          </div>
        )}
      </div>
    );
  };

export default CreateGroupView;
