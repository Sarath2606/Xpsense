#!/usr/bin/env node

/**
 * Railway Environment Variables Checker
 * This script helps identify the correct database URL variables
 */

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, 'env.local') });

console.log('🔍 Checking Railway Database URL Variables...\n');

// Check all database-related environment variables
const dbVars = [
  'DATABASE_URL',
  'DATABASE_PUBLIC_URL', 
  'POSTGRES_URL',
  'POSTGRES_PUBLIC_URL',
  'PG_URL',
  'PG_PUBLIC_URL'
];

console.log('📋 Database URL Variables:');
dbVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: Set`);
    // Parse and show connection details (without password)
    try {
      const url = new URL(value);
      console.log(`   Host: ${url.hostname}`);
      console.log(`   Port: ${url.port}`);
      console.log(`   Database: ${url.pathname.substring(1)}`);
      console.log(`   User: ${url.username}`);
      console.log(`   Protocol: ${url.protocol}`);
    } catch (error) {
      console.log(`   ❌ Invalid URL format`);
    }
  } else {
    console.log(`❌ ${varName}: Not set`);
  }
  console.log('');
});

// Check other important variables
console.log('📋 Other Important Variables:');
const otherVars = ['NODE_ENV', 'PORT', 'FIREBASE_PROJECT_ID'];
otherVars.forEach(varName => {
  const value = process.env[varName];
  console.log(`${varName}: ${value ? '✅ Set' : '❌ Not set'}`);
});

console.log('\n🔧 Recommendations:');
console.log('1. For Railway internal services, use DATABASE_URL');
console.log('2. For external connections, use DATABASE_PUBLIC_URL');
console.log('3. Make sure your Railway PostgreSQL service is linked to your backend service');
console.log('4. Check Railway dashboard → Your Backend Service → Variables tab');
