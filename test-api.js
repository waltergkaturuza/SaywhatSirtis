const fetch = require('node-fetch');

async function testCallCentreAPI() {
  try {
    console.log('Testing Call Centre Summary API...');
    
    const response = await fetch('http://localhost:3000/api/call-centre/summary', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testCallCentreAPI();