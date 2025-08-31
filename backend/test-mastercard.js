const { mastercardApiService } = require('./dist/services/mastercard-api.service.js');

async function testMastercardAPI() {
  console.log('🔍 Testing Mastercard Open Banking API...\n');

  // Check environment variables
  console.log('📋 Environment Configuration:');
  console.log('MASTERCARD_API_BASE_URL:', process.env.MASTERCARD_API_BASE_URL || 'Not set');
  console.log('MASTERCARD_CLIENT_ID:', process.env.MASTERCARD_CLIENT_ID ? 'Set' : 'Not set');
  console.log('MASTERCARD_CLIENT_SECRET:', process.env.MASTERCARD_CLIENT_SECRET ? 'Set' : 'Not set');
  console.log('MASTERCARD_PARTNER_ID:', process.env.MASTERCARD_PARTNER_ID ? 'Set' : 'Not set');
  console.log('');

  try {
    // Test 1: Check if we can get institutions
    console.log('🏦 Testing: Get Institutions');
    const institutions = await mastercardApiService.getInstitutions();
    console.log('✅ Success! Found', institutions.length, 'institutions');
    console.log('Sample institutions:', institutions.slice(0, 3));
    console.log('');

    // Test 2: Generate OAuth URL
    console.log('🔗 Testing: Generate OAuth URL');
    const oauthUrl = mastercardApiService.generateOAuthUrl('test-state-123');
    console.log('✅ OAuth URL generated:', oauthUrl);
    console.log('');

    console.log('🎉 All tests passed! Mastercard API service is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Check if Mastercard API credentials are set in environment variables');
    console.log('2. Verify the API base URL is correct');
    console.log('3. Ensure you have valid sandbox credentials from Mastercard');
    console.log('4. Check if the API endpoints are accessible from your network');
  }
}

// Run the test
testMastercardAPI().catch(console.error);
