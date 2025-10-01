// Test production URL generation
console.log('🔍 Testing Production URL Generation:');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('');

if (process.env.FRONTEND_URL === 'https://xpenses-app.pages.dev') {
  console.log('✅ FRONTEND_URL is correctly set!');
  
  const token = 'test-token-123';
  const acceptUrl = `${process.env.FRONTEND_URL}/splitwise/invite/accept?token=${token}`;
  
  console.log('Generated invitation URL:', acceptUrl);
  console.log('');
  console.log('🧪 URL Analysis:');
  console.log('- Protocol:', acceptUrl.startsWith('https://') ? '✅ HTTPS' : '❌ Not HTTPS');
  console.log('- Domain:', acceptUrl.includes('xpenses-app.pages.dev') ? '✅ Correct domain' : '❌ Wrong domain');
  console.log('- Path:', acceptUrl.includes('/splitwise/invite/accept') ? '✅ Correct path' : '❌ Wrong path');
  console.log('- Token:', acceptUrl.includes('token=') ? '✅ Token parameter' : '❌ No token');
  console.log('');
  console.log('🎯 This URL should work for invitations!');
} else {
  console.log('❌ FRONTEND_URL is not set correctly');
  console.log('Expected: https://xpenses-app.pages.dev');
  console.log('Actual:', process.env.FRONTEND_URL || 'NOT SET');
}
