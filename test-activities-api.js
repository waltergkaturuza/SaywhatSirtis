// Test script for performance activities API
const fetch = require('node-fetch');

async function testActivitiesAPI() {
  try {
    const response = await fetch('http://localhost:3001/api/hr/performance/activities', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.log('Response status:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('Error response:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('Activities API Response:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error testing activities API:', error);
  }
}

testActivitiesAPI();
