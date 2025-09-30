// Test invitation URL generation
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
const token = 'test-token-123';

const acceptUrl = `${frontendUrl}/splitwise/invite/accept?token=${token}`;

console.log('🔍 Invitation URL Test:');
console.log('FRONTEND_URL:', frontendUrl);
console.log('Generated URL:', acceptUrl);
console.log('Expected format: https://xpenses-app.pages.dev/splitwise/invite/accept?token=...');
console.log('');

// Test URL parsing
console.log('🧪 Testing URL parsing:');
const testUrl = 'https://xpenses-app.pages.dev/splitwise/invite/accept?token=abc123';
const url = new URL(testUrl);

console.log('Test URL:', testUrl);
console.log('Pathname:', url.pathname);
console.log('Search:', url.search);
console.log('Hash:', url.hash);
console.log('Token from search:', url.searchParams.get('token'));
console.log('');

// Test the conditions
const pathnameIncludes = url.pathname.includes('/splitwise/invite/accept');
const searchIncludes = url.search.includes('token=');
const hashIncludes = url.hash.includes('splitwise/invite/accept');

console.log('📋 Condition Tests:');
console.log('pathname.includes("/splitwise/invite/accept"):', pathnameIncludes);
console.log('search.includes("token="):', searchIncludes);
console.log('hash.includes("splitwise/invite/accept"):', hashIncludes);
console.log('Should show invitation page:', pathnameIncludes || hashIncludes || searchIncludes);
