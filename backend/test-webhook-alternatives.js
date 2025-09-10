const { mastercardApiService } = require('./dist/services/mastercard-api.service.js');
require('dotenv').config({ path: './env.local' });

async function testWebhookAlternatives() {
  console.log('🔍 Testing Webhook Alternatives...\n');

  try {
    console.log('1️⃣ Testing: getAppToken');
    const token = await mastercardApiService.getAppToken();
    console.log('✅ getAppToken successful, token length:', token.length);

    console.log('\n2️⃣ Testing: createTestCustomer');
    const customerId = await mastercardApiService.createTestCustomer(
      'test-user-12345',
      'test@example.com',
      'Test User'
    );
    console.log('✅ createTestCustomer successful, Customer ID:', customerId);

    console.log('\n3️⃣ Testing: Different Webhook URLs');
    
    // Test with different webhook URLs
    const webhookUrls = [
      'https://httpbin.org/post',  // Public HTTP testing service
      'https://postman-echo.com/post',  // Postman echo service
      'https://webhook.site/8a5b2c1d-3e4f-5g6h-7i8j-9k0l1m2n3o4p',  // Our configured webhook
      'https://requestbin.com/r/your-bin-id',  // RequestBin service
    ];

    for (const webhookUrl of webhookUrls) {
      console.log(`\nTesting webhook URL: ${webhookUrl}`);
      try {
        const connectUrl = await mastercardApiService.generateConnectUrl(customerId, webhookUrl);
        console.log('✅ generateConnectUrl successful with this webhook');
        console.log('Connect URL:', connectUrl);
        break; // If successful, stop testing
      } catch (error) {
        console.log('❌ Failed with this webhook:', error.message);
        if (error.message.includes('webhook')) {
          console.log('   Webhook-specific error detected');
        }
      }
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }

  console.log('\n🎉 Webhook alternatives test completed!');
}

// Run the test
testWebhookAlternatives().catch(console.error);
