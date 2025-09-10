// Set environment variables
process.env.MASTERCARD_CLIENT_ID = '5ad34a4227b6c585beaa8dc7e1d2d2f5';
process.env.MASTERCARD_CLIENT_SECRET = 'QFgTbpYOHHPBU8xfFZ5p';
process.env.MASTERCARD_PARTNER_ID = '2445584957219';
process.env.MASTERCARD_API_BASE_URL = 'https://api.openbanking.mastercard.com.au';
process.env.MASTERCARD_AUTH_URL = 'https://api.openbanking.mastercard.com.au/oauth2/token';

console.log('🔧 Environment variables set:');
console.log('MASTERCARD_CLIENT_ID:', process.env.MASTERCARD_CLIENT_ID);
console.log('MASTERCARD_PARTNER_ID:', process.env.MASTERCARD_PARTNER_ID);
console.log('MASTERCARD_API_BASE_URL:', process.env.MASTERCARD_API_BASE_URL);
console.log('');

// Import and start the server
const { spawn } = require('child_process');

console.log('🚀 Starting server with environment variables...');

const server = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    MASTERCARD_CLIENT_ID: '5ad34a4227b6c585beaa8dc7e1d2d2f5',
    MASTERCARD_CLIENT_SECRET: 'QFgTbpYOHHPBU8xfFZ5p',
    MASTERCARD_PARTNER_ID: '2445584957219',
    MASTERCARD_API_BASE_URL: 'https://api.openbanking.mastercard.com.au',
    MASTERCARD_AUTH_URL: 'https://api.openbanking.mastercard.com.au/oauth2/token'
  }
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
});
