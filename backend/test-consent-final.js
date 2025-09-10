const axios = require('axios');
require('dotenv').config({ path: './env.local' });

async function testConsentFinal() {
  console.log('🔍 Final Consent Endpoint Test...\n');

  try {
    // Test the consent endpoint with the new webhook URL
    console.log('1️⃣ Testing: Consent Start Endpoint');
    console.log('Environment WEBHOOK_URL:', process.env.WEBHOOK_URL);
    
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
        timeout: 30000
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
        console.log('The error is still occurring. This suggests:');
        console.log('- The server might not have picked up the new environment variables');
        console.log('- There might be a caching issue');
        console.log('- The webhook URL might still not be working');
        
        // Let's test the webhook URL again
        console.log('\n2️⃣ Testing: Webhook URL Again');
        try {
          const webhookResponse = await axios.post(process.env.WEBHOOK_URL || 'https://httpbin.org/post', {
            test: 'webhook test'
          }, { timeout: 10000 });
          console.log('✅ Webhook URL is working, status:', webhookResponse.status);
        } catch (webhookError) {
          console.log('❌ Webhook URL test failed:', webhookError.message);
        }
      }
    }

  } catch (error) {
    console.log('❌ Test failed');
    console.log('Error:', error.message);
  }

  console.log('\n🎉 Final consent test completed!');
}

// Run the test
testConsentFinal().catch(console.error);
