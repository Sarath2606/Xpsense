const axios = require('axios');

async function testConsentEndpoint() {
  console.log('🧪 Testing Consent Endpoint...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing: Health Check');
    const healthResponse = await axios.get('http://localhost:3001/health');
    console.log('✅ Health check passed');
    console.log('Status:', healthResponse.status);
    console.log('Data:', healthResponse.data);
    console.log('');

    // Test 2: Sandbox status
    console.log('2️⃣ Testing: Sandbox Status');
    const statusResponse = await axios.get('http://localhost:3001/api/consents/sandbox-status');
    console.log('✅ Sandbox status check passed');
    console.log('Status:', statusResponse.status);
    console.log('Data:', JSON.stringify(statusResponse.data, null, 2));
    console.log('');

    // Test 3: Consent start endpoint (this is where the 500 error occurs)
    console.log('3️⃣ Testing: Consent Start Endpoint');
    try {
      const consentResponse = await axios.post('http://localhost:3001/api/consents/start', {
        institutionId: 'test-institution',
        durationDays: 180
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token' // Mock token for testing
        }
      });
      console.log('✅ Consent start passed');
      console.log('Status:', consentResponse.status);
      console.log('Data:', JSON.stringify(consentResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Consent start failed (this is expected without proper auth)');
      console.log('Status:', error.response?.status);
      console.log('Error:', error.response?.data || error.message);
      
      if (error.response?.status === 500) {
        console.log('\n🔍 500 Error Details:');
        console.log('This suggests a server-side error in the consent controller');
        console.log('Possible causes:');
        console.log('- Database connection issue');
        console.log('- Missing environment variables');
        console.log('- Error in the new Connect flow code');
        console.log('- Missing App-Token or authentication');
      }
    }
    console.log('');

    console.log('🎉 Consent endpoint test completed!');

  } catch (error) {
    console.log('❌ Test failed');
    console.log('Error:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the test
testConsentEndpoint().catch(console.error);
