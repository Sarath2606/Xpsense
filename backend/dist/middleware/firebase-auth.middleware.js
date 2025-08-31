"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalFirebaseAuth = exports.authenticateFirebaseToken = void 0;
const firebase_1 = require("../config/firebase");
const logger_1 = require("../utils/logger");
const authenticateFirebaseToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            if (process.env.NODE_ENV === 'development') {
                req.user = {
                    id: 'cmefafb0j0000j8dmmu9tlkmp',
                    email: 'smilysarath26@gmail.com',
                    name: 'Development User',
                    firebaseUid: 'dev-firebase-uid'
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
            req.user = {
                id: 'cmefafb0j0000j8dmmu9tlkmp',
                email: 'smilysarath26@gmail.com',
                name: 'Development User',
                firebaseUid: 'dev-firebase-uid'
            };
            logger_1.logger.info(`Development authentication successful for user: ${req.user.email}`);
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