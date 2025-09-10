const axios = require('axios');

async function getAppToken() {
  console.log('🔐 Getting Mastercard App-Token...\n');

  const baseUrl = 'https://api.openbanking.mastercard.com.au';
  const clientId = '5ad34a4227b6c585beaa8dc7e1d2d2f5';
  const partnerId = '2445584957219';
  const partnerSecret = 'QFgTbpYOHHPBU8xfFZ5p';

  console.log('📋 Configuration:');
  console.log('Base URL:', baseUrl);
  console.log('Client ID:', clientId);
  console.log('Partner ID:', partnerId);
  console.log('');

  try {
    const response = await axios.post(`${baseUrl}/aggregation/v2/partners/authentication`, {
      partnerId: partnerId,
      partnerSecret: partnerSecret
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'App-Key': clientId
      },
      timeout: 10000
    });

    console.log('✅ Successfully obtained App-Token!');
    console.log('Response status:', response.status);
    console.log('App-Token:', response.data.token);
    console.log('');
    console.log('💡 You can now use this token in your API requests:');
    console.log('Header: App-Token: ' + response.data.token);
    
    return response.data.token;
  } catch (error) {
    console.log('❌ Failed to get App-Token');
    console.log('Error:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

// Run the test
getAppToken().catch(console.error);
