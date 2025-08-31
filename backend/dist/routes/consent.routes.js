"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const consent_controller_1 = require("../controllers/consent.controller");
const firebase_auth_middleware_1 = require("../middleware/firebase-auth.middleware");
const router = express_1.default.Router();
router.get('/sandbox-status', consent_controller_1.consentController.checkSandboxStatus.bind(consent_controller_1.consentController));
router.post('/start', firebase_auth_middleware_1.authenticateFirebaseToken, consent_controller_1.consentController.startConsent.bind(consent_controller_1.consentController));
router.get('/callback', consent_controller_1.consentController.handleCallback.bind(consent_controller_1.consentController));
router.use(firebase_auth_middleware_1.authenticateFirebaseToken);
router.get('/', consent_controller_1.consentController.getUserConsents.bind(consent_controller_1.consentController));
router.get('/:consentId', consent_controller_1.consentController.getConsentDetails.bind(consent_controller_1.consentController));
router.delete('/:consentId', consent_controller_1.consentController.revokeConsent.bind(consent_controller_1.consentController));
exports.default = router;
//# sourceMappingURL=consent.routes.js.map