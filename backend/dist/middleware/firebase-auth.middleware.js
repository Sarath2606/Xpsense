"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalFirebaseAuth = exports.authenticateFirebaseToken = void 0;
const firebase_1 = require("../config/firebase");
const logger_1 = require("../utils/logger");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const authenticateFirebaseToken = async (req, res, next) => {
    try {
        const rawAuth = req.headers.authorization
            || req.headers['x-authorization']
            || req.headers['x-access-token']
            || '';
        const token = rawAuth
            ? (rawAuth.startsWith('Bearer ') ? rawAuth.substring('Bearer '.length) : rawAuth)
            : undefined;
        if (!token) {
            if (process.env.NODE_ENV === 'development') {
                const userEmail = 'smilysarath26@gmail.com';
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
                    id: dbUser.id,
                    email: dbUser.email,
                    name: dbUser.name || undefined,
                    firebaseUid: dbUser.firebaseUid || 'dev-firebase-uid'
                };
                logger_1.logger.info(`Development authentication successful for user: ${req.user.email} (no token provided)`);
                return next();
            }
            return next({
                name: 'UnauthorizedError',
                message: 'Access token required',
                statusCode: 401,
            });
        }
        if (process.env.NODE_ENV === 'development') {
            try {
                const decodedToken = await (0, firebase_1.verifyFirebaseToken)(token);
                const userEmail = (decodedToken.email || '').toLowerCase();
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
                    id: dbUser.id,
                    email: dbUser.email,
                    name: dbUser.name || undefined,
                    firebaseUid: dbUser.firebaseUid || decodedToken.uid
                };
                logger_1.logger.info(`Development Firebase authentication successful for user: ${req.user.email}`);
                return next();
            }
            catch (error) {
                logger_1.logger.error('Development Firebase token verification failed:', error);
                return next({
                    name: 'FirebaseAuthError',
                    message: 'Invalid Firebase token in development',
                    statusCode: 401,
                });
            }
        }
        (0, firebase_1.verifyFirebaseToken)(token)
            .then(async (decodedToken) => {
            const userEmail = (decodedToken.email || '').toLowerCase();
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
                id: dbUser.id,
                email: dbUser.email,
                name: dbUser.name || undefined,
                firebaseUid: dbUser.firebaseUid || decodedToken.uid
            };
            logger_1.logger.info(`Firebase token verified for user: ${decodedToken.email}`);
            logger_1.logger.info(`Firebase authentication successful for user: ${decodedToken.email}`);
            return next();
        })
            .catch((error) => {
            logger_1.logger.error('Firebase token verification failed:', error);
            return next({
                name: 'FirebaseAuthError',
                message: 'Invalid Firebase token',
                statusCode: 401,
            });
        });
    }
    catch (error) {
        logger_1.logger.error('Firebase authentication middleware error:', error);
        return next({
            name: 'AuthError',
            message: 'Authentication failed',
            statusCode: 500,
        });
    }
};
exports.authenticateFirebaseToken = authenticateFirebaseToken;
const optionalFirebaseAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return next();
        }
        (0, firebase_1.verifyFirebaseToken)(token)
            .then((decodedToken) => {
            req.user = {
                id: decodedToken.uid,
                email: decodedToken.email || '',
                name: decodedToken.name || undefined,
                firebaseUid: decodedToken.uid
            };
            logger_1.logger.info(`Optional Firebase authentication successful for user: ${decodedToken.email}`);
            return next();
        })
            .catch(() => {
            return next();
        });
    }
    catch {
        return next();
    }
};
exports.optionalFirebaseAuth = optionalFirebaseAuth;
//# sourceMappingURL=firebase-auth.middleware.js.map