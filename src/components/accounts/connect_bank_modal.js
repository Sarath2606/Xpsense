import React, { useState } from 'react';
import { useBackendAuth } from '../../hooks/use_backend_auth';

const ConnectBankModal = ({ isOpen, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState('init'); // 'init', 'oauth', 'success', 'error'
  const [oauthUrl, setOauthUrl] = useState('');
  const [error, setError] = useState('');
  
  const { initiateOAuth } = useBackendAuth();

  const handleConnectBank = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await initiateOAuth();
      setOauthUrl(response.oauthUrl);
      setStep('oauth');
    } catch (error) {
      setError(error.message || 'Failed to initiate bank connection');
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthRedirect = () => {
    if (oauthUrl) {
      window.open(oauthUrl, '_blank', 'width=600,height=700');
    }
  };

  const handleClose = () => {
    setStep('init');
    setError('');
    setOauthUrl('');
    onClose();
  };

  const handleSuccess = () => {
    setStep('success');
    if (onSuccess) {
      onSuccess();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {step === 'init' && (
            <>
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 text-center mt-4">
                Connect Your Bank Account
              </h3>
              <p className="text-sm text-gray-500 text-center mt-2">
                Securely connect your bank account to automatically import transactions and track your spending.
              </p>
              
              <div className="mt-6 space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">What you'll get:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Automatic transaction import</li>
                    <li>• Real-time balance updates</li>
                    <li>• Secure OAuth connection</li>
                    <li>• No password sharing</li>
                  </ul>
                </div>
                
                <button
                  onClick={handleConnectBank}
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Connecting...
                    </>
                  ) : (
                    'Connect Bank Account'
                  )}
                </button>
              </div>
            </>
          )}

          {step === 'oauth' && (
            <>
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 text-center mt-4">
                Complete Bank Authorization
              </h3>
              <p className="text-sm text-gray-500 text-center mt-2">
                Click the button below to securely authorize access to your bank account.
              </p>
              
              <div className="mt-6 space-y-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-yellow-900 mb-2">Next steps:</h4>
                  <ol className="text-sm text-yellow-800 space-y-1">
                    <li>1. Click "Authorize Access" below</li>
                    <li>2. Complete authentication with your bank</li>
                    <li>3. Select the accounts you want to connect</li>
                    <li>4. Return here when complete</li>
                  </ol>
                </div>
                
                <button
                  onClick={handleOAuthRedirect}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Authorize Access
                </button>
                
                <button
                  onClick={handleSuccess}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  I've Completed Authorization
                </button>
              </div>
            </>
          )}

          {step === 'success' && (
            <>
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 text-center mt-4">
                Bank Account Connected!
              </h3>
              <p className="text-sm text-gray-500 text-center mt-2">
                Your bank account has been successfully connected. You can now view your transactions and balances.
              </p>
              
              <div className="mt-6">
                <button
                  onClick={handleClose}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {step === 'error' && (
            <>
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 text-center mt-4">
                Connection Failed
              </h3>
              <p className="text-sm text-gray-500 text-center mt-2">
                {error || 'There was an error connecting your bank account. Please try again.'}
              </p>
              
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => setStep('init')}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Try Again
                </button>
                
                <button
                  onClick={handleClose}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              </div>
            </>
          )}

          {step !== 'oauth' && step !== 'success' && (
            <div className="mt-4">
              <button
                onClick={handleClose}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectBankModal;
