import { Request, Response, NextFunction } from 'express';
import { verifyFirebaseToken } from '../config/firebase';
import { logger } from '../utils/logger';
import { AppError } from './error.middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface FirebaseAuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string;
    firebaseUid: string;
  };
}

export const authenticateFirebaseToken = async (
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
        const userEmail = 'smilysarath26@gmail.com';
        
        // Find or create user in database for development
        const dbUser = await prisma.user.upsert({
          where: { email: userEmail },
          update: {
            name: 'Development User',
            firebaseUid: 'dev-firebase-uid'
          },
          create: {
            email: userEmail,
            name: 'Development User',
            firebaseUid: 'dev-firebase-uid'
          }
        });

        req.user = {
          id: dbUser.id, // Use database user ID
          email: dbUser.email,
          name: dbUser.name || undefined,
          firebaseUid: dbUser.firebaseUid || 'dev-firebase-uid'
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

    // For development, verify the Firebase token properly but allow any valid token
    if (process.env.NODE_ENV === 'development') {
      try {
        // Verify Firebase ID token even in development
        const decodedToken = await verifyFirebaseToken(token);
        const userEmail = (decodedToken.email || '').toLowerCase();
        
        // Find or create user in database using real Firebase data
        const dbUser = await prisma.user.upsert({
          where: { email: userEmail },
          update: {
            name: decodedToken.name || userEmail.split('@')[0],
            firebaseUid: decodedToken.uid
          },
          create: {
            email: userEmail,
            name: decodedToken.name || userEmail.split('@')[0],
            firebaseUid: decodedToken.uid
          }
        });

        req.user = {
          id: dbUser.id, // Use database user ID
          email: dbUser.email,
          name: dbUser.name || undefined,
          firebaseUid: dbUser.firebaseUid || decodedToken.uid
        };

        logger.info(`Development Firebase authentication successful for user: ${req.user.email}`);
        return next();
      } catch (error) {
        logger.error('Development Firebase token verification failed:', error);
        return next({
          name: 'FirebaseAuthError',
          message: 'Invalid Firebase token in development',
          statusCode: 401,
        } as AppError);
      }
    }

    // Verify Firebase ID token (for production)
    verifyFirebaseToken(token)
      .then(async (decodedToken) => {
        const userEmail = (decodedToken.email || '').toLowerCase();
        
        // Find or create user in database
        const dbUser = await prisma.user.upsert({
          where: { email: userEmail },
          update: {
            name: decodedToken.name || userEmail.split('@')[0],
            firebaseUid: decodedToken.uid
          },
          create: {
            email: userEmail,
            name: decodedToken.name || userEmail.split('@')[0],
            firebaseUid: decodedToken.uid
          }
        });

        // Map Firebase user to our user format using database user ID
        req.user = {
          id: dbUser.id, // Use database user ID
          email: dbUser.email,
          name: dbUser.name || undefined,
          firebaseUid: dbUser.firebaseUid || decodedToken.uid
        };

        logger.info(`Firebase token verified for user: ${decodedToken.email}`);
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
