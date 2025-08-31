import { Request, Response, NextFunction } from 'express';
import { verifyFirebaseToken } from '../config/firebase';
import { logger } from '../utils/logger';
import { AppError } from './error.middleware';

export interface FirebaseAuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string;
    firebaseUid: string;
  };
}

export const authenticateFirebaseToken = (
  req: FirebaseAuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      // In development mode, create a mock user even without a token
      if (process.env.NODE_ENV === 'development') {
        req.user = {
          id: 'cmefafb0j0000j8dmmu9tlkmp', // Use the actual database user ID
          email: 'smilysarath26@gmail.com',
          name: 'Development User',
          firebaseUid: 'dev-firebase-uid'
        };

        logger.info(`Development authentication successful for user: ${req.user.email} (no token provided)`);
        return next();
      }
      
      return next({
        name: 'UnauthorizedError',
        message: 'Access token required',
        statusCode: 401,
      } as AppError);
    }

    // For development, accept any token and create a mock user
    // In production, you should verify the Firebase token properly
    if (process.env.NODE_ENV === 'development') {
      // Create a mock user for development
      req.user = {
        id: 'cmefafb0j0000j8dmmu9tlkmp', // Use the actual database user ID
        email: 'smilysarath26@gmail.com',
        name: 'Development User',
        firebaseUid: 'dev-firebase-uid'
      };

      logger.info(`Development authentication successful for user: ${req.user.email}`);
      return next();
    }

    // Verify Firebase ID token (for production)
    verifyFirebaseToken(token)
      .then((decodedToken) => {
        // Map Firebase user to our user format
        req.user = {
          id: decodedToken.uid, // Use Firebase UID as user ID
          email: decodedToken.email || '',
          name: decodedToken.name || undefined,
          firebaseUid: decodedToken.uid
        };

        logger.info(`Firebase authentication successful for user: ${decodedToken.email}`);
        return next();
      })
      .catch((error) => {
        logger.error('Firebase token verification failed:', error);
        
        return next({
          name: 'FirebaseAuthError',
          message: 'Invalid Firebase token',
          statusCode: 401,
        } as AppError);
      });
  } catch (error) {
    logger.error('Firebase authentication middleware error:', error);
    
    return next({
      name: 'AuthError',
      message: 'Authentication failed',
      statusCode: 500,
    } as AppError);
  }
};

export const optionalFirebaseAuth = (
  req: FirebaseAuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next();
    }

    // Verify Firebase ID token
    verifyFirebaseToken(token)
      .then((decodedToken) => {
        // Map Firebase user to our user format
        req.user = {
          id: decodedToken.uid,
          email: decodedToken.email || '',
          name: decodedToken.name || undefined,
          firebaseUid: decodedToken.uid
        };

        logger.info(`Optional Firebase authentication successful for user: ${decodedToken.email}`);
        return next();
      })
      .catch(() => {
        // In optional auth, ignore errors and continue
        return next();
      });
  } catch {
    // In optional auth, ignore errors and continue
    return next();
  }
};
