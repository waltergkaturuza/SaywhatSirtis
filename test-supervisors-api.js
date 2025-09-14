// Test the updated supervisors API endpoint
const fetch = require('node-fetch');

async function testSupervisorsAPI() {
  try {
    console.log('🔍 Testing Supervisors API Endpoint...')
    console.log('=' .repeat(50))
    
    // Test the supervisors endpoint
    const response = await fetch('http://localhost:3000/api/hr/employees/supervisors')
    
    console.log(`📊 Response Status: ${response.status}`)
    console.log(`📊 Response OK: ${response.ok}`)
    
    if (response.ok) {
      const data = await response.json()
      
      console.log('\n✅ API Response Structure:')
      console.log(`   Success: ${data.success}`)
      console.log(`   Data Count: ${data.data?.length || 0}`)
      
      if (data.success && data.data) {
        console.log('\n📋 Available Supervisors for Dropdown:')
        console.log('-' .repeat(45))
        
        data.data.forEach((supervisor, index) => {
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
        const supervisorCount = data.data.filter(s => s.isSupervisor).length
        const reviewerCount = data.data.filter(s => s.isReviewer).length
        const totalCount = data.data.length
        
        console.log('📊 Summary:')
        console.log(`   Total available for supervisor selection: ${totalCount}`)
        console.log(`   Employees marked as supervisors: ${supervisorCount}`)
        console.log(`   Employees marked as reviewers: ${reviewerCount}`)
        
        console.log('\n✅ SUPERVISOR DROPDOWN UPDATE SUCCESS!')
        console.log('🎯 Employees marked as supervisors and reviewers are now available')
        console.log('   for selection when creating/editing other employees.')
        
      } else {
        console.log('❌ API returned unsuccessful response:', data)
      }
      
    } else {
      const errorData = await response.text()
      console.log('❌ API Error Response:', errorData)
    }
    
  } catch (error) {
    console.error('❌ API Test Error:', error.message)
    console.log('\nℹ️  Make sure the development server is running on localhost:3000')
    console.log('   Run: npm run dev')
  }
}

// Give the server a moment to start up
setTimeout(testSupervisorsAPI, 3000)
