const https = require('https');
const http = require('http');

async function testAssetsAPI() {
  try {
    console.log('Testing /api/inventory/assets endpoint...');
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/inventory/assets',
      method: 'GET',
    };

    const req = http.request(options, (res) => {
      console.log('Status:', res.statusCode);
      console.log('Status Text:', res.statusMessage);
      
      if (res.statusCode === 401) {
        console.log('✅ Correct: API returns 401 Unauthorized (as expected for unauthenticated requests)');
        return;
      }
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log('Response:', JSON.stringify(parsed, null, 2));
          
          if (res.statusCode === 200) {
            console.log('✅ API is working properly!');
          } else {
            console.log('❌ API returned error:', parsed);
          }
        } catch (e) {
          console.log('Raw response:', data);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ API test failed:', error.message);
    });

    req.end();
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testAssetsAPI();
