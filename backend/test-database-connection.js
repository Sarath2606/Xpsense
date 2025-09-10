const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: './env.local' });

async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection...\n');

  const databaseUrl = process.env.DATABASE_URL;
  console.log('Database URL:', databaseUrl ? `${databaseUrl.substring(0, 30)}...` : 'NOT SET');
  console.log('');

  if (!databaseUrl) {
    console.log('❌ DATABASE_URL not set in environment variables');
    return;
  }

  const prisma = new PrismaClient();

  try {
    console.log('1️⃣ Testing: Database Connection');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');

    console.log('\n2️⃣ Testing: Database Tables');
    
    // Test if we can query the User table
    try {
      const userCount = await prisma.user.count();
      console.log('✅ User table accessible, count:', userCount);
    } catch (error) {
      console.log('❌ User table error:', error.message);
    }

    // Test if we can query the Institution table
    try {
      const institutionCount = await prisma.institution.count();
      console.log('✅ Institution table accessible, count:', institutionCount);
    } catch (error) {
      console.log('❌ Institution table error:', error.message);
    }

    // Test if we can query the Consent table
    try {
      const consentCount = await prisma.consent.count();
      console.log('✅ Consent table accessible, count:', consentCount);
    } catch (error) {
      console.log('❌ Consent table error:', error.message);
    }

    console.log('\n3️⃣ Testing: Create Test User');
    
    try {
      const testUser = await prisma.user.upsert({
        where: { id: 'test-user-12345' },
        update: {},
        create: {
          id: 'test-user-12345',
          email: 'test@example.com',
          name: 'Test User',
          firebaseUid: 'test-user-12345'
        }
      });
      console.log('✅ Test user created/updated:', testUser.email);
    } catch (error) {
      console.log('❌ Test user creation error:', error.message);
    }

    console.log('\n4️⃣ Testing: Create Test Institution');
    
    try {
      const testInstitution = await prisma.institution.upsert({
        where: { code: 'AUS-CDR-Mastercard' },
        update: {},
        create: {
          name: 'Mastercard Open Banking',
          code: 'AUS-CDR-Mastercard',
          logoUrl: 'https://example.com/mastercard-logo.png'
        }
      });
      console.log('✅ Test institution created/updated:', testInstitution.name);
    } catch (error) {
      console.log('❌ Test institution creation error:', error.message);
    }

  } catch (error) {
    console.log('❌ Database connection failed');
    console.log('Error:', error.message);
    
    if (error.code === 'P1001') {
      console.log('\n🔍 P1001 Error Analysis:');
      console.log('- Cannot reach database server');
      console.log('- Check if PostgreSQL is running');
      console.log('- Verify database URL is correct');
    } else if (error.code === 'P1003') {
      console.log('\n🔍 P1003 Error Analysis:');
      console.log('- Database does not exist');
      console.log('- Run: npm run db:push');
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n🎉 Database connection test completed!');
}

// Run the test
testDatabaseConnection().catch(console.error);
