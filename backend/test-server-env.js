const axios = require('axios');

async function testServerEnv() {
  console.log('🔍 Testing Server Environment Variables...\n');

  try {
    // Test if we can get environment info from the server
    console.log('1️⃣ Testing: Server Health');
    const healthResponse = await axios.get('http://localhost:3001/health');
    console.log('✅ Server is running');
    console.log('Health data:', healthResponse.data);

    // Test the sandbox status endpoint to see if it's working
    console.log('\n2️⃣ Testing: Sandbox Status');
    const statusResponse = await axios.get('http://localhost:3001/api/consents/sandbox-status');
    console.log('✅ Sandbox status endpoint works');
    console.log('Status:', statusResponse.data);

    // Test a simple POST to see if the server is responding
    console.log('\n3️⃣ Testing: Simple POST Request');
    try {
      const testResponse = await axios.post('http://localhost:3001/api/consents/start', {
        durationDays: 180
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-user-12345'
        },
        timeout: 10000
      });
      console.log('✅ POST request successful');
      console.log('Response:', testResponse.data);
    } catch (error) {
      console.log('❌ POST request failed');
      console.log('Status:', error.response?.status);
      console.log('Error:', error.response?.data);
      
      if (error.response?.status === 500) {
        console.log('\n🔍 500 Error Details:');
        console.log('The server is returning a 500 error, which means:');
        console.log('- The request is reaching the server');
        console.log('- The server is processing the request');
        console.log('- But there\'s an error in the consent controller');
        console.log('- This suggests the webhook URL issue might be resolved');
        console.log('- But there might be another issue in the code');
      }
    }

  } catch (error) {
    console.log('❌ Test failed');
    console.log('Error:', error.message);
  }

  console.log('\n🎉 Server environment test completed!');
}

// Run the test
testServerEnv().catch(console.error);
