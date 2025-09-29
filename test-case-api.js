// Test case API endpoint to see what data is returned
const fetch = require('node-fetch');

async function testCaseAPI() {
  console.log('Testing Case API endpoint...\n');
  
  // Get the case ID from our database check
  const caseId = '08c8908b-df2c-400a-bb51-934ed08bc0cd';
  
  try {
    console.log(`Testing GET /api/call-centre/cases/${caseId}`);
    
    const response = await fetch(`http://localhost:3000/api/call-centre/cases/${caseId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add a cookie or auth token if needed - for now we'll test the endpoint structure
      }
    });
    
    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers));
    
    const data = await response.text();
    console.log('Response Body:', data);
    
    if (response.ok) {
      const jsonData = JSON.parse(data);
      if (jsonData.case) {
        console.log('\nCase Data Structure:');
        console.log('ID:', jsonData.case.id);
        console.log('Case Number:', jsonData.case.caseNumber);
        console.log('Call Number:', jsonData.case.callNumber);
        console.log('Client Name:', jsonData.case.clientName);
        console.log('Status:', jsonData.case.status);
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testCaseAPI().catch(console.error);