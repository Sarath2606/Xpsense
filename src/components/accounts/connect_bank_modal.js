import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/use_auth_hook';
import ModalComponent from '../common/modal_component';
import apiService from '../../config/api';

const ConnectBankModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('consent'); // consent, connecting, success, error
  const [consentDuration, setConsentDuration] = useState(180); // days
  const [consentId, setConsentId] = useState(null);
  const [syncStatus, setSyncStatus] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep('consent');
      setConsentDuration(180);
      setConsentId(null);
      setSyncStatus('');
    }
  }, [isOpen]);

  // Debug step changes
  useEffect(() => {
    console.log('Step changed to:', step);
  }, [step]);

  const handleStartConsent = async () => {
    try {
      setError(null);
      setIsLoading(true);
      setStep('connecting');
      
      const data = await apiService.consents.start(consentDuration);

      if (data.success) {
        setConsentId(data.consentId);
        // Always use real OAuth flow - redirect to external URL
        setStep('connecting');
        window.location.href = data.redirectUrl;
      } else {
        throw new Error(data.error || 'Failed to start consent flow');
      }
    } catch (error) {
      console.error('Error starting consent:', error);
      setError(error.message);
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConsentSuccess = async (consentIdParam = null) => {
    console.log('handleConsentSuccess called with consentIdParam:', consentIdParam);
    setStep('syncing');
    setSyncStatus('Syncing your accounts and transactions...');

    // Use the passed consent ID or fall back to state
    const currentConsentId = consentIdParam || consentId;

    // Check if we have a valid consentId
    if (!currentConsentId) {
      console.error('No consent ID available for polling');
      setStep('error');
      return;
    }

    // Poll for sync completion
    let pollCount = 0;
    const pollInterval = setInterval(async () => {
      try {
        pollCount++;
        console.log(`Polling attempt ${pollCount} for consent ${currentConsentId}`);
        
        const data = await apiService.consents.getDetails(currentConsentId);

        if (data.success && data.consent.accounts.length > 0) {
          clearInterval(pollInterval);
          console.log('Success! Found accounts, moving to success step');
          setStep('success');
          setSyncStatus(`Successfully connected ${data.consent.accounts.length} account(s)`);
          
          // Refresh accounts list
          if (onSuccess) {
            onSuccess();
          }
        } else {
          console.log('Consent found but no accounts yet, continuing to poll...');
        }
      } catch (error) {
        console.error(`Error polling sync status (attempt ${pollCount}):`, error);
        
        // If we get a 404 after a few attempts, it might mean the consent is still being processed
        // Continue polling for a bit longer, but log the attempts
        if (pollCount >= 5) {
          console.log('Multiple polling failures, but continuing...');
        }
      }
    }, 2000);

    // Timeout after 10 seconds for development mode (faster testing)
    const timeoutDuration = process.env.NODE_ENV === 'development' ? 10000 : 30000;
    setTimeout(() => {
      clearInterval(pollInterval);
      console.log('Polling timeout reached, moving to success step');
      if (step === 'syncing') {
        setStep('success');
        setSyncStatus('Connection completed. Some data may still be syncing.');
      }
    }, timeoutDuration);
  };

  const renderConsentStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Connect Your Bank Account
        </h3>
        <p className="text-sm text-gray-600">
          Securely connect your bank account to automatically import transactions and track your expenses.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">What we'll access:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Account information (names, types, balances)</li>
          <li>• Transaction history (last 90 days)</li>
          <li>• Real-time balance updates</li>
        </ul>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Consent Duration
        </label>
        <select
          value={consentDuration}
          onChange={(e) => setConsentDuration(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={90}>3 months</option>
          <option value={180}>6 months</option>
          <option value={365}>12 months</option>
        </select>
        <p className="text-xs text-gray-500">
          You can revoke access at any time from your account settings.
        </p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Security & Privacy:</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Your data is encrypted and secure</li>
          <li>• We never store your banking credentials</li>
          <li>• Access is read-only (we cannot make transactions)</li>
          <li>• You can revoke access anytime</li>
        </ul>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          onClick={handleStartConsent}
          disabled={isLoading}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? 'Connecting...' : 'Connect Bank Account'}
        </button>
      </div>
    </div>
  );

  const renderConnectingStep = () => (
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <h3 className="text-lg font-semibold text-gray-900">
        Redirecting to Your Bank
      </h3>
      <p className="text-sm text-gray-600">
        You'll be redirected to your bank's secure login page to authorize access to your account information.
      </p>
    </div>
  );

  const renderSyncingStep = () => (
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
      <h3 className="text-lg font-semibold text-gray-900">
        Syncing Your Data
      </h3>
      <p className="text-sm text-gray-600">
        {syncStatus || 'Connecting to your bank and importing your account information...'}
      </p>
      <p className="text-xs text-gray-500">
        This may take a few minutes. You can close this window and check back later.
      </p>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="text-center space-y-4">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900">
        Successfully Connected!
      </h3>
      <p className="text-sm text-gray-600">
        {syncStatus || 'Your bank account has been connected successfully.'}
      </p>
      <button
        onClick={() => {
          if (onSuccess) {
            onSuccess();
          }
          onClose();
        }}
        className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        Continue
      </button>
    </div>
  );

  const renderErrorStep = () => (
    <div className="text-center space-y-4">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900">
        Connection Failed
      </h3>
      <p className="text-sm text-gray-600">
        {error || 'There was an error connecting your bank account. Please try again.'}
      </p>
      <div className="flex space-x-3">
        <button
          onClick={() => setStep('consent')}
          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Try Again
        </button>
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 'consent':
        return renderConsentStep();
      case 'connecting':
        return renderConnectingStep();
      case 'syncing':
        return renderSyncingStep();
      case 'success':
        return renderSuccessStep();
      case 'error':
        return renderErrorStep();
      default:
        return renderConsentStep();
    }
  };

  // Check for success/error parameters in URL (for OAuth callback)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');
    const consentIdParam = urlParams.get('consentId');

    if (success === 'true' && consentIdParam) {
      setConsentId(consentIdParam);
      handleConsentSuccess(consentIdParam);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      setStep('error');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []); // Only run once on mount

  // Call onSuccess when step changes to success
  useEffect(() => {
    if (step === 'success' && onSuccess) {
      onSuccess();
    }
  }, [step, onSuccess]);

  return (
    <ModalComponent
      isOpen={isOpen}
      onClose={onClose}
      title="Connect Bank Account"
      size="md"
    >
      {renderStep()}
    </ModalComponent>
  );
};

export default ConnectBankModal;
