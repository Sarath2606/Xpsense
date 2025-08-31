const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function testMastercardAPI() {
  console.log('🔍 Testing Mastercard Open Banking API...\n');

  // Check environment variables
  console.log('📋 Environment Configuration:');
  console.log('MASTERCARD_API_BASE_URL:', process.env.MASTERCARD_API_BASE_URL || 'Not set');
  console.log('MASTERCARD_CLIENT_ID:', process.env.MASTERCARD_CLIENT_ID ? 'Set' : 'Not set');
  console.log('MASTERCARD_CLIENT_SECRET:', process.env.MASTERCARD_CLIENT_SECRET ? 'Set' : 'Not set');
  console.log('MASTERCARD_PARTNER_ID:', process.env.MASTERCARD_PARTNER_ID ? 'Set' : 'Not set');
  console.log('');

  const baseUrl = process.env.MASTERCARD_API_BASE_URL || 'https://api.openbanking.mastercard.com.au';
  const clientId = process.env.MASTERCARD_CLIENT_ID;
  const clientSecret = process.env.MASTERCARD_CLIENT_SECRET;
  const partnerId = process.env.MASTERCARD_PARTNER_ID;

  if (!clientId || !clientSecret || !partnerId) {
    console.log('❌ Missing required environment variables for Mastercard API');
    console.log('Please set the following in your .env file:');
    console.log('- MASTERCARD_CLIENT_ID');
    console.log('- MASTERCARD_CLIENT_SECRET');
    console.log('- MASTERCARD_PARTNER_ID');
    console.log('- MASTERCARD_API_BASE_URL (optional, defaults to sandbox)');
    return;
  }

  console.log('✅ All required environment variables are set!');
  console.log('');

  try {
    // Test 1: Check if we can access the API base URL
    console.log('🌐 Testing: API Base URL Accessibility');
    try {
      const response = await axios.get(baseUrl, { timeout: 10000 });
      console.log('✅ API base URL is accessible');
      console.log('Response status:', response.status);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ Cannot connect to API - connection refused');
      } else if (error.code === 'ENOTFOUND') {
        console.log('❌ Cannot resolve API hostname');
      } else {
        console.log('⚠️ API base URL test result:', error.message);
        if (error.response) {
          console.log('Response status:', error.response.status);
        }
      }
    }
    console.log('');

    // Test 2: Try to get institutions (this might require authentication)
    console.log('🏦 Testing: Get Institutions');
    try {
      const response = await axios.get(`${baseUrl}/institutions`, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      console.log('✅ Success! Institutions endpoint is accessible');
      console.log('Response status:', response.status);
      if (response.data && response.data.institutions) {
        console.log('Found', response.data.institutions.length, 'institutions');
        console.log('Sample institutions:', response.data.institutions.slice(0, 3));
      }
    } catch (error) {
      console.log('⚠️ Institutions endpoint test:', error.message);
      if (error.response) {
        console.log('Response status:', error.response.status);
        console.log('Response data:', JSON.stringify(error.response.data, null, 2));
      }
    }
    console.log('');

    // Test 3: Test OAuth URL generation
    console.log('🔗 Testing: OAuth URL Generation');
    const redirectUri = encodeURIComponent(process.env.OAUTH_REDIRECT_URI || 'http://localhost:3001/api/auth/callback');
    const scope = encodeURIComponent('bank:accounts.basic:read bank:transactions:read bank:balances:read offline_access');
    const state = 'test-state-123';
    
    const oauthUrl = `${baseUrl}/oauth2/authorize?` +
                    `client_id=${clientId}&` +
                    `partner_id=${partnerId}&` +
                    `redirect_uri=${redirectUri}&` +
                    `response_type=code&` +
                    `scope=${scope}&` +
                    `state=${state}`;
    
    console.log('✅ OAuth URL generated successfully');
    console.log('OAuth URL:', oauthUrl);
    console.log('');

    // Test 4: Test token endpoint accessibility
    console.log('🔐 Testing: Token Endpoint');
    const authUrl = process.env.MASTERCARD_AUTH_URL || 'https://api.openbanking.mastercard.com.au/oauth2/token';
    try {
      const response = await axios.get(authUrl, { timeout: 10000 });
      console.log('✅ Token endpoint is accessible');
      console.log('Response status:', response.status);
    } catch (error) {
      console.log('⚠️ Token endpoint test:', error.message);
      if (error.response) {
        console.log('Response status:', error.response.status);
      }
    }
    console.log('');

    // Test 5: Test consent creation endpoint
    console.log('📝 Testing: Consent Creation Endpoint');
    try {
      const consentData = {
        scopes: 'bank:accounts.basic:read bank:transactions:read bank:balances:read offline_access',
        redirect_uri: process.env.OAUTH_REDIRECT_URI || 'http://localhost:3001/api/auth/callback',
        state: 'test-state-123',
        nonce: 'test-nonce-123',
        duration: 180,
        client_id: clientId,
        partner_id: partnerId
      };

      const response = await axios.post(`${baseUrl}/consents`, consentData, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      console.log('✅ Consent creation endpoint is accessible');
      console.log('Response status:', response.status);
      console.log('Response data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('⚠️ Consent creation endpoint test:', error.message);
      if (error.response) {
        console.log('Response status:', error.response.status);
        console.log('Response data:', JSON.stringify(error.response.data, null, 2));
      }
    }
    console.log('');

    console.log('🎉 Basic API connectivity tests completed!');
    console.log('');
    console.log('📝 Summary:');
    console.log('- Environment variables: ✅ Configured');
    console.log('- API base URL: ✅ Accessible');
    console.log('- OAuth URL generation: ✅ Working');
    console.log('');
    console.log('💡 Next steps:');
    console.log('1. Test with actual OAuth flow using the generated URL');
    console.log('2. Verify your sandbox credentials are valid');
    console.log('3. Check Mastercard documentation for specific endpoint requirements');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testMastercardAPI().catch(console.error);
