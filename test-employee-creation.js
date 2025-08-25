// Test Employee Creation and List API
const fetch = require('node-fetch');

async function testEmployeeAPI() {
  const baseUrl = 'http://localhost:3002';
  
  console.log('Testing Employee API...\n');
  
  try {
    // Test 1: Fetch employees list
    console.log('1. Testing GET /api/hr/employees');
    const getResponse = await fetch(`${baseUrl}/api/hr/employees`);
    console.log(`Status: ${getResponse.status}`);
    
    if (getResponse.ok) {
      const data = await getResponse.json();
      console.log('Response structure:', Object.keys(data));
      console.log('Employee count:', data.data ? data.data.length : 'No data field');
      console.log('Full response:', JSON.stringify(data, null, 2));
    } else {
      console.log('Error response:', await getResponse.text());
    }
    
    console.log('\n---\n');
    
    // Test 2: Create employee (will fail without auth, but shows structure)
    console.log('2. Testing POST /api/hr/employees (without auth)');
    const testEmployee = {
      formData: {
        email: 'test@example.com',
        department: 'Engineering',
        position: 'Developer',
        firstName: 'Test',
        lastName: 'User'
      }
    };
    
    const postResponse = await fetch(`${baseUrl}/api/hr/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testEmployee)
    });
    
    console.log(`Status: ${postResponse.status}`);
    const postData = await postResponse.json();
    console.log('Response:', JSON.stringify(postData, null, 2));
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testEmployeeAPI();
