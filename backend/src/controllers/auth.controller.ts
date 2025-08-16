import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { mastercardApiService } from '../services/mastercard-api.service';
import { syncService } from '../services/sync.service';
import { Encryption } from '../utils/encryption';
import { logger } from '../utils/logger';
import { asyncHandler } from '../middleware/error.middleware';

// Ensure JWT_SECRET is available
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const prisma = new PrismaClient();

export class AuthController {
  /**
   * Register a new user
   */
  register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'A user with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        // Note: We're not storing password in this schema since we're using Firebase auth
        // This is for demonstration of the backend structure
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as SignOptions
    );

    logger.info(`New user registered: ${user.email}`);

    return res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  });

  /**
   * Login user
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Verify password (if using local auth)
    // const isValidPassword = await bcrypt.compare(password, user.password);
    // if (!isValidPassword) {
    //   return res.status(401).json({
    //     error: 'Invalid credentials',
    //     message: 'Email or password is incorrect'
    //   });
    // }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as SignOptions
    );

    logger.info(`User logged in: ${user.email}`);

    return res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    });
  });

  /**
   * Get current user profile
   */
  getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }

    return res.json({
      user
    });
  });

  /**
   * Initiate OAuth flow for connecting bank account
   */
  initiateOAuth = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    // Generate state parameter for security
    const state = Encryption.generateRandomString(32);

    // Generate OAuth URL
    const oauthUrl = mastercardApiService.generateOAuthUrl(state);

    // Store state in session or database for validation
    // For now, we'll return the URL directly
    // In production, you should store the state and validate it in the callback

    logger.info(`OAuth flow initiated for user ${req.user.id}`);

    return res.json({
      message: 'OAuth flow initiated',
      oauthUrl,
      state
    });
  });

  /**
   * Handle OAuth callback
   */
  oauthCallback = asyncHandler(async (req: Request, res: Response) => {
    const { code, state, error } = req.query;

    if (error) {
      logger.error(`OAuth error: ${error}`);
      return res.status(400).json({
        error: 'OAuth error',
        message: error
      });
    }

    if (!code) {
      return res.status(400).json({
        error: 'Missing authorization code',
        message: 'Authorization code is required'
      });
    }

    try {
      // Exchange code for access token
      const tokenResponse = await mastercardApiService.exchangeCodeForToken(code as string);

      // Get user accounts from Mastercard API
      const accounts = await mastercardApiService.getAccounts(tokenResponse.access_token);

      // For now, we'll return the accounts
      // In a real implementation, you'd want to:
      // 1. Validate the state parameter
      // 2. Get the user ID from the state or session
      // 3. Connect the accounts to the user

      logger.info(`OAuth callback successful, found ${accounts.length} accounts`);

      return res.json({
        message: 'OAuth flow completed successfully',
        accounts,
        // Note: In production, you'd redirect to frontend with success message
      });
    } catch (error) {
      logger.error('OAuth callback error:', error);
      return res.status(500).json({
        error: 'OAuth callback failed',
        message: 'Failed to complete OAuth flow'
      });
    }
  });

  /**
   * Connect bank account after OAuth
   */
  connectBankAccount = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const { accountData, accessToken, refreshToken, expiresIn } = req.body;

    if (!accountData || !accessToken) {
      return res.status(400).json({
        error: 'Missing required data',
        message: 'Account data and access token are required'
      });
    }

    try {
      const connectedAccount = await syncService.connectBankAccount(
        req.user.id,
        accountData,
        accessToken,
        refreshToken,
        expiresIn
      );

      logger.info(`Bank account connected for user ${req.user.id}`);

      return res.status(201).json({
        message: 'Bank account connected successfully',
        account: {
          id: connectedAccount.id,
          accountName: connectedAccount.accountName,
          bankName: connectedAccount.bankName,
          accountType: connectedAccount.accountType
        }
      });
    } catch (error) {
      logger.error(`Failed to connect bank account for user ${req.user.id}:`, error);
      return res.status(500).json({
        error: 'Failed to connect bank account',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Refresh JWT token
   */
  refreshToken = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    // Generate new JWT token
    const token = jwt.sign(
      { userId: req.user.id, email: req.user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as SignOptions
    );

    logger.info(`Token refreshed for user ${req.user.id}`);

    return res.json({
      message: 'Token refreshed successfully',
      token
    });
  });
}

export const authController = new AuthController();
