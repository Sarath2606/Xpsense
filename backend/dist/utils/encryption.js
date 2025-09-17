"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Encryption = void 0;
const crypto_1 = __importDefault(require("crypto"));
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-encryption-key-here';
const ALGORITHM = 'aes-256-cbc';
class Encryption {
    static key = Buffer.from(ENCRYPTION_KEY, 'utf8');
    static encrypt(text) {
        try {
            const iv = crypto_1.default.randomBytes(16);
            const cipher = crypto_1.default.createCipher(ALGORITHM, this.key);
            let encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            return iv.toString('hex') + ':' + encrypted;
        }
        catch (error) {
            throw new Error('Encryption failed');
        }
    }
    static decrypt(encryptedText) {
        try {
            const textParts = encryptedText.split(':');
            const iv = Buffer.from(textParts.shift(), 'hex');
            const encryptedData = textParts.join(':');
            const decipher = crypto_1.default.createDecipher(ALGORITHM, this.key);
            let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        }
        catch (error) {
            throw new Error('Decryption failed');
        }
    }
    static hash(text) {
        return crypto_1.default.createHash('sha256').update(text).digest('hex');
    }
    static generateRandomString(length = 32) {
        return crypto_1.default.randomBytes(length).toString('hex');
    }
}
exports.Encryption = Encryption;
//# sourceMappingURL=encryption.js.map