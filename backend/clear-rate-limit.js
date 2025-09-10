/**
 * Clear Rate Limit Cache Script
 * 
 * This script clears the rate limiting cache for development purposes.
 * Run this when you're getting rate limited during development.
 */

const redis = require('redis');
const { promisify } = require('util');

async function clearRateLimit() {
  try {
    // Create Redis client (if using Redis for rate limiting)
    const client = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
    });

    const flushdb = promisify(client.flushdb).bind(client);
    
    console.log('🔄 Clearing rate limit cache...');
    await flushdb();
    console.log('✅ Rate limit cache cleared successfully!');
    
    client.quit();
  } catch (error) {
    console.log('⚠️  Could not clear Redis cache (Redis might not be running)');
    console.log('📝 Alternative: Restart your backend server to clear rate limits');
    console.log('💡 For development, you can also update your .env file:');
    console.log('   RATE_LIMIT_WINDOW_MS=60000');
    console.log('   RATE_LIMIT_MAX_REQUESTS=5000');
  }
}

clearRateLimit();
