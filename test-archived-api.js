const https = require('https');
const http = require('http');

async function testArchivedEmployeesAPI() {
  try {
    console.log('Testing archived employees API...');
    
    // Test the archived employees endpoint using native http
    const response = await new Promise((resolve, reject) => {
      const req = http.get('http://localhost:3001/api/hr/employees/archived', (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        });
      });
      req.on('error', reject);
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('\n✅ Archive API working!');
      console.log(`Found ${response.data.data.employees.length} archived employees`);
      
      if (response.data.data.employees.length > 0) {
        console.log('\nArchived employees:');
        response.data.data.employees.forEach(emp => {
          console.log(`- ${emp.name} (${emp.department}) - Archived: ${emp.archiveDate}`);
        });
      }
      
      console.log('\nStats:', response.data.data.stats);
    } else {
      console.log('❌ Error:', response.data.error);
      console.log('Full response:', response.data);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testArchivedEmployeesAPI();
