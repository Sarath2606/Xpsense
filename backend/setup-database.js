#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

async function setupDatabase() {
  console.log('🔧 Setting up database...');
  
  try {
    // Generate Prisma client
    console.log('1️⃣ Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Push database schema
    console.log('2️⃣ Pushing database schema...');
    execSync('npx prisma db push', { stdio: 'inherit' });
    
    // Test connection
    console.log('3️⃣ Testing database connection...');
    const prisma = new PrismaClient();
    await prisma.$connect();
    
    // Check if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log('✅ Database setup complete!');
    console.log('📊 Tables created:', tables.length);
    console.log('🗂️ Table names:', tables.map(t => t.table_name).join(', '));
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();
