const axios = require('axios');
const jwt = require('jsonwebtoken');

async function testWithJWT() {
  console.log('🔐 Testing Consent Endpoint with Valid JWT Token...\n');

  try {
    // Create a valid JWT token
    const JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';
    const testUser = {
      id: 'test-user-12345',
      email: 'test@example.com',
      name: 'Test User'
    };
    
    const token = jwt.sign(testUser, JWT_SECRET, { expiresIn: '1h' });
    console.log('1️⃣ Created JWT Token');
    console.log('User ID:', testUser.id);
    console.log('Token:', token.substring(0, 50) + '...');
    console.log('');

    // Test consent endpoint with valid JWT
    console.log('2️⃣ Testing: Consent Start with Valid JWT');
    try {
      const consentResponse = await axios.post('http://localhost:3001/api/consents/start', {
        institutionId: 'test-institution',
        durationDays: 180
      }, {
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
        console.log('\n🔍 500 Error Analysis:');
        console.log('The error is still occurring even with valid JWT.');
        console.log('This suggests the issue is in the consent controller logic itself.');
        console.log('Possible causes:');
        console.log('1. Database connection issue');
        console.log('2. Prisma client error');
        console.log('3. Mastercard API service error');
        console.log('4. Error in the Connect flow code');
        
        // Let's check if it's a database issue
        await testDatabaseDirectly();
      }
    }

  } catch (error) {
    console.log('❌ Test failed');
    console.log('Error:', error.message);
  }
}

async function testDatabaseDirectly() {
  try {
    console.log('\n3️⃣ Testing: Database Connection Directly');
    
    // Test if we can connect to the database by checking if Prisma is working
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    try {
      // Try a simple database query
      const userCount = await prisma.user.count();
      console.log('✅ Database connection successful');
      console.log('User count:', userCount);
      
      // Try to find our test user
      const testUser = await prisma.user.findUnique({
        where: { id: 'test-user-12345' }
      });
      
      if (testUser) {
        console.log('✅ Test user found in database');
        console.log('User:', JSON.stringify(testUser, null, 2));
      } else {
        console.log('⚠️ Test user not found in database (this is expected)');
      }
      
    } catch (dbError) {
      console.log('❌ Database query failed');
      console.log('Error:', dbError.message);
    } finally {
      await prisma.$disconnect();
    }
    
  } catch (error) {
    console.log('❌ Database test failed');
    console.log('Error:', error.message);
  }
}

// Run the test
testWithJWT().catch(console.error);
