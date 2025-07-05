const axios = require('axios');

async function testBotpressAPI() {
  try {
    console.log('🧪 Testing Botpress API endpoint...');
    
    const testData = {
      email: 'test@example.com',
      datetime: '2024-12-26T10:00:00',
      partySize: 2
    };
    
    console.log('📤 Sending request with data:', testData);
    
    const response = await axios.post('http://localhost:8080/api/botpress-reservations', testData, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'abraham-restaurant-botpress-2024'
      }
    });
    
    console.log('✅ SUCCESS! Response:', response.data);
    console.log('📊 Status Code:', response.status);
    
  } catch (error) {
    console.log('❌ ERROR occurred:');
    console.log('Error type:', error.code);
    console.log('Error message:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response data:', error.response.data);
    } else if (error.request) {
      console.log('No response received. Request was made but no response.');
      console.log('Request details:', error.request);
    } else {
      console.log('Error setting up request:', error.message);
    }
  }
}

testBotpressAPI();
