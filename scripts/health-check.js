#!/usr/bin/env node

/**
 * Production Health Check Script
 * Checks critical production endpoints and database connectivity
 */

const https = require('https');

const PRODUCTION_URL = 'https://sirtis-saywhat.onrender.com';

// Health check endpoints to test
const endpoints = [
  '/api/health',
  '/api/health-simple',
  '/api/auth/session',
  '/api/documents'
];

async function checkEndpoint(endpoint) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const req = https.get(`${PRODUCTION_URL}${endpoint}`, (res) => {
      const duration = Date.now() - startTime;
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const isJson = res.headers['content-type']?.includes('application/json');
        
        resolve({
          endpoint,
          status: res.statusCode,
          duration: `${duration}ms`,
          contentType: res.headers['content-type'],
          isJson,
          responseSize: data.length,
          error: false,
          preview: isJson ? 
            (data.length > 100 ? data.substring(0, 100) + '...' : data) :
            `HTML Response (${data.length} chars)`
        });
      });
    });
    
    req.on('error', (err) => {
      const duration = Date.now() - startTime;
      resolve({
        endpoint,
        status: 'ERROR',
        duration: `${duration}ms`,
        error: true,
        message: err.message
      });
    });
    
    req.setTimeout(10000, () => {
      req.abort();
      const duration = Date.now() - startTime;
      resolve({
        endpoint,
        status: 'TIMEOUT',
        duration: `${duration}ms`,
        error: true,
        message: 'Request timeout after 10s'
      });
    });
  });
}

async function runHealthCheck() {
  console.log('🔍 SIRTIS Production Health Check');
  console.log('================================');
  console.log(`Target: ${PRODUCTION_URL}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('');
  
  const results = [];
  
  for (const endpoint of endpoints) {
    console.log(`Testing ${endpoint}...`);
    const result = await checkEndpoint(endpoint);
    results.push(result);
    
    if (result.error) {
      console.log(`❌ ${endpoint}: ${result.status} - ${result.message} (${result.duration})`);
    } else if (result.status >= 200 && result.status < 300) {
      console.log(`✅ ${endpoint}: ${result.status} - ${result.contentType} (${result.duration})`);
    } else {
      console.log(`⚠️  ${endpoint}: ${result.status} - ${result.contentType} (${result.duration})`);
    }
    
    if (result.preview) {
      console.log(`   Response: ${result.preview}`);
    }
    console.log('');
  }
  
  // Summary
  const successful = results.filter(r => !r.error && r.status >= 200 && r.status < 300);
  const failed = results.filter(r => r.error || r.status >= 400);
  
  console.log('📊 Summary');
  console.log('==========');
  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);
  
  if (failed.length > 0) {
    console.log('\n🚨 Failed Endpoints:');
    failed.forEach(f => {
      console.log(`- ${f.endpoint}: ${f.status} ${f.error ? `(${f.message})` : ''}`);
    });
  }
  
  const avgDuration = results
    .filter(r => !r.error)
    .map(r => parseInt(r.duration))
    .reduce((a, b, _, arr) => a + b / arr.length, 0);
  
  if (!isNaN(avgDuration)) {
    console.log(`⏱️  Average Response Time: ${Math.round(avgDuration)}ms`);
  }
  
  process.exit(failed.length > 0 ? 1 : 0);
}

// Run the health check
runHealthCheck().catch(err => {
  console.error('Health check failed:', err);
  process.exit(1);
});