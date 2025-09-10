const { mastercardApiService } = require('./dist/services/mastercard-api.service.js');
require('dotenv').config({ path: './env.local' });

async function testMastercardMethods() {
  console.log('🔍 Testing Mastercard API Methods...\n');

  try {
    console.log('1️⃣ Testing: getAppToken');
    const token = await mastercardApiService.getAppToken();
    console.log('✅ getAppToken successful, token length:', token.length);
    console.log('Token preview:', token.substring(0, 20) + '...');

    console.log('\n2️⃣ Testing: createTestCustomer');
    try {
      const customerId = await mastercardApiService.createTestCustomer(
        'test-user-12345',
        'test@example.com',
        'Test User'
      );
      console.log('✅ createTestCustomer successful');
      console.log('Customer ID:', customerId);

      console.log('\n3️⃣ Testing: generateConnectUrl');
      try {
        const connectUrl = await mastercardApiService.generateConnectUrl(customerId);
        console.log('✅ generateConnectUrl successful');
        console.log('Connect URL:', connectUrl);
      } catch (error) {
        console.log('❌ generateConnectUrl failed:', error.message);
        console.log('Error details:', error);
      }

    } catch (error) {
      console.log('❌ createTestCustomer failed:', error.message);
      console.log('Error details:', error);
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('Error details:', error);
  }

  console.log('\n🎉 Mastercard methods test completed!');
}

// Run the test
testMastercardMethods().catch(console.error);
