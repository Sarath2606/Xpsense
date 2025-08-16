// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCISg_gPZvBTSyRD_VxYHYzaIYKaBq8TI8",
  authDomain: "xpenses-2453a.firebaseapp.com",
  projectId: "xpenses-2453a",
  storageBucket: "xpenses-2453a.firebasestorage.app",
  messagingSenderId: "76919416089",
  appId: "1:76919416089:web:77d2ce565514427bb19188",
  measurementId: "G-QWZZT1NRTB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Authentication functions
export const signInWithGoogle = async () => {
  try {
    console.log('Firebase: Starting Google sign-in popup...');
    const result = await signInWithPopup(auth, googleProvider);
    console.log('Firebase: Google sign-in successful:', result.user.email);
    return { success: true, user: result.user };
  } catch (error) {
    console.error('Firebase: Google sign-in error:', error);
    return { success: false, error: error.message };
  }
};

export const signInWithEmail = async (email, password) => {
  try {
    console.log('Firebase: Starting email sign-in...');
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('Firebase: Email sign-in successful:', result.user.email);
    return { success: true, user: result.user };
  } catch (error) {
    console.error('Firebase: Email sign-in error:', error);
    return { success: false, error: error.message };
  }
};

export const signUpWithEmail = async (email, password, displayName) => {
  try {
    console.log('Firebase: Starting email sign-up...');
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with display name
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    
    console.log('Firebase: Email sign-up successful:', result.user.email);
    return { success: true, user: result.user };
  } catch (error) {
    console.error('Firebase: Email sign-up error:', error);
    return { success: false, error: error.message };
  }
};

export const signOutUser = async () => {
  try {
    console.log('Firebase: Starting sign-out...');
    await signOut(auth);
    console.log('Firebase: Sign-out successful');
    return { success: true };
  } catch (error) {
    console.error('Firebase: Sign-out error:', error);
    return { success: false, error: error.message };
  }
};

export const resetPassword = async (email) => {
  try {
    console.log('Firebase: Starting password reset...');
    await sendPasswordResetEmail(auth, email);
    console.log('Firebase: Password reset email sent');
    return { success: true };
  } catch (error) {
    console.error('Firebase: Password reset error:', error);
    return { success: false, error: error.message };
  }
};

// Auth state observer
export const onAuthStateChange = (callback) => {
  console.log('Firebase: Setting up auth state observer...');
  return onAuthStateChanged(auth, (user) => {
    console.log('Firebase: Auth state changed:', user ? `User: ${user.email}` : 'No user');
    callback(user);
  });
};

export default app;
