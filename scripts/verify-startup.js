// Pre-startup verification script for Render deployment
const https = require('https');
const http = require('http');

console.log('🔍 Pre-startup verification for SIRTIS...');

// Check environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'NODE_ENV'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars);
  process.exit(1);
}

console.log('✅ All required environment variables are present');

// Verify database URL format
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl.startsWith('postgres://') && !dbUrl.startsWith('postgresql://')) {
  console.error('❌ Invalid DATABASE_URL format. Must be a PostgreSQL connection string');
  process.exit(1);
}

console.log('✅ Database URL format is valid');

// Check port configuration
const port = process.env.PORT || '10000';
console.log(`📡 Server configured for port: ${port}`);

// Test if we can bind to the address
const testServer = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Test server running');
});

testServer.listen(0, '0.0.0.0', () => {
  console.log('✅ Can bind to 0.0.0.0 (all interfaces)');
  testServer.close();
  console.log('🚀 Pre-startup verification completed successfully');
});

testServer.on('error', (err) => {
  console.error('❌ Cannot bind to 0.0.0.0:', err.message);
  process.exit(1);
});