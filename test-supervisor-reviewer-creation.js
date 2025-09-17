// Test script to verify supervisor/reviewer functionality
console.log('🧪 Testing Employee Creation with Supervisor/Reviewer Roles')

const testData = {
  formData: {
    firstName: "Test",
    lastName: "Supervisor",
    email: "test.supervisor@saywhat.org",
    position: "Test Manager", 
    departmentId: null,
    department: "Test Department",
    isSupervisor: true,
    isReviewer: true,
    startDate: new Date().toISOString().split('T')[0],
    baseSalary: "50000",
    phoneNumber: "+263772123456"
  }
}

async function testEmployeeCreation() {
  try {
    console.log('📝 Creating test employee with supervisor/reviewer roles...')
    
    const response = await fetch('http://localhost:3000/api/hr/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'next-auth.session-token=test' // This won't work without proper auth
      },
      body: JSON.stringify(testData)
    })
    
    const result = await response.json()
    console.log('📊 API Response:', result)
    
    if (response.ok) {
      console.log('✅ Employee created successfully!')
      
      // Test if they appear in supervisors list
      console.log('🔍 Checking supervisors list...')
      const supervisorsResponse = await fetch('http://localhost:3000/api/hr/supervisors')
      const supervisors = await supervisorsResponse.json()
      console.log('👨‍💼 Supervisors:', supervisors)
      
      // Test if they appear in reviewers list
      console.log('🔍 Checking reviewers list...')
      const reviewersResponse = await fetch('http://localhost:3000/api/hr/reviewers')
      const reviewers = await reviewersResponse.json()
      console.log('👩‍💼 Reviewers:', reviewers)
      
    } else {
      console.log('❌ Employee creation failed:', result)
    }
    
  } catch (error) {
    console.error('🚨 Test error:', error)
  }
}

// Note: This test requires authentication and won't work directly
// It's meant to show the testing approach
console.log('⚠️  This test requires proper authentication to work')
console.log('📋 Use this as a reference for manual testing in the browser')