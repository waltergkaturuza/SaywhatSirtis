// Temporary test - check if API endpoints work without auth
const fetch = require('node-fetch');

async function testEndpoints() {
    console.log('Testing API endpoints on port 3001...');
    
    // Test if we can reach the auth session endpoint
    try {
        const sessionResponse = await fetch('http://localhost:3001/api/auth/session');
        console.log('\n=== Session Endpoint ===');
        console.log('Status:', sessionResponse.status);
        const sessionData = await sessionResponse.text();
        console.log('Response:', sessionData);
    } catch (error) {
        console.error('Session endpoint error:', error.message);
    }
}

testEndpoints();