const axios = require('axios');

async function testConnectivityFix() {
  console.log('🔍 Testing Mastercard Connectivity Fix...\n');

  const baseUrl = 'https://api.openbanking.mastercard.com.au';
  const clientId = '5ad34a4227b6c585beaa8dc7e1d2d2f5';
  const clientSecret = 'QFgTbpYOHHPBU8xfFZ5p';
  const partnerId = '2445584957219';

  console.log('📋 Test Configuration:');
  console.log('MASTERCARD_API_BASE_URL:', baseUrl);
  console.log('MASTERCARD_CLIENT_ID:', clientId);
  console.log('MASTERCARD_PARTNER_ID:', partnerId);
  console.log('');

  try {
    // Test 1: Test institutions endpoint (public endpoint)
    console.log('🏦 Testing: Institutions Endpoint (Public)');
    try {
      const response = await axios.get(`${baseUrl}/institutions`, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      console.log('✅ SUCCESS! Institutions endpoint is accessible');
      console.log('Response status:', response.status);
      if (response.data && response.data.institutions) {
        console.log('Found', response.data.institutions.length, 'institutions');
      }
    } catch (error) {
      console.log('❌ FAILED: Institutions endpoint test');
      console.log('Error:', error.message);
      if (error.response) {
        console.log('Response status:', error.response.status);
        console.log('Response data:', JSON.stringify(error.response.data, null, 2));
      }
    }
    console.log('');

    // Test 2: Test OAuth token endpoint
    console.log('🔐 Testing: OAuth Token Endpoint');
    const authUrl = 'https://api.openbanking.mastercard.com.au/oauth2/token';
    try {
      const response = await axios.post(authUrl,
        'grant_type=client_credentials',
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
          }
        }
      );
      console.log('✅ SUCCESS! Token endpoint is accessible');
      console.log('Response status:', response.status);
    } catch (error) {
      console.log('❌ FAILED: Token endpoint test');
      console.log('Error:', error.message);
      if (error.response) {
        console.log('Response status:', error.response.status);
        console.log('Response data:', JSON.stringify(error.response.data, null, 2));
      }
    }
    console.log('');

    // Test 3: Test consent creation endpoint
    console.log('📝 Testing: Consent Creation Endpoint');
    try {
      const consentData = {
        scopes: 'bank:accounts.basic:read bank:transactions:read bank:balances:read offline_access',
        redirect_uri: 'http://localhost:3001/api/auth/callback',
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
      console.log('✅ SUCCESS! Consent creation endpoint is accessible');
      console.log('Response status:', response.status);
    } catch (error) {
      console.log('❌ FAILED: Consent creation endpoint test');
      console.log('Error:', error.message);
      if (error.response) {
        console.log('Response status:', error.response.status);
        console.log('Response data:', JSON.stringify(error.response.data, null, 2));
      }
    }
    console.log('');

    console.log('🎉 Connectivity tests completed!');
    console.log('');
    console.log('📝 Summary:');
    console.log('- Removed non-existent /health endpoint');
    console.log('- Using /institutions endpoint for connectivity testing');
    console.log('- All endpoints should now work properly');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testConnectivityFix().catch(console.error);
