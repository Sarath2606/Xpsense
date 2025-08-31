// src/components/auth/LoginScreen.js
import React from 'react';
import { Chrome } from 'lucide-react';

const LoginScreen = ({ onSignIn, loading, error }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-sm w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img 
              src="/logo.svg" 
              alt="Xpenses Logo" 
              className="h-20 w-auto object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Xpenses</h1>
          <p className="text-gray-600">Your smart financial companion</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to continue managing your finances</p>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={onSignIn}
            disabled={loading}
            className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-medium py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            ) : (
              <Chrome className="w-5 h-5 text-blue-600" />
            )}
            <span>{loading ? 'Signing in...' : 'Continue with Google'}</span>
          </button>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Features */}
          <div className="mt-8 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-sm font-bold">✓</span>
              </div>
              <span className="text-gray-700 text-sm">Secure Google authentication</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-sm font-bold">✓</span>
              </div>
              <span className="text-gray-700 text-sm">Your data stays private</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-sm font-bold">✓</span>
              </div>
              <span className="text-gray-700 text-sm">AI-powered insights</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-xs">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
