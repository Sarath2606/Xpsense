const axios = require('axios');

async function checkSandboxStatus() {
  console.log('🔍 Checking Mastercard Open Banking Sandbox Status...\n');

  const baseUrl = process.env.MASTERCARD_API_BASE_URL || 'https://api.openbanking.mastercard.com.au';
  const projectId = process.env.MASTERCARD_PARTNER_ID || '809b7851-77b9-441d-b624-7256f3ba25d7';

  console.log('📋 Configuration:');
  console.log('Base URL:', baseUrl);
  console.log('Project ID:', projectId);
  console.log('');

  try {
    // Test 1: Direct health check
    console.log('🔐 Testing: OAuth Token Connectivity (recommended)');
    try {
      const tokenUrl = process.env.MASTERCARD_AUTH_URL || 'https://api.openbanking.mastercard.com.au/oauth2/token';
      await axios.post(tokenUrl, 'grant_type=client_credentials', {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${process.env.MASTERCARD_CLIENT_ID}:${process.env.MASTERCARD_CLIENT_SECRET}`).toString('base64')}`
        },
        timeout: 10000
      });
      console.log('✅ OAuth connectivity successful (HTTP 200)');
    } catch (error) {
      const status = error.response?.status;
      if (status && status >= 400 && status < 500) {
        console.log('⚠️ OAuth endpoint reachable but returned 4xx (likely config issue):', status);
      } else {
        console.log('❌ OAuth connectivity failed:', error.message);
      }
    }
    console.log('');

    // Test 2: Institutions endpoint
    console.log('🏦 Testing: Institutions Endpoint');
    try {
      const institutionsResponse = await axios.get(`${baseUrl}/institutions`, { 
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      console.log('✅ Institutions endpoint accessible');
      console.log('Status:', institutionsResponse.status);
      if (institutionsResponse.data && institutionsResponse.data.institutions) {
        console.log('Found', institutionsResponse.data.institutions.length, 'institutions');
      }
    } catch (error) {
      console.log('❌ Institutions endpoint failed');
      console.log('Error:', error.message);
      if (error.response) {
        console.log('Response status:', error.response.status);
        console.log('Response data:', error.response.data);
      }
    }
    console.log('');

    // Test 3: OAuth endpoint
    console.log('🔐 Testing: OAuth Endpoint');
    try {
      const oauthResponse = await axios.get(`${baseUrl}/oauth2/authorize`, { 
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      console.log('✅ OAuth endpoint accessible');
      console.log('Status:', oauthResponse.status);
    } catch (error) {
      console.log('⚠️ OAuth endpoint test:', error.message);
      if (error.response) {
        console.log('Response status:', error.response.status);
        // OAuth endpoint might return 400 for missing parameters, which is expected
        if (error.response.status === 400) {
          console.log('✅ OAuth endpoint is responding (400 is expected without parameters)');
        }
      }
    }
    console.log('');

    // Test 4: Token endpoint
    console.log('🎫 Testing: Token Endpoint');
    const tokenUrl = 'https://api.openbanking.mastercard.com.au/oauth2/token';
    try {
      const tokenResponse = await axios.get(tokenUrl, { 
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      console.log('✅ Token endpoint accessible');
      console.log('Status:', tokenResponse.status);
    } catch (error) {
      console.log('⚠️ Token endpoint test:', error.message);
      if (error.response) {
        console.log('Response status:', error.response.status);
        // Token endpoint might return 400 for missing parameters, which is expected
        if (error.response.status === 400) {
          console.log('✅ Token endpoint is responding (400 is expected without parameters)');
        }
      }
    }
    console.log('');

    // Summary
    console.log('📊 Sandbox Status Summary:');
    console.log('Project ID:', projectId);
    console.log('Base URL:', baseUrl);
    console.log('Environment: Sandbox (Testing)');
    console.log('');
    console.log('💡 If you\'re experiencing issues:');
    console.log('1. Check if this is scheduled maintenance (typically 2-4 hours)');
    console.log('2. Verify your credentials are correct');
    console.log('3. Ensure your project is active in the Mastercard developer portal');
    console.log('4. Contact Mastercard support if issues persist beyond 6 hours');
    console.log('');
    console.log('🔗 Useful Links:');
    console.log('- Mastercard Developer Portal: https://developer.mastercard.com/');
    console.log('- Open Banking Documentation: https://developer.mastercard.com/open-banking-au/');
    console.log('- Support: https://developer.mastercard.com/support');

  } catch (error) {
    console.error('❌ Status check failed:', error.message);
  }
}

// Run the check
checkSandboxStatus().catch(console.error);
