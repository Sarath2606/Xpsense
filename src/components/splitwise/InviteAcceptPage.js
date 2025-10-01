import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/use_auth_hook';
import apiService from '../../config/api';

const InviteAcceptPage = ({ onBack, onInviteAccepted }) => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [groupInfo, setGroupInfo] = useState(null);

  useEffect(() => {
    const handleInviteAcceptance = async () => {
      try {
        // Get token from URL parameters - check both search params and hash
        const urlParams = new URLSearchParams(window.location.search);
        let token = urlParams.get('token');
        
        // If no token in search params, check hash fragment
        if (!token && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
          token = hashParams.get('token');
        }

        if (!token) {
          setError('No invitation token found in the URL');
          setLoading(false);
          return;
        }

        if (!isAuthenticated) {
          setError('Please sign in to accept the invitation');
          setLoading(false);
          // Store the token in localStorage so we can use it after login
          localStorage.setItem('pendingInviteToken', token);
          return;
        }

        console.log('🎯 Accepting invitation with token:', token);
        console.log('🔍 Current URL:', window.location.href);
        console.log('🔍 URL search params:', window.location.search);
        console.log('🔍 URL hash:', window.location.hash);
        console.log('🔍 User authenticated:', isAuthenticated);
        console.log('🔍 User email:', user?.email);

        // Accept the invitation
        const response = await apiService.splitwise.invites.acceptInvite(token);
        
        console.log('✅ Invitation accepted successfully:', response);
        
        setSuccess('Successfully joined the group!');
        setGroupInfo(response.group);
        
        // Call the callback if provided
        onInviteAccepted?.(response);
        
        // Redirect to Splitwise view after 3 seconds
        setTimeout(() => {
          window.location.href = '/#splitwise';
        }, 3000);

      } catch (err) {
        console.error('❌ Failed to accept invitation:', err);
        let errorMessage = 'Failed to accept invitation. The invitation may be expired or invalid.';
        
        if (err.message) {
          if (err.message.includes('Email mismatch')) {
            errorMessage = 'This invitation was sent to a different email address. Please log in with the email address that received the invitation.';
          } else if (err.message.includes('already a member')) {
            errorMessage = 'You are already a member of this group.';
          } else if (err.message.includes('expired')) {
            errorMessage = 'This invitation has expired. Please request a new invitation.';
          } else if (err.message.includes('Authentication required')) {
            errorMessage = 'Please sign in to accept the invitation.';
          } else {
            errorMessage = err.message;
          }
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    // Check if we have a pending token from localStorage (after login)
    const pendingToken = localStorage.getItem('pendingInviteToken');
    if (pendingToken && isAuthenticated) {
      // Clear the pending token and process it
      localStorage.removeItem('pendingInviteToken');
      // Update the URL to include the token
      const newUrl = new URL(window.location);
      newUrl.searchParams.set('token', pendingToken);
      window.history.replaceState({}, '', newUrl);
    }

    handleInviteAcceptance();
  }, [isAuthenticated, onInviteAccepted]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing your invitation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Group Invitation</h1>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm text-green-600">{success}</p>
              </div>
            </div>
          )}

          {groupInfo && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Welcome to "{groupInfo.name}"!</h3>
              <p className="text-sm text-blue-700">
                You've successfully joined the group. You'll be redirected to the Splitwise section shortly.
              </p>
            </div>
          )}

          {!isAuthenticated && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700">
                Please sign in to your account to accept this invitation.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-3">
          {error && (
            <button
              onClick={() => window.location.href = '/#splitwise'}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go to Splitwise
            </button>
          )}
          
          {success && (
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Redirecting to Splitwise in 3 seconds...
              </p>
            </div>
          )}

          {!isAuthenticated && (
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InviteAcceptPage;
