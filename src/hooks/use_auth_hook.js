// src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import { 
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
  resetPassword,
  onAuthStateChange
} from '../config/firebase';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    console.log('Setting up auth state listener...');
    const unsubscribe = onAuthStateChange((user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
      setUser(user);
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up auth state listener...');
      unsubscribe();
    };
  }, []);

  // Sign in with Google
  const handleGoogleSignIn = async () => {
    try {
      console.log('Starting Google sign-in...');
      setError(null);
      setLoading(true);
      const result = await signInWithGoogle();
      console.log('Google sign-in result:', result);
      if (!result.success) {
        setError(result.error);
        throw new Error(result.error);
      }
      console.log('Google sign-in successful');
      return result.user;
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email and password
  const handleEmailSignIn = async (email, password) => {
    try {
      console.log('Starting email sign-in...');
      setError(null);
      setLoading(true);
      const result = await signInWithEmail(email, password);
      console.log('Email sign-in result:', result);
      if (!result.success) {
        setError(result.error);
        throw new Error(result.error);
      }
      console.log('Email sign-in successful');
      return result.user;
    } catch (error) {
      console.error('Email sign-in error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email and password
  const handleEmailSignUp = async (email, password, displayName) => {
    try {
      console.log('Starting email sign-up...');
      setError(null);
      setLoading(true);
      const result = await signUpWithEmail(email, password, displayName);
      console.log('Email sign-up result:', result);
      if (!result.success) {
        setError(result.error);
        throw new Error(result.error);
      }
      console.log('Email sign-up successful');
      return result.user;
    } catch (error) {
      console.error('Email sign-up error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      console.log('Starting sign-out...');
      setError(null);
      const result = await signOutUser();
      console.log('Sign-out result:', result);
      if (!result.success) {
        setError(result.error);
        throw new Error(result.error);
      }
      console.log('Sign-out successful');
    } catch (error) {
      console.error('Sign-out error:', error);
      setError(error.message);
      throw error;
    }
  };

  // Reset password
  const handleResetPassword = async (email) => {
    try {
      console.log('Starting password reset...');
      setError(null);
      const result = await resetPassword(email);
      console.log('Password reset result:', result);
      if (!result.success) {
        setError(result.error);
        throw new Error(result.error);
      }
      console.log('Password reset successful');
    } catch (error) {
      console.error('Password reset error:', error);
      setError(error.message);
      throw error;
    }
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return '';
    return user.displayName || user.email?.split('@')[0] || 'User';
  };

  // Get user email
  const getUserEmail = () => {
    return user?.email || '';
  };

  // Get user photo URL
  const getUserPhotoURL = () => {
    return user?.photoURL || '';
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return {
    user,
    loading,
    error,
    signInWithGoogle: handleGoogleSignIn,
    signInWithEmail: handleEmailSignIn,
    signUpWithEmail: handleEmailSignUp,
    signOutUser: handleSignOut,
    resetPassword: handleResetPassword,
    getUserDisplayName,
    getUserEmail,
    getUserPhotoURL,
    clearError,
    isAuthenticated: !!user
  };
};
