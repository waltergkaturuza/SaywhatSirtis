// Test script to simulate project creation API call
const fetch = require('node-fetch').default || require('node-fetch');

async function testProjectCreation() {
  try {
    console.log('Testing project creation API...');
    
    const projectData = {
      name: 'Test Project',
      description: 'Test Description',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      country: 'Test Country',
      province: 'Test Province',
      budget: '10000',
      objectives: ['Test Objective 1', 'Test Objective 2']
    };

    const response = await fetch('http://localhost:3000/api/programs/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData)
    });

    const result = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', result);
    
    if (!response.ok) {
      console.error('❌ API Error:', result);
    } else {
      console.log('✅ API Success:', result);
    }
    
  } catch (error) {
    console.error('❌ Test Error:', error);
  }
}

testProjectCreation();
