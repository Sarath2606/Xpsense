const axios = require('axios');

async function testWebhookDirect() {
  console.log('🔍 Testing Webhook URL Directly...\n');

  const webhookUrl = 'https://httpbin.org/post';
  
  try {
    console.log('Testing webhook URL:', webhookUrl);
    
    // Test if the webhook URL is accessible
    const response = await axios.post(webhookUrl, {
      test: 'data',
      timestamp: new Date().toISOString()
    }, {
      timeout: 10000
    });
    
    console.log('✅ Webhook URL is accessible!');
    console.log('Status:', response.status);
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('❌ Webhook URL test failed');
    console.log('Error:', error.message);
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response:', error.response.data);
    }
  }

  console.log('\n🎉 Webhook test completed!');
}

// Run the test
testWebhookDirect().catch(console.error);
