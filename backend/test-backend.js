// Simple backend test script
const express = require('express');
const cors = require('cors');
require('dotenv').config();

console.log('🔍 Backend Environment Test');
console.log('==========================');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('PORT:', process.env.PORT || 'not set');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Found' : 'Missing');
console.log('');

// Test basic Express server
const app = express();
const PORT = process.env.PORT || 3001;

// Basic middleware
app.use(cors({
  origin: ['http://localhost:3002', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Backend server is running!'
  });
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Backend API is working!'
  });
});

// Test Splitwise endpoint (without database)
app.get('/api/splitwise/test', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Splitwise API endpoint is accessible',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API health: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Splitwise test: http://localhost:${PORT}/api/splitwise/test`);
  console.log('');
  console.log('✅ Backend test server started successfully!');
  console.log('Press Ctrl+C to stop the server');
});

// Handle shutdown gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down test server...');
  process.exit(0);
});
