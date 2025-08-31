import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/use_auth_hook';

const ConsentDashboard = () => {
  const { user } = useAuth();
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revokingConsent, setRevokingConsent] = useState(null);

  useEffect(() => {
    fetchConsents();
  }, []);

  const fetchConsents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/consents', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setConsents(data.consents);
      } else {
        setError(data.error || 'Failed to fetch consents');
      }
    } catch (error) {
      console.error('Error fetching consents:', error);
      setError('Failed to load consents');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeConsent = async (consentId) => {
    if (!window.confirm('Are you sure you want to revoke this consent? This will disconnect all associated bank accounts.')) {
      return;
    }

    try {
      setRevokingConsent(consentId);
      
      const response = await fetch(`/api/consents/${consentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        // Remove the revoked consent from the list
        setConsents(consents.filter(consent => consent.id !== consentId));
      } else {
        setError(data.error || 'Failed to revoke consent');
      }
    } catch (error) {
      console.error('Error revoking consent:', error);
      setError('Failed to revoke consent');
    } finally {
      setRevokingConsent(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REVOKED':
        return 'bg-red-100 text-red-800';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (days) => {
    if (days >= 365) {
      return `${Math.floor(days / 365)} year${Math.floor(days / 365) > 1 ? 's' : ''}`;
    } else if (days >= 30) {
      return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''}`;
    } else {
      return `${days} day${days > 1 ? 's' : ''}`;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (consents.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
          <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No consents found</h3>
        <p className="mt-1 text-sm text-gray-500">
          You haven't connected any bank accounts yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Connected Bank Accounts</h2>
        <p className="text-sm text-gray-500">
          Manage your bank account connections and data access permissions.
        </p>
      </div>

      <div className="space-y-4">
        {consents.map((consent) => (
          <div key={consent.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    {consent.institution}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(consent.status)}`}>
                    {consent.status}
                  </span>
                </div>
                
                <div className="mt-2 space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Connected on {formatDate(consent.createdAt)}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Expires on {formatDate(consent.expiresAt)}
                  </div>

                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    {consent.accounts.length} connected account{consent.accounts.length !== 1 ? 's' : ''}
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Data Access Permissions:</h4>
                  <div className="flex flex-wrap gap-2">
                    {consent.scopes.map((scope, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {scope.replace('bank:', '').replace(':read', '').replace('.', ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                {consent.accounts.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Connected Accounts:</h4>
                    <div className="space-y-2">
                      {consent.accounts.map((account) => (
                        <div key={account.id} className="flex items-center justify-between text-sm">
                          <div>
                            <span className="font-medium text-gray-900">{account.accountName}</span>
                            <span className="text-gray-500 ml-2">({account.accountType})</span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900">
                              {new Intl.NumberFormat('en-AU', {
                                style: 'currency',
                                currency: account.currency
                              }).format(account.balance)}
                            </div>
                            <div className="text-xs text-gray-500">
                              Last sync: {account.lastSyncAt ? formatDate(account.lastSyncAt) : 'Never'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="ml-6 flex-shrink-0">
                {consent.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleRevokeConsent(consent.id)}
                    disabled={revokingConsent === consent.id}
                    className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {revokingConsent === consent.id ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-700" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Revoking...
                      </>
                    ) : (
                      'Revoke Access'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">About Your Data</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Your banking data is encrypted and stored securely</li>
          <li>• We only access the data you've explicitly consented to</li>
          <li>• You can revoke access at any time</li>
          <li>• Data is automatically deleted when consent expires or is revoked</li>
        </ul>
      </div>
    </div>
  );
};

export default ConsentDashboard;
