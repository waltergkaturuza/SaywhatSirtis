async function testCasesAPI() {
  try {
    const response = await fetch('http://localhost:3000/api/call-centre/cases', {
      headers: {
        'Cookie': 'next-auth.session-token=your-session-token' // This might not work without real session
      }
    });
    
    const data = await response.json();
    
    if (data.cases) {
      console.log('=== API RESPONSE ANALYSIS ===');
      console.log(`Total cases returned: ${data.cases.length}`);
      
      const statusCounts = {};
      data.cases.forEach(c => {
        const status = c.status;
        statusCounts[status] = (statusCounts[status] || 0) + 1;
        console.log(`Case ${c.caseNumber}: Status="${c.status}", Officer="${c.officer}"`);
      });
      
      console.log('\n=== STATUS BREAKDOWN ===');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`${status}: ${count} cases`);
      });
    } else {
      console.log('Error or no cases:', data);
    }
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

// For Node.js environment
if (typeof fetch === 'undefined') {
  const { default: fetch } = require('node-fetch');
  global.fetch = fetch;
}

testCasesAPI();