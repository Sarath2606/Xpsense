/**
 * Restart Backend with New Rate Limits
 * 
 * This script helps restart the backend server with updated rate limiting settings.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Restarting backend with new rate limiting settings...');
console.log('');

// Check if .env file exists and update rate limiting settings
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Update rate limiting settings
  envContent = envContent.replace(
    /RATE_LIMIT_WINDOW_MS=\d+/g,
    'RATE_LIMIT_WINDOW_MS=60000'
  );
  envContent = envContent.replace(
    /RATE_LIMIT_MAX_REQUESTS=\d+/g,
    'RATE_LIMIT_MAX_REQUESTS=5000'
  );
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Updated .env file with new rate limiting settings');
} else {
  console.log('⚠️  No .env file found. Please create one with:');
  console.log('   RATE_LIMIT_WINDOW_MS=60000');
  console.log('   RATE_LIMIT_MAX_REQUESTS=5000');
}

console.log('');
console.log('📋 New rate limiting settings:');
console.log('   - 5000 requests per minute in development');
console.log('   - 1 minute window instead of 15 minutes');
console.log('   - Better error handling and logging');
console.log('');

console.log('🚀 Starting backend server...');
console.log('   (Press Ctrl+C to stop)');
console.log('');

// Start the backend server
const server = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

server.on('error', (error) => {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`\n🛑 Server stopped with code ${code}`);
});
