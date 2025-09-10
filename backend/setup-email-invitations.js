/**
 * Setup Email Invitations System
 * 
 * This script helps you set up the email invitation system for Splitwise groups.
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 Setting up Email Invitations System for Splitwise...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('❌ .env file not found!');
  console.log('Please create a .env file in the backend directory with the following variables:\n');
} else {
  console.log('✅ .env file found');
  
  // Read current .env content
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check for email configuration
  const hasSmtpHost = envContent.includes('SMTP_HOST');
  const hasSmtpUser = envContent.includes('SMTP_USER');
  const hasSmtpPass = envContent.includes('SMTP_PASS');
  const hasFrontendUrl = envContent.includes('FRONTEND_URL');
  
  console.log('\n📧 Email Configuration Status:');
  console.log(`   SMTP_HOST: ${hasSmtpHost ? '✅' : '❌'}`);
  console.log(`   SMTP_USER: ${hasSmtpUser ? '✅' : '❌'}`);
  console.log(`   SMTP_PASS: ${hasSmtpPass ? '✅' : '❌'}`);
  console.log(`   FRONTEND_URL: ${hasFrontendUrl ? '✅' : '❌'}`);
  
  if (!hasSmtpHost || !hasSmtpUser || !hasSmtpPass || !hasFrontendUrl) {
    console.log('\n⚠️  Missing email configuration variables!');
  } else {
    console.log('\n✅ Email configuration looks good!');
  }
}

console.log('\n📋 Required Environment Variables:');
console.log(`
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@xpenses.com

# Frontend URL (for invitation links)
FRONTEND_URL=http://localhost:3000
`);

console.log('🔧 Gmail Setup Instructions:');
console.log(`
1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account settings → Security → 2-Step Verification
3. Click "App passwords" and generate a password for "Mail"
4. Use the generated password in SMTP_PASS
`);

console.log('\n🚀 Next Steps:');
console.log(`
1. Add the environment variables to your .env file
2. Run database migration: npm run migrate
3. Restart your backend server: npm run dev
4. Test the invitation system by sending an invite
`);

console.log('\n📚 Documentation:');
console.log(`
- Complete Guide: SPLITWISE_EMAIL_INVITATIONS_GUIDE.md
- API Documentation: Check the controller files
- Frontend Components: Check src/components/splitwise/
`);

console.log('\n🎉 Email invitation system is ready to use!');
console.log('   Group admins can now send invitations to new users via email.');
