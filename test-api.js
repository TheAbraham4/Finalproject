/**
 * Test script for Abraham Restaurant REST API
 * This tests the Botpress reservation endpoint
 */

const axios = require('axios');

async function testAPI() {
  try {
    console.log('🧪 Testing Abraham Restaurant REST API...');
    
    const API_URL = 'http://localhost:8080/api/botpress-reservations';
    
    // Test data matching your Botpress workflow
    const testReservation = {
      email: 'test@example.com',
      datetime: '2024-12-25T19:00:00',
      partySize: 4
    };
    
    console.log('📤 Sending test reservation:', testReservation);
    console.log('📍 API URL:', API_URL);
    
    const response = await axios.post(API_URL, testReservation, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ SUCCESS! API is working!');
    console.log('📊 Response:', response.data);
    console.log('🎉 Your REST API bridge is ready for Botpress!');
    
  } catch (error) {
    console.error('❌ API Test Failed:');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🔌 Connection refused - Is your backend server running?');
      console.error('💡 Start server with: cd backend && npm start');
    } else if (error.response) {
      console.error('📊 Response status:', error.response.status);
      console.error('📊 Response data:', error.response.data);
    } else {
      console.error('📊 Error message:', error.message);
    }
  }
}

// Run the test
testAPI();
