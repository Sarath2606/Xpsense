const axios = require('axios');
require('dotenv').config({ path: './env.local' });

async function testConsentDetailed() {
  console.log('🔍 Detailed Consent Endpoint Test...\n');

  try {
    // First, let's check if the server is running
    console.log('1️⃣ Testing: Server Health');
    try {
      const healthResponse = await axios.get('http://localhost:3001/health');
      console.log('✅ Server is running');
      console.log('Health status:', healthResponse.data);
    } catch (error) {
      console.log('❌ Server is not running or not responding');
      console.log('Error:', error.message);
      return;
    }

    console.log('\n2️⃣ Testing: Sandbox Status');
    try {
      const statusResponse = await axios.get('http://localhost:3001/api/consents/sandbox-status');
      console.log('✅ Sandbox status endpoint works');
      console.log('Status:', statusResponse.data);
    } catch (error) {
      console.log('❌ Sandbox status endpoint failed');
      console.log('Error:', error.response?.data || error.message);
    }

    console.log('\n3️⃣ Testing: Consent Start with Detailed Error Analysis');
    
    const testUserId = 'test-user-12345';
    console.log('Using test user ID:', testUserId);
    
    try {
      const consentResponse = await axios.post('http://localhost:3001/api/consents/start', {
        durationDays: 180
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testUserId}`
        },
        timeout: 30000 // 30 second timeout
      });
      
      console.log('✅ Consent start successful!');
      console.log('Status:', consentResponse.status);
      console.log('Data:', JSON.stringify(consentResponse.data, null, 2));
      
    } catch (error) {
      console.log('❌ Consent start failed');
      console.log('Status:', error.response?.status);
      console.log('Error Response:', JSON.stringify(error.response?.data, null, 2));
      
      if (error.response?.status === 500) {
        console.log('\n🔍 500 Error Analysis:');
        console.log('The error is being caught in the consent controller.');
        console.log('This suggests an issue with:');
        console.log('- Mastercard API service calls');
        console.log('- Database operations in the consent flow');
        console.log('- Environment variable loading');
        
        // Let's test the Mastercard API service directly
        console.log('\n4️⃣ Testing: Mastercard API Service Directly');
        await testMastercardServiceDirectly();
      }
    }

  } catch (error) {
    console.log('❌ Test failed');
    console.log('Error:', error.message);
  }

  console.log('\n🎉 Detailed consent test completed!');
}

async function testMastercardServiceDirectly() {
  try {
    // Test if we can import and instantiate the Mastercard service
    console.log('Testing Mastercard API service instantiation...');
    
    // This will help us see if there are any import or initialization errors
    const { mastercardApiService } = require('./dist/services/mastercard-api.service.js');
    console.log('✅ Mastercard service imported successfully');
    
    // Test getAppToken method
    console.log('Testing getAppToken method...');
    try {
      const token = await mastercardApiService.getAppToken();
      console.log('✅ getAppToken successful, token length:', token.length);
    } catch (error) {
      console.log('❌ getAppToken failed:', error.message);
    }
    
  } catch (error) {
    console.log('❌ Mastercard service test failed:', error.message);
    console.log('This might indicate a compilation or import issue');
  }
}

// Run the test
testConsentDetailed().catch(console.error);
