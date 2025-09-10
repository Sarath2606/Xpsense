const axios = require('axios');

async function testConsentWithAuth() {
  console.log('🧪 Testing Consent Endpoint with Authentication...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing: Health Check');
    const healthResponse = await axios.get('http://localhost:3001/health');
    console.log('✅ Health check passed');
    console.log('Status:', healthResponse.status);
    console.log('');

    // Test 2: Test consent endpoint with a mock Firebase token
    console.log('2️⃣ Testing: Consent Start with Mock Auth');
    try {
      const consentResponse = await axios.post('http://localhost:3001/api/consents/start', {
        institutionId: 'test-institution',
        durationDays: 180
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-firebase-token-for-testing'
        }
      });
      console.log('✅ Consent start passed');
      console.log('Status:', consentResponse.status);
      console.log('Data:', JSON.stringify(consentResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Consent start failed');
      console.log('Status:', error.response?.status);
      console.log('Error:', error.response?.data || error.message);
      
      if (error.response?.status === 500) {
        console.log('\n🔍 500 Error Analysis:');
        console.log('The error is likely in the consent controller logic.');
        console.log('Possible issues:');
        console.log('1. Database query failing');
        console.log('2. Mastercard API call failing');
        console.log('3. Missing user in database');
        console.log('4. Error in the new Connect flow code');
        
        // Let's test if we can get more specific error info
        console.log('\n🔧 Let\'s test the Mastercard API directly...');
        await testMastercardAPI();
      }
    }
    console.log('');

  } catch (error) {
    console.log('❌ Test failed');
    console.log('Error:', error.message);
  }
}

async function testMastercardAPI() {
  try {
    console.log('3️⃣ Testing: Mastercard API Direct');
    
    // Test App-Token generation
    const tokenResponse = await axios.post('https://api.openbanking.mastercard.com.au/aggregation/v2/partners/authentication', {
      partnerId: '2445584957219',
      partnerSecret: 'QFgTbpYOHHPBU8xfFZ5p'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'App-Key': '5ad34a4227b6c585beaa8dc7e1d2d2f5'
      }
    });
    
    console.log('✅ App-Token generation successful');
    console.log('Token:', tokenResponse.data.token);
    
    // Test customer creation
    const customerResponse = await axios.post('https://api.openbanking.mastercard.com.au/aggregation/v2/customers/testing', {
      username: 'testuser' + Date.now(),
      firstName: 'Test',
      lastName: 'User',
      email: 'test' + Date.now() + '@example.com',
      phone: '+61412345678'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'App-Token': tokenResponse.data.token,
        'App-Key': '5ad34a4227b6c585beaa8dc7e1d2d2f5'
      }
    });
    
    console.log('✅ Customer creation successful');
    console.log('Customer ID:', customerResponse.data.id);
    
    // Test Connect URL generation
    const connectResponse = await axios.post('https://api.openbanking.mastercard.com.au/connect/v2/generate', {
      partnerId: '2445584957219',
      customerId: customerResponse.data.id
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'App-Token': tokenResponse.data.token,
        'App-Key': '5ad34a4227b6c585beaa8dc7e1d2d2f5'
      }
    });
    
    console.log('✅ Connect URL generation successful');
    console.log('Connect URL:', connectResponse.data.link);
    console.log('\n🎉 All Mastercard API calls are working!');
    console.log('The issue is likely in the consent controller logic or database.');
    
  } catch (error) {
    console.log('❌ Mastercard API test failed');
    console.log('Error:', error.response?.status, error.response?.data?.message || error.message);
  }
}

// Run the test
testConsentWithAuth().catch(console.error);
