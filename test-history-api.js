const fetch = require('node-fetch');

async function testCaseHistoryAPI() {
  try {
    const caseId = '08c8908b-df2c-400a-bb51-934ed08bc0cd';
    console.log('Testing case history API for case:', caseId);
    console.log('URL:', `http://localhost:3000/api/call-centre/cases/${caseId}/history`);
    
    const response = await fetch(`http://localhost:3000/api/call-centre/cases/${caseId}/history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Note: In real scenario, this would need proper auth headers
      }
    });
    
    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers));
    
    const data = await response.text();
    console.log('Response Body:', data);
    
    if (response.ok) {
      try {
        const jsonData = JSON.parse(data);
        console.log('\nParsed JSON:');
        console.log('Success:', jsonData.success);
        console.log('History entries:', jsonData.history?.length || 0);
        
        if (jsonData.history && jsonData.history.length > 0) {
          console.log('\nFirst history entry:');
          console.log(JSON.stringify(jsonData.history[0], null, 2));
        }
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError.message);
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testCaseHistoryAPI();