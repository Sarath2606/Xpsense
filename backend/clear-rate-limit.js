// Simple script to help with rate limiting during development
console.log('Rate limiting has been updated in the backend server.');
console.log('To apply changes:');
console.log('1. Stop the backend server (Ctrl+C)');
console.log('2. Restart it with: npm run dev');
console.log('');
console.log('New rate limit settings:');
console.log('- 5000 requests per minute in development');
console.log('- 1 minute window instead of 15 minutes');
console.log('- Successful requests are not counted');
console.log('- Failed requests are still counted');
console.log('');
console.log('The frontend now has:');
console.log('- Retry logic with exponential backoff');
console.log('- Debounced API calls');
console.log('- Removed unnecessary hook usage in modals');
