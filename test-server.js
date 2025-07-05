const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Simple test route
app.get('/test', (req, res) => {
  console.log('📥 GET /test request received');
  res.json({ message: 'Server is working!' });
});

// Test Botpress endpoint without database
app.post('/api/botpress-reservations', (req, res) => {
  console.log('📥 POST /api/botpress-reservations request received');
  console.log('🤖 Request body:', req.body);
  console.log('🔍 Request headers:', req.headers);

  res.json({
    success: true,
    message: 'Test endpoint working',
    received: req.body
  });

  console.log('📤 Response sent successfully');
});

const PORT = 8080;
console.log(`Starting test server on port ${PORT}...`);
app.listen(PORT, () => {
  console.log(`✅ Test server running on port ${PORT}`);
}).on('error', (err) => {
  console.error('❌ Server failed to start:', err);
});
