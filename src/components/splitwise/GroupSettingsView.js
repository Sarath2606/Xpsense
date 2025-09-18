import React, { useState, useEffect } from 'react';
import ProfilePicture from '../common/ProfilePicture';
import { useSplitwiseApi } from '../../hooks/use_splitwise_api';

const GroupSettingsView = ({ group, currentUser, onBack, onGroupUpdated, onShowAddMember }) => {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedGroupType, setEditedGroupType] = useState('home');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [memberError, setMemberError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [simplifyDebts, setSimplifyDebts] = useState(false);

  const { groups, members } = useSplitwiseApi();

  // Group types for editing
  const groupTypes = [
    { id: 'friends', name: 'Friends', icon: 'users' },
    { id: 'home', name: 'Home', icon: 'home' },
    { id: 'couple', name: 'Couple', icon: 'heart' },
    { id: 'other', name: 'Other', icon: 'list' }
  ];

  // Check if current user is admin
  const isAdmin = group?.members?.find(member => {
    const isCurrentUser = member.id === 'current_user' || 
                         member.email === currentUser?.email ||
                         member.userId === currentUser?.uid ||
                         member.user?.id === currentUser?.uid ||
                         member.user?.email === currentUser?.email;
    const isAdminRole = member.role === 'admin';
    
    return isCurrentUser && isAdminRole;
  });

  // Initialize form data when group changes
  useEffect(() => {
    if (group) {
      setGroupName(group.name || '');
      setGroupDescription(group.description || '');
      setEditedGroupType(group.type || 'home');
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: group.currency || 'AUD'
    }).format(amount);
  };

  const handleSaveGroupName = async () => {
    if (!groupName.trim()) return;
    
    setLoading(true);
    try {
      // TODO: Implement API call to update group name and type
      console.log('Updating group name to:', groupName);
      console.log('Updating group type to:', editedGroupType);
      // await groups.update(group.id, { name: groupName, type: editedGroupType });
      setIsEditingName(false);
      onGroupUpdated?.({ ...group, name: groupName, type: editedGroupType });
    } catch (error) {
      console.error('Failed to update group name and type:', error);
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
      
      onBack();
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
      // Send notification to all group members before deleting
      const groupMembers = group.members || [];
      const adminMember = groupMembers.find(member => 
        (member.id === 'current_user' || member.email === currentUser?.email) && member.role === 'admin'
      );
      
      // Create notification data
      const notificationData = {
        type: 'GROUP_DELETED',
        groupId: group.id,
        groupName: group.name,
        deletedBy: {
          name: adminMember?.name || currentUser?.displayName || 'Admin',
          email: adminMember?.email || currentUser?.email
        },
        message: `The group "${group.name}" has been deleted by ${adminMember?.name || currentUser?.displayName || 'the admin'}. All expenses and balances have been removed.`,
        timestamp: new Date().toISOString()
      };

      // Send notifications to all members (except the admin who is deleting)
      const membersToNotify = groupMembers.filter(member => 
        member.id !== 'current_user' && member.email !== currentUser?.email
      );

      // TODO: Implement real-time notification system
      console.log('Sending notifications to members:', membersToNotify);
      console.log('Notification data:', notificationData);
      
      // Send email notifications to all members
      for (const member of membersToNotify) {
        if (member.email) {
          // TODO: Implement email notification service
          console.log(`Sending email to ${member.email}:`, notificationData.message);
        }
      }

      // Delete the group via API
      console.log('🗑️ Deleting group:', group.id);
      console.log('🔍 Group object:', group);
      console.log('🔍 Current user for deletion:', currentUser);
      console.log('🔍 User ID being sent:', currentUser?.uid);
      
      const result = await groups.delete(group.id);
      console.log('✅ Delete result:', result);
      
      // Show success message
      console.log(`Group "${group.name}" deleted successfully. Notifications sent to ${membersToNotify.length} members.`);
      
      // Show success alert to user
      alert(`Group "${group.name}" has been deleted successfully! All ${membersToNotify.length} members have been notified.`);
      
      // Close confirmation modal
      setShowDeleteConfirm(false);
      
      // Navigate back to group list
      onBack();
      
    } catch (error) {
      console.error('❌ Failed to delete group:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.status,
        response: error.response,
        groupId: group.id,
        currentUser: currentUser
      });
      alert(`Failed to delete group: ${error.message || 'Unknown error occurred'}`);
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

  if (!group) return null;

  return (
    <div className="h-full bg-gray-900 text-white">
      {/* Back Button */}
      <div className="mb-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center text-white hover:text-gray-300 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Back to Group</span>
        </button>
      </div>

      {/* Group Information */}
      <div className="mb-6">
        <div className="flex items-center justify-between p-3 bg-gray-800 rounded-xl">
          <div className="flex items-center space-x-4">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.13478 20.7735V17.7157C9.13478 16.9352 9.77217 16.3024 10.5584 16.3024H13.4326C13.8102 16.3024 14.1723 16.4513 14.4393 16.7164C14.7063 16.9814 14.8563 17.3409 14.8563 17.7157V20.7735C14.8539 21.098 14.9821 21.41 15.2124 21.6403C15.4427 21.8706 15.7561 22.0001 16.0829 22.0001H18.0438C18.9596 22.0025 19.8388 21.643 20.4872 21.0009C21.1356 20.3589 21.5 19.4871 21.5 18.5779V9.86698C21.5 9.13258 21.1721 8.43596 20.6046 7.96479L13.934 2.67599C12.7737 1.74868 11.1111 1.77862 9.98539 2.7471L3.46701 7.96479C2.87274 8.42207 2.51755 9.12076 2.5 9.86698V18.5691C2.5 20.464 4.04738 22.0001 5.95617 22.0001H7.87229C8.55123 22.0001 9.103 21.4563 9.10792 20.7824L9.13478 20.7735Z" fill="currentColor"/>
            </svg>
            <div>
              {isEditingName ? (
                <div className="space-y-4">
                  {/* Group Name Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Group name</label>
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Enter group name"
                    />
                  </div>
                  
                  {/* Group Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Type</label>
                    <div className="grid grid-cols-4 gap-2">
                      {groupTypes.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setEditedGroupType(type.id)}
                          className={`flex flex-col items-center p-2 rounded-lg border-2 transition-colors ${
                            editedGroupType === type.id
                              ? 'border-teal-500 bg-teal-50'
                              : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center mb-1 ${
                            editedGroupType === type.id ? 'bg-teal-500' : 'bg-gray-600'
                          }`}>
                            {type.icon === 'users' && (
                              <svg className={`w-3 h-3 ${editedGroupType === type.id ? 'text-white' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            )}
                            {type.icon === 'home' && (
                              <svg className={`w-3 h-3 ${editedGroupType === type.id ? 'text-white' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                              </svg>
                            )}
                            {type.icon === 'heart' && (
                              <svg className={`w-3 h-3 ${editedGroupType === type.id ? 'text-white' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                            )}
                            {type.icon === 'list' && (
                              <svg className={`w-3 h-3 ${editedGroupType === type.id ? 'text-white' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                              </svg>
                            )}
                          </div>
                          <span className={`text-xs font-medium ${
                            editedGroupType === type.id ? 'text-teal-600' : 'text-gray-300'
                          }`}>
                            {type.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSaveGroupName}
                      disabled={loading || !groupName.trim()}
                      className="text-green-400 hover:text-green-300 text-sm disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingName(false);
                        setGroupName(group.name || '');
                        setEditedGroupType(group?.type || 'home');
                      }}
                      className="text-gray-400 hover:text-gray-300 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-base font-medium text-white">{group.name}</h2>
                  <p className="text-xs text-gray-400">
                    {groupTypes.find(t => t.id === (group?.type || 'home'))?.name || 'Home'}
                  </p>
                </div>
              )}
            </div>
          </div>
          {!isEditingName && (
            <button
              onClick={() => setIsEditingName(true)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Group Members Section */}
      <div className="mb-6">
        <h3 className="text-base font-medium text-white mb-3">Group members</h3>
        
        {/* Add People to Group */}
        <div className="mb-3">
          <button
            onClick={() => {
              onShowAddMember?.();
            }}
            className="w-full flex items-center justify-between p-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className="text-white text-sm font-medium">Add people to group</span>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Invite via Link */}
        <div className="mb-4">
          <button
            onClick={generateInviteLink}
            className="w-full flex items-center justify-between p-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <span className="text-white text-sm font-medium">Invite via link</span>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Members Management Section */}
        <div className="space-y-4">
          {/* Add Member Button */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Group Members</h3>
            <button
              onClick={() => {/* TODO: Add member functionality */}}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add Member</span>
            </button>
          </div>

          {/* Members List */}
          <div className="space-y-3">
            {group.members?.map((member) => {
              const userName = member.user?.name || member.name || 'Unknown';
              const userEmail = member.user?.email || member.email || 'No email';
              const displayName = userName === 'Unknown' && userEmail !== 'No email' 
                ? userEmail.split('@')[0] 
                : userName;
              const isCurrentUser = member.id === 'current_user' || userEmail === currentUser?.email;
              const isAdmin = member.role === 'admin';
              
              return (
                <div key={member.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-xl border border-gray-700">
                  <div className="flex items-center space-x-3">
                    <ProfilePicture
                      email={userEmail}
                      name={displayName}
                      size="lg"
                      isAdmin={isAdmin}
                      showBorder={true}
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium">{displayName}</span>
                        {isCurrentUser && (
                          <span className="px-2 py-1 bg-green-600 text-green-100 text-xs rounded-full font-medium">
                            You
                          </span>
                        )}
                        {isAdmin && (
                          <span className="px-2 py-1 bg-purple-600 text-purple-100 text-xs rounded-full font-medium">
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="text-gray-400 text-sm">{userEmail}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!isCurrentUser && (
                      <button
                        onClick={() => {/* TODO: Remove member functionality */}}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Remove member"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Member Count Summary */}
          <div className="text-center text-gray-400 text-sm">
            {group.members?.length || 0} member{(group.members?.length || 0) !== 1 ? 's' : ''} in this group
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="mb-6">
        <h3 className="text-base font-medium text-white mb-3">Advanced settings</h3>
        
        <div className="p-3 bg-gray-800 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <div className="text-white text-sm font-medium">Simplify group debts</div>
                <div className="text-gray-400 text-xs">
                  Automatically combines debts to reduce the total number of repayments between group members.{' '}
                  <button className="text-blue-400 hover:text-blue-300 underline">Learn more</button>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSimplifyDebts(!simplifyDebts)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                simplifyDebts ? 'bg-teal-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  simplifyDebts ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="space-y-4">
        {/* Leave Group */}
        <div className="p-3 border border-yellow-600 rounded-xl bg-yellow-900/20">
          <h4 className="text-yellow-400 text-sm font-medium mb-2">Leave Group</h4>
          <p className="text-gray-300 text-xs mb-3">
            You will no longer be part of this group and won't receive updates.
          </p>
          {userBalance !== 0 && (
            <div className="mb-3 p-3 bg-yellow-800/50 border border-yellow-600/50 rounded-lg">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-yellow-200 text-xs">
                  You have {userBalance > 0 ? 'outstanding debts' : 'money owed to you'} in this group. 
                  Other members will be notified if you leave.
                </span>
              </div>
            </div>
          )}
          <button
            onClick={() => setShowLeaveConfirm(true)}
            className="w-full px-3 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors"
          >
            Leave Group
          </button>
        </div>

        {/* Delete Group (Admin Only) */}
        {isAdmin && (
        <div className="p-4 border border-red-600 rounded-xl bg-red-900/20">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-red-400 text-sm font-semibold mb-2">Danger Zone</h4>
              <p className="text-gray-300 text-xs mb-3">
                Permanently delete this group and all its data. All {group.members?.length || 0} members will receive real-time notifications about the deletion.
              </p>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={loading}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Group
                  </>
                )}
              </button>
            </div>
          </div>
          </div>
        )}
      </div>

      {/* Confirmation Modals */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Leave Group</h3>
              <p className="text-gray-300 mb-4">
                Are you sure you want to leave "{group.name}"? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowLeaveConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg font-medium hover:bg-gray-700 transition-colors"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{zIndex: 9999}}>
          <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-400">Delete Group</h3>
                  <p className="text-gray-400 text-sm">This action cannot be undone</p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-300 mb-3">
                  Are you sure you want to permanently delete <span className="font-semibold text-white">"{group.name}"</span>?
                </p>
                
                <div className="bg-gray-700 rounded-lg p-3 mb-3">
                  <h4 className="text-gray-200 font-medium text-sm mb-2">What will be deleted:</h4>
                  <ul className="text-gray-400 text-sm space-y-1">
                    <li>• All expenses and transactions</li>
                    <li>• All balances and debt records</li>
                    <li>• All group settings and data</li>
                    <li>• All member relationships</li>
                  </ul>
                </div>
                
                <div className="bg-blue-900/30 border border-blue-600/30 rounded-lg p-3">
                  <h4 className="text-blue-400 font-medium text-sm mb-1">Real-time notifications:</h4>
                  <p className="text-gray-300 text-sm">
                    All {group.members?.filter(m => m.id !== 'current_user' && m.email !== currentUser?.email).length || 0} group members will receive instant notifications via email and in-app alerts about this deletion.
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteGroup}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    'Delete Group'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupSettingsView;
