const axios = require('axios');

async function quickTest() {
  try {
    console.log('Testing server...');
    const response = await axios.get('http://localhost:3001/health', { timeout: 5000 });
    console.log('✅ Server is running!');
    console.log('Status:', response.status);
    return true;
  } catch (error) {
    console.log('❌ Server is not responding');
    console.log('Error:', error.message);
    return false;
  }
}

quickTest();
