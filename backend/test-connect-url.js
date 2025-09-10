const axios = require('axios');

async function testConnectUrl() {
  console.log('🔗 Testing Mastercard Connect URL Generation...\n');

  const baseUrl = 'https://api.openbanking.mastercard.com.au';
  const clientId = '5ad34a4227b6c585beaa8dc7e1d2d2f5';
  const partnerId = '2445584957219';
  const partnerSecret = 'QFgTbpYOHHPBU8xfFZ5p';

  console.log('📋 Configuration:');
  console.log('Base URL:', baseUrl);
  console.log('Client ID:', clientId);
  console.log('Partner ID:', partnerId);
  console.log('');

  try {
    // Step 1: Get App-Token
    console.log('1️⃣ Getting App-Token...');
    const tokenResponse = await axios.post(`${baseUrl}/aggregation/v2/partners/authentication`, {
      partnerId: partnerId,
      partnerSecret: partnerSecret
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'App-Key': clientId
      }
    });

    const appToken = tokenResponse.data.token;
    console.log('✅ App-Token obtained:', appToken);
    console.log('');

    // Step 2: Create a test customer
    console.log('2️⃣ Creating test customer...');
    const customerId = 'test-customer-' + Date.now();
    
    const customerResponse = await axios.post(`${baseUrl}/aggregation/v2/customers/testing`, {
      username: 'testuser' + Date.now(),
      firstName: 'Test',
      lastName: 'User',
      email: 'test' + Date.now() + '@example.com',
      phone: '+61412345678'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'App-Token': appToken,
        'App-Key': clientId
      }
    });

    const createdCustomerId = customerResponse.data.id;
    console.log('✅ Test customer created:', createdCustomerId);
    console.log('');

    // Step 3: Generate Connect URL
    console.log('3️⃣ Generating Connect URL...');
    // Use a public webhook URL for testing (you can use webhook.site or similar)
    const webhookUrl = 'https://webhook.site/unique-id'; // Replace with your public webhook URL

    const connectResponse = await axios.post(`${baseUrl}/connect/v2/generate`, {
      partnerId: partnerId,
      customerId: createdCustomerId
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'App-Token': appToken,
        'App-Key': clientId
      }
    });

    console.log('✅ Connect URL generated successfully!');
    console.log('Full response:', JSON.stringify(connectResponse.data, null, 2));
    console.log('Connect URL:', connectResponse.data.connectUrl || connectResponse.data.url || connectResponse.data);
    console.log('');
    console.log('🎉 Connect URL generation test completed successfully!');
    console.log('');
    console.log('💡 This URL should be used instead of the OAuth2 authorize URL');
    console.log('The Connect URL will open in a new window/tab, not in an iframe');
    console.log('This resolves the X-Frame-Options error you were experiencing');

  } catch (error) {
    console.log('❌ Connect URL generation test failed');
    console.log('Error:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the test
testConnectUrl().catch(console.error);
