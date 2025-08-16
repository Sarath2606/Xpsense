// src/components/auth/AuthModal.js
import React, { useState } from 'react';
import { Chrome, Eye, EyeOff, X, Mail, Lock, User, ArrowLeft } from 'lucide-react';

const AuthModal = ({ isOpen, onClose, onGoogleSignIn, onEmailSignIn, onEmailSignUp, onResetPassword, loading, error }) => {
  const [authMode, setAuthMode] = useState('login'); // 'login', 'signup', 'reset'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailError, setEmailError] = useState(null);

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setEmailError(null);
      await onGoogleSignIn();
    } catch (error) {
      console.error('Google sign-in error:', error);
      setEmailError(error.message || 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setEmailLoading(true);
    setEmailError(null);
    
    try {
      if (authMode === 'login') {
        await onEmailSignIn(email, password);
      } else if (authMode === 'signup') {
        await onEmailSignUp(email, password, displayName);
      } else if (authMode === 'reset') {
        await onResetPassword(email);
        setEmailError("Password reset email sent! Check your inbox.");
      }
    } catch (error) {
      setEmailError(error.message || "Authentication failed");
    } finally {
      setEmailLoading(false);
    }
  };

  const switchToSignUp = () => {
    setAuthMode('signup');
    setEmailError(null);
  };

  const switchToLogin = () => {
    setAuthMode('login');
    setEmailError(null);
  };

  const switchToReset = () => {
    setAuthMode('reset');
    setEmailError(null);
  };

  const getTitle = () => {
    switch (authMode) {
      case 'signup': return 'Create Account';
      case 'reset': return 'Reset Password';
      default: return 'Welcome Back';
    }
  };

  const getSubtitle = () => {
    switch (authMode) {
      case 'signup': return 'Sign up to start managing your finances';
      case 'reset': return 'Enter your email to reset your password';
      default: return 'Sign in to continue managing your finances';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur flex items-center justify-center z-50 p-4">
          <div className="modal-enter w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  {authMode !== 'login' && (
                    <button 
                      onClick={switchToLogin}
                      className="scale-active p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  )}
                  <h2 className="text-2xl font-bold text-gray-900">{getTitle()}</h2>
                </div>
                <button 
                  onClick={onClose}
                  className="scale-active p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Google Sign In */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading || emailLoading || loading}
                  className="btn-smooth w-full bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 py-4 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-3 shadow-sm hover:shadow-md disabled:opacity-50"
                >
                  {googleLoading ? (
                    <div className="spinner w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                  ) : (
                    <Chrome className="w-5 h-5" />
                  )}
                  <span>{googleLoading ? 'Signing in...' : 'Continue with Google'}</span>
                </button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                  </div>
                </div>

                {/* Email/Password Form */}
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  {authMode === 'signup' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="input-smooth w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Enter your full name"
                          required={authMode === 'signup'}
                        />
                        <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input-smooth w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your email"
                        required
                      />
                      <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                  </div>

                  {authMode !== 'reset' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="input-smooth w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Enter your password"
                          required={authMode !== 'reset'}
                          minLength={authMode === 'signup' ? 6 : undefined}
                        />
                        <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="scale-active absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={emailLoading || googleLoading || loading}
                    className="btn-smooth w-full bg-gray-900 hover:bg-gray-800 text-white py-4 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-3 disabled:opacity-50"
                  >
                    {emailLoading ? (
                      <div className="spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : null}
                    <span>
                      {emailLoading 
                        ? 'Loading...' 
                        : authMode === 'login' 
                          ? 'Sign In' 
                          : authMode === 'signup' 
                            ? 'Create Account' 
                            : 'Send Reset Email'
                      }
                    </span>
                  </button>
                </form>

                {/* Mode Switcher */}
                <div className="text-center space-y-2">
                  {authMode === 'login' && (
                    <>
                      <button
                        onClick={switchToSignUp}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                      >
                        Don't have an account? Sign up
                      </button>
                      <div>
                        <button
                          onClick={switchToReset}
                          className="text-gray-600 hover:text-gray-700 text-sm transition-colors"
                        >
                          Forgot your password?
                        </button>
                      </div>
                    </>
                  )}
                  {authMode === 'signup' && (
                    <button
                      onClick={switchToLogin}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                    >
                      Already have an account? Sign in
                    </button>
                  )}
                  {authMode === 'reset' && (
                    <button
                      onClick={switchToLogin}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                    >
                      Back to sign in
                    </button>
                  )}
                </div>

                {/* Error Messages */}
                {emailError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-red-600 text-sm">{emailError}</p>
                  </div>
                )}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                {/* Terms */}
                <p className="text-xs text-gray-500 text-center">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AuthModal;
