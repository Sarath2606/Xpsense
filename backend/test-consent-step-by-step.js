const axios = require('axios');
const jwt = require('jsonwebtoken');

async function testConsentStepByStep() {
  console.log('🔍 Testing Consent Controller Step by Step...\n');

  try {
    // Create a valid JWT token
    const JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';
    const testUser = {
      id: 'test-user-12345',
      email: 'test@example.com',
      name: 'Test User'
    };
    
    const token = jwt.sign(testUser, JWT_SECRET, { expiresIn: '1h' });
    console.log('1️⃣ Created JWT Token for user:', testUser.id);
    console.log('');

    // Test 1: Check if the consent endpoint exists
    console.log('2️⃣ Testing: Consent Endpoint Existence');
    try {
      const optionsResponse = await axios.options('http://localhost:3001/api/consents/start');
      console.log('✅ OPTIONS request successful');
      console.log('Status:', optionsResponse.status);
    } catch (error) {
      console.log('❌ OPTIONS request failed');
      console.log('Status:', error.response?.status);
    }
    console.log('');

    // Test 2: Test with minimal payload
    console.log('3️⃣ Testing: Consent Start with Minimal Payload');
    try {
      const consentResponse = await axios.post('http://localhost:3001/api/consents/start', {}, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
        console.log('\n🔍 500 Error Details:');
        console.log('The error is in the consent controller.');
        console.log('Let me check the server logs...');
        
        // The error is likely in one of these areas:
        console.log('\nPossible error locations:');
        console.log('1. mastercardApiService.getAppToken()');
        console.log('2. prisma.user.findUnique()');
        console.log('3. mastercardApiService.createTestCustomer()');
        console.log('4. mastercardApiService.generateConnectUrl()');
        console.log('5. prisma.consent.create()');
        
        // Let's test each step individually
        await testIndividualSteps();
      }
    }

  } catch (error) {
    console.log('❌ Test failed');
    console.log('Error:', error.message);
  }
}

async function testIndividualSteps() {
  console.log('\n4️⃣ Testing: Individual Steps');
  
  try {
    // Test Mastercard API service directly
    console.log('Testing Mastercard API service...');
    
    const { mastercardApiService } = require('./dist/services/mastercard-api.service');
    
    try {
      const appToken = await mastercardApiService.getAppToken();
      console.log('✅ getAppToken() successful');
      console.log('Token:', appToken);
    } catch (error) {
      console.log('❌ getAppToken() failed');
      console.log('Error:', error.message);
    }
    
  } catch (error) {
    console.log('❌ Individual step test failed');
    console.log('Error:', error.message);
  }
}

// Run the test
testConsentStepByStep().catch(console.error);
