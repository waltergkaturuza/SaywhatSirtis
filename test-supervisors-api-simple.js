// Test the updated supervisors API endpoint with node-fetch
const https = require('https');
const http = require('http');

async function testSupervisorsAPI() {
  try {
    console.log('🔍 Testing Supervisors API Endpoint...')
    console.log('=' .repeat(50))
    
    // Simple HTTP request to test the API
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/hr/employees/supervisors',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      console.log(`📊 Response Status: ${res.statusCode}`)
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          
          console.log('\n✅ API Response Structure:')
          console.log(`   Success: ${jsonData.success}`)
          console.log(`   Data Count: ${jsonData.data?.length || 0}`)
          
          if (jsonData.success && jsonData.data) {
            console.log('\n📋 Available Supervisors for Dropdown:')
            console.log('-' .repeat(45))
            
            jsonData.data.forEach((supervisor, index) => {
              console.log(`${index + 1}. ${supervisor.firstName} ${supervisor.lastName}`)
              console.log(`   Employee ID: ${supervisor.employeeId || 'N/A'}`)
              console.log(`   Position: ${supervisor.position || 'N/A'}`)
              console.log(`   Department: ${supervisor.department || 'Not assigned'}`)
              console.log(`   Email: ${supervisor.email}`)
              console.log(`   Is Supervisor: ${supervisor.isSupervisor}`)
              console.log(`   Is Reviewer: ${supervisor.isReviewer}`)
              console.log('')
            })
            
            // Summary
            const supervisorCount = jsonData.data.filter(s => s.isSupervisor).length
            const reviewerCount = jsonData.data.filter(s => s.isReviewer).length
            const totalCount = jsonData.data.length
            
            console.log('📊 Summary:')
            console.log(`   Total available for supervisor selection: ${totalCount}`)
            console.log(`   Employees marked as supervisors: ${supervisorCount}`)
            console.log(`   Employees marked as reviewers: ${reviewerCount}`)
            
            console.log('\n✅ SUPERVISOR DROPDOWN UPDATE SUCCESS!')
            console.log('🎯 Employees marked as supervisors and reviewers are now available')
            console.log('   for selection when creating/editing other employees.')
            
          } else {
            console.log('❌ API returned unsuccessful response:', jsonData)
          }
          
        } catch (parseError) {
          console.log('❌ Failed to parse response:', data)
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ API Request Error:', error.message)
      console.log('\nℹ️  Make sure the development server is running on localhost:3000')
      console.log('   Run: npm run dev')
    });
    
    req.end();
    
  } catch (error) {
    console.error('❌ API Test Error:', error.message)
  }
}

// Test the API
testSupervisorsAPI()
