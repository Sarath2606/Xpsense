#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function testDatabase() {
  console.log('🔍 Testing Railway Database Connection...');
  
  const databaseUrl = process.env.DATABASE_URL;
  console.log('Database URL:', databaseUrl ? `${databaseUrl.substring(0, 50)}...` : 'NOT SET');
  
  if (!databaseUrl) {
    console.log('❌ DATABASE_URL not set');
    return;
  }
  
  const prisma = new PrismaClient();
  
  try {
    console.log('1️⃣ Testing connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    console.log('2️⃣ Checking existing tables...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log('📊 Current tables:', tables.length);
    if (tables.length > 0) {
      console.log('🗂️ Table names:', tables.map(t => t.table_name).join(', '));
    } else {
      console.log('⚠️ No tables found - need to create them');
    }
    
    console.log('3️⃣ Testing User table...');
    try {
      const userCount = await prisma.user.count();
      console.log('✅ User table accessible, count:', userCount);
    } catch (error) {
      console.log('❌ User table error:', error.message);
    }
    
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    
    if (error.code === 'P1001') {
      console.log('🔍 Cannot reach database server - check DATABASE_URL');
    } else if (error.code === 'P2021') {
      console.log('🔍 Tables do not exist - need to run migrations');
    }
  } finally {
    await prisma.$disconnect();
  }
  
  console.log('🎉 Database test completed!');
}

testDatabase().catch(console.error);
