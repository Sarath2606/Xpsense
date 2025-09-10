import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { AppError } from './error.middleware';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string; // stays optional, never null
  };
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next({
        name: 'UnauthorizedError',
        message: 'Access token required',
        statusCode: 401,
      } as AppError);
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      logger.error('JWT_SECRET not configured');
      return next({
        name: 'ConfigError',
        message: 'Server configuration error',
        statusCode: 500,
      } as AppError);
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id?: string;
      userId?: string;
      email: string;
      name?: string | null;
    };

    // Validate that we have a user ID
    const userId = decoded.id || decoded.userId;
    if (!userId) {
      return next({
        name: 'AuthError',
        message: 'Invalid token: missing user ID',
        statusCode: 401,
      } as AppError);
    }

    // enforce name?: string (no null)
    const user = {
      id: userId,
      email: decoded.email,
      name: decoded.name || undefined,
    };

    req.user = user;
    return next();
  } catch (error) {
    logger.error('Token verification failed:', error);

    if (error instanceof jwt.TokenExpiredError) {
      return next({
        name: 'TokenExpiredError',
        message: 'Token expired',
        statusCode: 401,
      } as AppError);
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return next({
        name: 'JsonWebTokenError',
        message: 'Invalid token',
        statusCode: 401,
      } as AppError);
    }

    return next({
      name: 'AuthError',
      message: 'Token verification failed',
      statusCode: 500,
    } as AppError);
  }
};

export const optionalAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return next();

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) return next();

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      name?: string | null;
    };

    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name || undefined,
    };

    return next();
  } catch {
    // In optional auth, ignore errors
    return next();
  }
};
