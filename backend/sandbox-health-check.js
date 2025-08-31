const axios = require('axios');

const baseUrl = 'https://api.openbanking.mastercard.com.au';
const clientId = '5ad34a4227b6c585beaa8dc7e1d2d2f5';
const clientSecret = 'QFgTbpYOHHPBU8xfFZ5p';

async function checkSandboxHealth() {
  const timestamp = new Date().toISOString();
  
  try {
    console.log(`[${timestamp}] 🔍 Checking sandbox health...`);
    
    // Test basic connectivity
    const response = await axios.get(`${baseUrl}/institutions`, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log(`[${timestamp}] ✅ SANDBOX IS ONLINE! Status: ${response.status}`);
    
    if (response.data && response.data.institutions) {
      console.log(`[${timestamp}] 📊 Found ${response.data.institutions.length} institutions`);
    }
    
    return true;
    
  } catch (error) {
    const status = error.response?.status || 'No response';
    const message = error.response?.data || error.message;
    
    console.log(`[${timestamp}] ❌ Sandbox is offline - Status: ${status}`);
    
    if (error.response?.status === 503) {
      console.log(`[${timestamp}] 🔧 Service Unavailable - Likely maintenance in progress`);
    } else if (error.response?.status === 401) {
      console.log(`[${timestamp}] 🔐 Authentication Error - Check credentials`);
    } else if (error.response?.status === 429) {
      console.log(`[${timestamp}] ⏱️ Rate Limited - Wait before retrying`);
    }
    
    return false;
  }
}

// Run health check immediately
checkSandboxHealth();

// Then run every 5 minutes
const interval = setInterval(async () => {
  const isOnline = await checkSandboxHealth();
  
  if (isOnline) {
    console.log('\n🎉 SANDBOX IS BACK ONLINE! You can now test your implementation.');
    console.log('Run: node test-mastercard-direct.js');
    clearInterval(interval);
  }
}, 5 * 60 * 1000); // 5 minutes

console.log('🔍 Sandbox health monitoring started. Checking every 5 minutes...');
console.log('Press Ctrl+C to stop monitoring\n');
