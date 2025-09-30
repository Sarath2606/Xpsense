// Test current invitation URL generation
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
const token = 'test-token-123';

const acceptUrl = `${frontendUrl}/splitwise/invite/accept?token=${token}`;

console.log('🔍 Current Invitation URL Test:');
console.log('FRONTEND_URL environment variable:', process.env.FRONTEND_URL || 'NOT SET (using fallback)');
console.log('Generated invitation URL:', acceptUrl);
console.log('');

if (frontendUrl === 'http://localhost:3000') {
  console.log('❌ PROBLEM FOUND:');
  console.log('The FRONTEND_URL is not set in Railway, so it\'s using the fallback localhost URL');
  console.log('This means invitation emails contain WRONG URLs that point to localhost');
  console.log('');
  console.log('🔧 SOLUTION:');
  console.log('1. Go to Railway Dashboard: https://railway.app/dashboard');
  console.log('2. Select your backend project');
  console.log('3. Go to "Variables" tab');
  console.log('4. Add or update FRONTEND_URL to: https://xpenses-app.pages.dev');
  console.log('5. Save and restart the service');
  console.log('');
  console.log('✅ After the fix, new invitations will have correct URLs like:');
  console.log('https://xpenses-app.pages.dev/splitwise/invite/accept?token=...');
} else {
  console.log('✅ FRONTEND_URL is correctly set to:', frontendUrl);
}
