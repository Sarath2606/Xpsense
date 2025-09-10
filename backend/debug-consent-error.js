const axios = require('axios');

async function debugConsentError() {
  console.log('🔍 Debugging Consent Endpoint Error...\n');

  try {
    // Test with a real Firebase token format
    const testUserId = 'test-user-12345';
    
    console.log('1️⃣ Testing: Consent Start with Test User ID');
    console.log('User ID:', testUserId);
    
    try {
      const consentResponse = await axios.post('http://localhost:3001/api/consents/start', {
        institutionId: 'test-institution',
        durationDays: 180
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testUserId}` // Use user ID as token for testing
        }
      });
      
      console.log('✅ Consent start successful!');
      console.log('Status:', consentResponse.status);
      console.log('Data:', JSON.stringify(consentResponse.data, null, 2));
      
    } catch (error) {
      console.log('❌ Consent start failed');
      console.log('Status:', error.response?.status);
      console.log('Error Response:', JSON.stringify(error.response?.data, null, 2));
      
      if (error.response?.status === 500) {
        console.log('\n🔍 Detailed 500 Error Analysis:');
        console.log('The error is in the consent controller.');
        console.log('Let me check if it\'s a database issue...');
        
        // Test database connection
        await testDatabaseConnection();
      }
    }

  } catch (error) {
    console.log('❌ Debug test failed');
    console.log('Error:', error.message);
  }
}

async function testDatabaseConnection() {
  try {
    console.log('\n2️⃣ Testing: Database Connection');
    
    // Test a simple database endpoint
    const healthResponse = await axios.get('http://localhost:3001/health');
    console.log('✅ Health endpoint works');
    console.log('Health data:', JSON.stringify(healthResponse.data, null, 2));
    
    // Test if we can access user-related endpoints
    console.log('\n3️⃣ Testing: User Endpoints');
    try {
      const userResponse = await axios.get('http://localhost:3001/api/users/profile', {
        headers: {
          'Authorization': 'Bearer test-user-12345'
        }
      });
      console.log('✅ User profile endpoint works');
    } catch (userError) {
      console.log('❌ User profile endpoint failed:', userError.response?.status);
      console.log('This might indicate a database or auth middleware issue');
    }
    
  } catch (error) {
    console.log('❌ Database test failed');
    console.log('Error:', error.message);
  }
}

// Run the debug
debugConsentError().catch(console.error);
