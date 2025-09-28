#!/usr/bin/env node

/**
 * Database Health Check Script
 * This script helps diagnose database connection issues on Railway
 */

const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, 'env.local') });

async function checkDatabaseHealth() {
  console.log('🔍 Checking database health...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Not set'}`);
  
  if (process.env.DATABASE_URL) {
    // Parse DATABASE_URL to show connection details (without password)
    try {
      const url = new URL(process.env.DATABASE_URL);
      console.log(`Database Host: ${url.hostname}`);
      console.log(`Database Port: ${url.port}`);
      console.log(`Database Name: ${url.pathname.substring(1)}`);
      console.log(`Database User: ${url.username}`);
    } catch (error) {
      console.log('❌ Invalid DATABASE_URL format');
    }
  }
  
  console.log('\n🔌 Testing Database Connection:');
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
  
  try {
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`✅ Database query successful - Found ${userCount} users`);
    
    // Test creating a test user (will be cleaned up)
    const testUser = await prisma.user.upsert({
      where: { email: 'health-check-test@example.com' },
      update: { name: 'Health Check Test' },
      create: {
        email: 'health-check-test@example.com',
        name: 'Health Check Test',
        firebaseUid: 'health-check-test-uid'
      }
    });
    console.log('✅ Database write operation successful');
    
    // Clean up test user
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    console.log('✅ Database delete operation successful');
    
    console.log('\n🎉 Database is healthy and fully functional!');
    
  } catch (error) {
    console.log('❌ Database connection failed:');
    console.log(`Error: ${error.message}`);
    console.log(`Code: ${error.code || 'Unknown'}`);
    
    if (error.message.includes('Can\'t reach database server')) {
      console.log('\n🔧 Troubleshooting suggestions:');
      console.log('1. Check if your Railway PostgreSQL service is running');
      console.log('2. Verify the DATABASE_URL environment variable is correct');
      console.log('3. Ensure the database service is linked to your backend service');
      console.log('4. Check Railway service logs for database issues');
    }
    
    if (error.message.includes('authentication failed')) {
      console.log('\n🔧 Authentication issue:');
      console.log('1. Check your database credentials in Railway');
      console.log('2. Verify the DATABASE_URL contains correct username/password');
    }
    
    if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.log('\n🔧 Database doesn\'t exist:');
      console.log('1. Run: npm run db:push (to create database schema)');
      console.log('2. Or run: npm run db:migrate (for migrations)');
    }
    
  } finally {
    await prisma.$disconnect();
  }
}

// Run the health check
checkDatabaseHealth()
  .then(() => {
    console.log('\n✅ Health check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Health check failed:', error);
    process.exit(1);
  });
