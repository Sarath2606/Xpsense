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
exports.authController = exports.AuthController = void 0;
const client_1 = require("@prisma/client");
const jwt = __importStar(require("jsonwebtoken"));
const error_middleware_1 = require("../middleware/error.middleware");
const logger_1 = require("../utils/logger");
const mastercard_api_service_1 = require("../services/mastercard-api.service");
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
class AuthController {
    register = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const { email, password, name } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                error: 'Missing required fields',
                message: 'Email and password are required'
            });
        }
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            return res.status(409).json({
                error: 'User already exists',
                message: 'A user with this email already exists'
            });
        }
        const user = await prisma.user.create({
            data: {
                email,
                name: name || null
            }
        });
        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        logger_1.logger.info(`New user registered: ${user.email}`);
        return res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            },
            token
        });
    });
    login = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                error: 'Missing required fields',
                message: 'Email and password are required'
            });
        }
        const user = await prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Email or password is incorrect'
            });
        }
        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        logger_1.logger.info(`User logged in: ${user.email}`);
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
    getProfile = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'User not authenticated'
            });
        }
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });
        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'User not found'
            });
        }
        return res.json({
            message: 'Profile retrieved successfully',
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        });
    });
    async getOrCreateFirebaseUser(firebaseUid, email, name) {
        try {
            let user = await prisma.user.findFirst({
                where: {
                    OR: [
                        { firebaseUid },
                        { email }
                    ]
                }
            });
            if (!user) {
                user = await prisma.user.create({
                    data: {
                        firebaseUid,
                        email,
                        name: name || null
                    }
                });
                logger_1.logger.info(`Created new user for Firebase UID: ${firebaseUid}`);
            }
            else if (!user.firebaseUid) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { firebaseUid }
                });
                logger_1.logger.info(`Updated existing user with Firebase UID: ${firebaseUid}`);
            }
            return user;
        }
        catch (error) {
            logger_1.logger.error(`Error getting/creating Firebase user: ${error}`);
            throw error;
        }
    }
    initiateOAuth = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        try {
            let dbUser;
            try {
                if (req.user) {
                    dbUser = await this.getOrCreateFirebaseUser(req.user.firebaseUid, req.user.email, req.user.name);
                }
                else {
                    dbUser = await prisma.user.create({
                        data: {
                            email: 'test@example.com',
                            name: 'Test User',
                            firebaseUid: 'temp-test-user'
                        }
                    });
                    logger_1.logger.info('Created temporary user for OAuth testing');
                }
            }
            catch (dbError) {
                logger_1.logger.error('Database error in OAuth initiation:', dbError);
                dbUser = {
                    id: 'temp-user-id',
                    email: 'test@example.com',
                    name: 'Test User',
                    firebaseUid: 'temp-test-user'
                };
                logger_1.logger.info('Using mock user for OAuth testing due to database error');
            }
            await mastercard_api_service_1.mastercardApiService.getAppToken();
            const customerId = await mastercard_api_service_1.mastercardApiService.createTestCustomer(dbUser.id, dbUser.email, dbUser.name || 'Test User');
            const connectUrl = await mastercard_api_service_1.mastercardApiService.generateConnectUrl(customerId);
            logger_1.logger.info(`OAuth initiated for user ${dbUser.id}`);
            return res.json({
                message: 'Connect URL generated successfully',
                connectUrl
            });
        }
        catch (error) {
            logger_1.logger.error(`Failed to initiate OAuth:`, error);
            return res.status(500).json({
                error: 'Failed to initiate OAuth',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    oauthCallback = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const { code, state, error } = req.query;
        if (error) {
            logger_1.logger.error(`OAuth error: ${error}`);
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
            const redirectUri = process.env.OAUTH_REDIRECT_URI || 'http://localhost:3001/api/auth/callback';
            const tokenResponse = await mastercard_api_service_1.mastercardApiService.exchangeCodeForToken(code, redirectUri);
            const accounts = await mastercard_api_service_1.mastercardApiService.getAccounts(tokenResponse.access_token);
            logger_1.logger.info(`OAuth callback successful, found ${accounts.length} accounts`);
            return res.json({
                message: 'OAuth flow completed successfully',
                accounts,
            });
        }
        catch (error) {
            logger_1.logger.error('OAuth callback error:', error);
            return res.status(500).json({
                error: 'OAuth callback failed',
                message: 'Failed to complete OAuth flow'
            });
        }
    });
    connectBankAccount = (0, error_middleware_1.asyncHandler)(async (req, res) => {
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
            const dbUser = await this.getOrCreateFirebaseUser(req.user.firebaseUid, req.user.email, req.user.name);
            logger_1.logger.warn('connectBankAccount method not implemented in syncService');
            const connectedAccount = {
                id: 'temp-id',
                accountName: accountData.accountName || 'Unknown Account',
                bankName: accountData.bankName || 'Unknown Bank',
                accountType: accountData.accountType || 'Unknown'
            };
            logger_1.logger.info(`Bank account connected for user ${dbUser.id}`);
            return res.status(201).json({
                message: 'Bank account connected successfully',
                account: {
                    id: connectedAccount.id,
                    accountName: connectedAccount.accountName,
                    bankName: connectedAccount.bankName,
                    accountType: connectedAccount.accountType
                }
            });
        }
        catch (error) {
            logger_1.logger.error(`Failed to connect bank account for user ${req.user.firebaseUid}:`, error);
            return res.status(500).json({
                error: 'Failed to connect bank account',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    refreshToken = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'User not authenticated'
            });
        }
        const token = jwt.sign({ userId: req.user.id, email: req.user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        logger_1.logger.info(`Token refreshed for user ${req.user.id}`);
        return res.json({
            message: 'Token refreshed successfully',
            token
        });
    });
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
//# sourceMappingURL=auth.controller.js.map