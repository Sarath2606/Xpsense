import React, { useState, useEffect } from 'react';
import ProfilePicture from '../common/ProfilePicture';
import { useSplitwiseApi } from '../../hooks/use_splitwise_api';

const AddMemberPage = ({ group, onBack, onMemberAdded }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentGroup, setCurrentGroup] = useState(group);
  const [refreshingMembers, setRefreshingMembers] = useState(false);
  
  const { groups: groupsApi } = useSplitwiseApi();

  // Update current group when the group prop changes
  useEffect(() => {
    setCurrentGroup(group);
  }, [group]);

  // Function to refresh group data
  const refreshGroupData = async () => {
    setRefreshingMembers(true);
    try {
      const updatedGroup = await groupsApi.getById(currentGroup.id);
      setCurrentGroup(updatedGroup.group);
    } catch (err) {
      console.error('Failed to refresh group data:', err);
    } finally {
      setRefreshingMembers(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await groupsApi.addMember(currentGroup.id, {
        email: email.trim(),
        role
      });
      
      // Call the callback to update the parent component
      onMemberAdded(response.member);
      
      // Refresh group data to get the latest member list
      await refreshGroupData();
      
      // Show success message
      setSuccess(`Successfully added ${email.trim()} as ${role}`);
      
      // Reset form
      setEmail('');
      setRole('member');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Failed to add member:', err);
      setError(err.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setEmail('');
    setRole('member');
    setError(null);
    setSuccess(null);
    onBack();
  };

  return (
    <div className="w-full">
      {/* Header with Back Button */}
      <div className="mb-6">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Back to Group</span>
        </button>
        
        {/* Centered Heading */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white">Add New Member</h2>
          <p className="text-gray-400 mt-2">Invite someone to join your group</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-3">
              {/* Success Display */}
              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-green-800 font-medium">{success}</span>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-800 font-medium">{error}</span>
                  </div>
                </div>
              )}

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter member's email address"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                The user must have an account with this email address
              </p>
            </div>

            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Admins can add/remove members and manage the group
              </p>
            </div>

            {/* Current Members Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-semibold text-gray-800">Current Members</h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    {currentGroup.members.length}
                  </span>
                </div>
                {refreshingMembers && (
                  <div className="flex items-center text-xs text-gray-500">
                    <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </div>
                )}
              </div>
              <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                {currentGroup.members.length === 0 ? (
                  <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-sm">No members yet</p>
                  </div>
                ) : (
                  <div className="max-h-40 overflow-y-auto">
                    {currentGroup.members.map((member, index) => {
                      console.log(`🔍 Member ${index + 1}:`, member);
                      const displayName = member.name || member.email || member.user?.name || member.user?.email || 'Unknown';
                      const displayEmail = member.email || member.user?.email || 'No email';
                      const initial = displayName.charAt(0).toUpperCase();
                      
                      return (
                        <div key={member.id} className={`flex items-center justify-between p-3 bg-white border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${index === 0 ? 'border-t-0' : ''}`}>
                          <div className="flex items-center flex-1 min-w-0">
                            <ProfilePicture
                              email={displayEmail}
                              name={displayName}
                              size="md"
                              isAdmin={member.role === 'admin'}
                              className="mr-3 flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-gray-900 text-sm truncate">
                                {displayName}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {displayEmail}
                              </div>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide flex-shrink-0 ml-2 ${
                            member.role === 'admin' 
                              ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                              : 'bg-gray-100 text-gray-700 border border-gray-200'
                          }`}>
                            {member.role}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-3">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding Member...
                  </>
                ) : (
                  'Add Member'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMemberPage;
