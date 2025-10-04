#!/usr/bin/env node

/**
 * Email Environment Variables Checker
 * This script helps identify email configuration issues
 */

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, 'env.local') });

console.log('📧 Checking Email Configuration Variables...\n');

// Check email-related environment variables
const emailVars = [
  'SMTP_HOST',
  'SMTP_PORT', 
  'SMTP_USER',
  'SMTP_PASS',
  'SMTP_FROM',
  'SMTP_SECURE',
  'SENDGRID_API_KEY',
  'USE_SENDGRID',
  'FRONTEND_URL'
];

console.log('📋 Email Configuration Variables:');
emailVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    if (varName === 'SMTP_PASS' || varName === 'SENDGRID_API_KEY') {
      console.log(`✅ ${varName}: Set (${value.length} characters)`);
    } else {
      console.log(`✅ ${varName}: ${value}`);
    }
  } else {
    console.log(`❌ ${varName}: Not set`);
  }
});

console.log('\n🔧 Email Configuration Analysis:');
const useSendGrid = (process.env.USE_SENDGRID || '').toLowerCase() === 'true';
const hasSendGridKey = !!process.env.SENDGRID_API_KEY;
const hasSmtpConfig = !!(process.env.SMTP_USER && process.env.SMTP_PASS);

if (useSendGrid && hasSendGridKey) {
  console.log('✅ SendGrid configuration detected and ready');
} else if (useSendGrid && !hasSendGridKey) {
  console.log('❌ SendGrid enabled but API key missing');
} else if (!useSendGrid && hasSmtpConfig) {
  console.log('✅ SMTP configuration detected and ready');
} else {
  console.log('❌ No email configuration found');
}

console.log('\n📝 Recommendations:');
if (!useSendGrid && !hasSmtpConfig) {
  console.log('1. Set up either SendGrid (recommended) or SMTP configuration');
  console.log('2. For Gmail SMTP: Enable 2FA and generate app password');
  console.log('3. For SendGrid: Get free API key from sendgrid.com');
}
if (useSendGrid && !hasSendGridKey) {
  console.log('1. Add SENDGRID_API_KEY to your environment variables');
  console.log('2. Get API key from SendGrid dashboard');
}
if (!process.env.FRONTEND_URL) {
  console.log('1. Set FRONTEND_URL for invitation links');
}
