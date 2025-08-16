import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-encryption-key-here';
const ALGORITHM = 'aes-256-cbc';

export class Encryption {
  private static key = Buffer.from(ENCRYPTION_KEY, 'utf8');

  static encrypt(text: string): string {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher(ALGORITHM, this.key);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      throw new Error('Encryption failed');
    }
  }

  static decrypt(encryptedText: string): string {
    try {
      const textParts = encryptedText.split(':');
      const iv = Buffer.from(textParts.shift()!, 'hex');
      const encryptedData = textParts.join(':');
      const decipher = crypto.createDecipher(ALGORITHM, this.key);
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      throw new Error('Decryption failed');
    }
  }

  static hash(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  static generateRandomString(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
}
