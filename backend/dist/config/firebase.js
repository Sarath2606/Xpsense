"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyFirebaseToken = exports.getFirebaseAuth = void 0;
const admin = __importStar(require("firebase-admin"));
const logger_1 = require("../utils/logger");
const initializeFirebase = () => {
    try {
        if (admin.apps.length > 0) {
            return admin.apps[0];
        }
        if (!process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
            logger_1.logger.warn('Firebase credentials not found in environment variables. Skipping Firebase initialization for development.');
            return null;
        }
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
        const app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: process.env.FIREBASE_PROJECT_ID || 'xpenses-2453a'
        });
        logger_1.logger.info('Firebase Admin SDK initialized successfully');
        return app;
    }
    catch (error) {
        logger_1.logger.error('Failed to initialize Firebase Admin SDK:', error);
        logger_1.logger.warn('Continuing without Firebase for development...');
        return null;
    }
};
const getFirebaseAuth = () => {
    const app = initializeFirebase();
    if (!app) {
        logger_1.logger.warn('Firebase not initialized - returning null auth instance');
        return null;
    }
    return admin.auth(app);
};
exports.getFirebaseAuth = getFirebaseAuth;
const verifyFirebaseToken = async (idToken) => {
    try {
        const auth = (0, exports.getFirebaseAuth)();
        if (!auth) {
            logger_1.logger.warn('Firebase auth not available - skipping token verification for development');
            return {
                uid: 'dev-user-id',
                email: 'dev@example.com',
                name: 'Development User',
                picture: null
            };
        }
        const decodedToken = await auth.verifyIdToken(idToken);
        logger_1.logger.info(`Firebase token verified for user: ${decodedToken.email}`);
        return {
            uid: decodedToken.uid,
            email: decodedToken.email,
            name: decodedToken.name,
            picture: decodedToken.picture
        };
    }
    catch (error) {
        logger_1.logger.error('Firebase token verification failed:', error);
        throw error;
    }
};
exports.verifyFirebaseToken = verifyFirebaseToken;
exports.default = initializeFirebase;
//# sourceMappingURL=firebase.js.map