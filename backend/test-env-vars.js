require('dotenv').config({ path: './env.local' });

console.log('🔍 Testing Environment Variables...\n');

console.log('WEBHOOK_URL:', process.env.WEBHOOK_URL);
console.log('MASTERCARD_PARTNER_ID:', process.env.MASTERCARD_PARTNER_ID);
console.log('MASTERCARD_CLIENT_ID:', process.env.MASTERCARD_CLIENT_ID);
console.log('MASTERCARD_CLIENT_SECRET:', process.env.MASTERCARD_CLIENT_SECRET);

console.log('\n🎉 Environment variables test completed!');