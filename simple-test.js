const http = require('http');

const postData = JSON.stringify({
  email: 'test@example.com',
  datetime: '2024-12-26T10:00:00',
  partySize: 2
});

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/api/botpress-reservations',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🧪 Testing with native http module...');
console.log('📤 Sending data:', postData);

const req = http.request(options, (res) => {
  console.log(`✅ Status: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📥 Response:', data);
  });
});

req.on('error', (e) => {
  console.error(`❌ Request error: ${e.message}`);
});

req.write(postData);
req.end();
