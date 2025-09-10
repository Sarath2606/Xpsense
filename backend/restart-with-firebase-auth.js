/**
 * Restart Backend with Firebase Authentication
 * 
 * This script helps restart the backend server with updated Firebase authentication.
 */

const { spawn } = require('child_process');

console.log('🔄 Restarting backend with Firebase authentication...');
console.log('');

console.log('📋 Changes made:');
console.log('   - Updated Splitwise routes to use Firebase authentication');
console.log('   - Updated controllers to use FirebaseAuthRequest interface');
console.log('   - Fixed authentication token verification');
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
