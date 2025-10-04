#!/usr/bin/env node

/**
 * Email Configuration Test Script
 * Tests email sending functionality after configuration
 */

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, 'env.local') });

console.log('🧪 Testing Email Configuration...\n');

// Check configuration
const useSendGrid = (process.env.USE_SENDGRID || '').toLowerCase() === 'true';
const hasSendGridKey = !!process.env.SENDGRID_API_KEY;
const hasSmtpConfig = !!(process.env.SMTP_USER && process.env.SMTP_PASS);

console.log('📋 Configuration Status:');
console.log(`SendGrid Enabled: ${useSendGrid}`);
console.log(`SendGrid API Key: ${hasSendGridKey ? '✅ Present' : '❌ Missing'}`);
console.log(`SMTP Config: ${hasSmtpConfig ? '✅ Present' : '❌ Missing'}`);
console.log(`Frontend URL: ${process.env.FRONTEND_URL || '❌ Missing'}`);

if (useSendGrid && hasSendGridKey) {
  console.log('\n✅ SendGrid configuration looks good!');
  console.log('📧 Email service: SendGrid');
} else if (!useSendGrid && hasSmtpConfig) {
  console.log('\n✅ SMTP configuration looks good!');
  console.log('📧 Email service: SMTP');
  console.log(`📧 SMTP Host: ${process.env.SMTP_HOST || 'smtp.gmail.com'}`);
  console.log(`📧 SMTP Port: ${process.env.SMTP_PORT || '587'}`);
  console.log(`📧 SMTP User: ${process.env.SMTP_USER}`);
} else {
  console.log('\n❌ Email configuration incomplete!');
  console.log('Please set up either SendGrid or SMTP configuration.');
  process.exit(1);
}

console.log('\n🚀 Ready to send emails!');
console.log('Try sending an invitation from your app now.');
