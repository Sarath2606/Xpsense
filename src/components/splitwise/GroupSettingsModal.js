import React, { useState, useEffect } from 'react';
import ProfilePicture from '../common/ProfilePicture';
import { useSplitwiseApi } from '../../hooks/use_splitwise_api';

const GroupSettingsModal = ({ isOpen, onClose, group, currentUser, onGroupUpdated }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [memberError, setMemberError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [userBalance, setUserBalance] = useState(0);

  const { groups, members } = useSplitwiseApi();

  // Check if current user is admin
  const isAdmin = group?.members?.find(member => 
    (member.id === 'current_user' || member.email === currentUser?.email) && member.role === 'admin'
  );

  // Initialize form data when group changes
  useEffect(() => {
    if (group) {
      setGroupName(group.name || '');
      setGroupDescription(group.description || '');
    }
  }, [group]);

  // Calculate user's balance in the group
  useEffect(() => {
    if (group?.balances?.userBalances) {
      const userBalanceData = group.balances.userBalances.find(b => 
        b.userId === 'current_user' || b.userEmail === currentUser?.email
      );
      setUserBalance(userBalanceData?.netBalance || 0);
    }
  }, [group, currentUser]);

  const handleSaveGroupName = async () => {
    if (!groupName.trim()) return;
    
    setLoading(true);
    try {
      // TODO: Implement API call to update group name
      console.log('Updating group name to:', groupName);
      // await groups.update(group.id, { name: groupName });
      setIsEditingName(false);
      onGroupUpdated?.({ ...group, name: groupName });
    } catch (error) {
      console.error('Failed to update group name:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDescription = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to update group description
      console.log('Updating group description to:', groupDescription);
      // await groups.update(group.id, { description: groupDescription });
      setIsEditingDescription(false);
      onGroupUpdated?.({ ...group, description: groupDescription });
    } catch (error) {
      console.error('Failed to update group description:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberEmail.trim() || !newMemberName.trim()) {
      setMemberError('Please enter both name and email');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newMemberEmail)) {
      setMemberError('Please enter a valid email address');
      return;
    }

    // Check if member already exists
    const existingMember = group.members?.find(member => 
      member.email.toLowerCase() === newMemberEmail.toLowerCase()
    );
    if (existingMember) {
      setMemberError('This member is already in the group');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement API call to add member
      console.log('Adding member:', { name: newMemberName, email: newMemberEmail });
      // await members.addToGroup(group.id, { name: newMemberName, email: newMemberEmail });
      
      setNewMemberEmail('');
      setNewMemberName('');
      setMemberError('');
      onGroupUpdated?.({ 
        ...group, 
        members: [...(group.members || []), { 
          id: `member_${Date.now()}`, 
          name: newMemberName, 
          email: newMemberEmail, 
          role: 'member' 
        }] 
      });
    } catch (error) {
      console.error('Failed to add member:', error);
      setMemberError('Failed to add member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!isAdmin) return;
    
    setLoading(true);
    try {
      // TODO: Implement API call to remove member
      console.log('Removing member:', memberId);
      // await members.removeFromGroup(group.id, memberId);
      
      onGroupUpdated?.({ 
        ...group, 
        members: group.members?.filter(member => member.id !== memberId) || [] 
      });
    } catch (error) {
      console.error('Failed to remove member:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to leave group
      console.log('Leaving group:', group.id);
      // await members.leaveGroup(group.id);
      
      onClose();
      // TODO: Navigate back to group list or show success message
    } catch (error) {
      console.error('Failed to leave group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    try {
      // TODO: Implement API call to delete group
      console.log('Deleting group:', group.id);
      // await groups.delete(group.id);
      
      onClose();
      // TODO: Navigate back to group list or show success message
    } catch (error) {
      console.error('Failed to delete group:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInviteLink = () => {
    // TODO: Implement invite link generation
    const inviteCode = `INVITE_${group.id}_${Date.now()}`;
    const inviteLink = `${window.location.origin}/splitwise/invite/${inviteCode}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(inviteLink).then(() => {
      alert('Invite link copied to clipboard!');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = inviteLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Invite link copied to clipboard!');
    });
  };

  if (!isOpen || !group) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Group Settings</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'general'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'members'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Members
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'actions'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Actions
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Group Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name
                </label>
                {isEditingName ? (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter group name"
                    />
                    <button
                      onClick={handleSaveGroupName}
                      disabled={loading || !groupName.trim()}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingName(false);
                        setGroupName(group.name || '');
                      }}
                      className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">{group.name}</span>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>

              {/* Group Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                {isEditingDescription ? (
                  <div className="space-y-2">
                    <textarea
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter group description"
                      rows="3"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveDescription}
                        disabled={loading}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingDescription(false);
                          setGroupDescription(group.description || '');
                        }}
                        className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900 flex-1">
                      {group.description || 'No description'}
                    </span>
                    <button
                      onClick={() => setIsEditingDescription(true)}
                      className="text-purple-600 hover:text-purple-700 text-sm font-medium ml-2"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>

              {/* Group Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Currency</div>
                  <div className="font-medium text-gray-900">{group.currency || 'AUD'}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Members</div>
                  <div className="font-medium text-gray-900">{group.members?.length || 0}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-6">
              {/* Add Member */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Add New Member</h3>
                <div className="space-y-3">
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
                  {memberError && (
                    <div className="text-red-600 text-sm">{memberError}</div>
                  )}
                  <button
                    onClick={handleAddMember}
                    disabled={loading || !newMemberName.trim() || !newMemberEmail.trim()}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    Add Member
                  </button>
                </div>
              </div>

              {/* Invite Link */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Invite via Link</h3>
                <button
                  onClick={generateInviteLink}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
                >
                  Generate Invite Link
                </button>
              </div>

              {/* Members List */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Group Members</h3>
                <div className="space-y-2">
                  {group.members?.map((member) => {
                    const userName = member.user?.name || member.name || 'Unknown';
                    const userEmail = member.user?.email || member.email || 'No email';
                    const displayName = userName === 'Unknown' && userEmail !== 'No email' 
                      ? userEmail.split('@')[0] 
                      : userName;
                    
                    return (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                      {isAdmin && member.id !== 'current_user' && userEmail !== currentUser?.email && (
                        <button
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
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="space-y-4">
              {/* Leave Group */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Leave Group</h3>
                <p className="text-sm text-gray-600 mb-3">
                  You will no longer be part of this group and won't receive updates.
                </p>
                {userBalance !== 0 && (
                  <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-yellow-800 text-sm">
                        You have {userBalance > 0 ? 'outstanding debts' : 'money owed to you'} in this group. 
                        Other members will be notified if you leave.
                      </span>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => setShowLeaveConfirm(true)}
                  className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors"
                >
                  Leave Group
                </button>
              </div>

              {/* Delete Group (Admin Only) */}
              {isAdmin && (
                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <h3 className="font-medium text-red-900 mb-2">Delete Group</h3>
                  <p className="text-sm text-red-700 mb-3">
                    This will permanently delete the group and all its data. All members will be notified.
                  </p>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                  >
                    Delete Group
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Confirmation Modals */}
        {showLeaveConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Leave Group</h3>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to leave "{group.name}"? This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowLeaveConfirm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLeaveGroup}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-red-700 transition-colors"
                  >
                    Leave Group
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-red-900 mb-2">Delete Group</h3>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to permanently delete "{group.name}"? This will remove all expenses, balances, and group data. All members will be notified.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteGroup}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-red-700 transition-colors"
                  >
                    Delete Group
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupSettingsModal;
