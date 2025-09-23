// Test script to verify dropdown data fetching
async function testDropdownData() {
  console.log('Testing dropdown data fetching...')
  
  try {
    // Test departments API
    console.log('\n🔍 Testing departments API...')
    const deptResponse = await fetch('http://localhost:3000/api/hr/departments/hierarchy', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    console.log(`Departments API Status: ${deptResponse.status}`)
    if (deptResponse.ok) {
      const deptData = await deptResponse.json()
      console.log('✅ Departments API Response:', JSON.stringify(deptData, null, 2))
    } else {
      console.log('❌ Departments API failed:', await deptResponse.text())
    }
    
    // Test employees API
    console.log('\n🔍 Testing employees API...')
    const empResponse = await fetch('http://localhost:3000/api/hr/employees', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    console.log(`Employees API Status: ${empResponse.status}`)
    if (empResponse.ok) {
      const empData = await empResponse.json()
      console.log('✅ Employees API Response:', JSON.stringify(empData, null, 2))
    } else {
      console.log('❌ Employees API failed:', await empResponse.text())
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testDropdownData()