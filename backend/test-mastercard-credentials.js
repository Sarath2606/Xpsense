const axios = require('axios');
require('dotenv').config({ path: './env.local' });

async function testMastercardCredentials() {
  console.log('🔍 Testing Mastercard API Credentials...\n');

  const baseUrl = process.env.MASTERCARD_API_BASE_URL || 'https://api.openbanking.mastercard.com.au';
  const clientId = process.env.MASTERCARD_CLIENT_ID;
  const clientSecret = process.env.MASTERCARD_CLIENT_SECRET;
  const partnerId = process.env.MASTERCARD_PARTNER_ID;

  console.log('Environment Variables:');
  console.log('Base URL:', baseUrl);
  console.log('Client ID:', clientId ? `${clientId.substring(0, 8)}...` : 'NOT SET');
  console.log('Client Secret:', clientSecret ? `${clientSecret.substring(0, 8)}...` : 'NOT SET');
  console.log('Partner ID:', partnerId || 'NOT SET');
  console.log('');

  if (!clientId || !clientSecret || !partnerId) {
    console.log('❌ Missing required environment variables');
    return;
  }

  try {
    console.log('1️⃣ Testing: App-Token Authentication');
    
    const authResponse = await axios.post(`${baseUrl}/aggregation/v2/partners/authentication`, {
      partnerId: partnerId,
      partnerSecret: clientSecret
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'App-Key': clientId
      },
      timeout: 10000
    });

    console.log('✅ App-Token authentication successful!');
    console.log('Status:', authResponse.status);
    console.log('Token received:', authResponse.data?.token ? 'YES' : 'NO');
    
    if (authResponse.data?.token) {
      console.log('Token preview:', authResponse.data.token.substring(0, 20) + '...');
    }

  } catch (error) {
    console.log('❌ App-Token authentication failed');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n🔍 401 Error Analysis:');
      console.log('- Invalid credentials');
      console.log('- Check if credentials are correct');
      console.log('- Verify sandbox access');
    } else if (error.response?.status === 403) {
      console.log('\n🔍 403 Error Analysis:');
      console.log('- Credentials valid but access denied');
      console.log('- Check API permissions');
      console.log('- Verify sandbox status');
    }
  }

  try {
    console.log('\n2️⃣ Testing: OAuth Token Endpoint');
    
    const oauthResponse = await axios.post(
      `${baseUrl}/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
        },
        timeout: 10000
      }
    );

    console.log('✅ OAuth token endpoint successful!');
    console.log('Status:', oauthResponse.status);
    console.log('Access token received:', oauthResponse.data?.access_token ? 'YES' : 'NO');

  } catch (error) {
    console.log('❌ OAuth token endpoint failed');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data || error.message);
  }

  console.log('\n🎉 Mastercard credentials test completed!');
}

// Run the test
testMastercardCredentials().catch(console.error);
