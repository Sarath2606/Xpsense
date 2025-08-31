"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const firebase_auth_middleware_1 = require("../middleware/firebase-auth.middleware");
const router = (0, express_1.Router)();
router.post('/register', auth_controller_1.authController.register);
router.post('/login', auth_controller_1.authController.login);
router.get('/callback', auth_controller_1.authController.oauthCallback);
router.get('/profile', auth_middleware_1.authenticateToken, auth_controller_1.authController.getProfile);
router.post('/refresh-token', auth_middleware_1.authenticateToken, auth_controller_1.authController.refreshToken);
router.post('/oauth/initiate', auth_controller_1.authController.initiateOAuth);
router.post('/connect-bank', firebase_auth_middleware_1.authenticateFirebaseToken, auth_controller_1.authController.connectBankAccount);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map