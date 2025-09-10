import * as admin from 'firebase-admin';
import { logger } from '../utils/logger';

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length > 0) {
      return admin.apps[0];
    }

    // For development, check if Firebase credentials are available
    if (!process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      logger.warn('Firebase credentials not found in environment variables. Skipping Firebase initialization for development.');
      return null;
    }

    // For development, we'll use a service account key
    // In production, you should use environment variables or Google Cloud credentials
    const serviceAccount = {
      type: process.env.FIREBASE_TYPE || 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID || 'xpenses-2453a',
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
      token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
    };

    // Initialize the app
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || 'xpenses-2453a'
    });

    logger.info('Firebase Admin SDK initialized successfully');
    return app;
  } catch (error) {
    logger.error('Failed to initialize Firebase Admin SDK:', error);
    logger.warn('Continuing without Firebase for development...');
    return null;
  }
};

// Get Firebase Auth instance
export const getFirebaseAuth = () => {
  const app = initializeFirebase();
  if (!app) {
    logger.warn('Firebase not initialized - returning null auth instance');
    return null;
  }
  return admin.auth(app);
};

// Verify Firebase ID token
export const verifyFirebaseToken = async (idToken: string) => {
  try {
    const auth = getFirebaseAuth();
    if (!auth) {
      logger.warn('Firebase auth not available - skipping token verification for development');
      // For development without Firebase, return a mock user
      return {
        uid: 'dev-user-id',
        email: 'dev@example.com',
        name: 'Development User',
        picture: null
      };
    }
    
    const decodedToken = await auth.verifyIdToken(idToken);
    
    logger.info(`Firebase token verified for user: ${decodedToken.email}`);
    
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture
    };
  } catch (error) {
    logger.error('Firebase token verification failed:', error);
    throw error;
  }
};

export default initializeFirebase;
