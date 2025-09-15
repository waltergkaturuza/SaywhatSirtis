// Test the user-employee ID confusion fix
const fetch = require('node-fetch')

async function testEmployeeIdFix() {
  console.log('🧪 TESTING USER-EMPLOYEE ID FIX')
  console.log('=' .repeat(50))
  
  const baseUrl = 'http://localhost:3000'
  
  // Admin credentials for testing
  const adminUserId = 'cmfft5t770000vc8o37ras3qa'      // User ID from Users table
  const adminEmployeeId = 'emp-1757860675891-0'          // Employee ID from Employees table
  
  try {
    console.log('\n📊 Test 1: Fetch Employee using User ID (should now work)')
    console.log(`Trying with User ID: ${adminUserId}`)
    
    const userIdResponse = await fetch(`${baseUrl}/api/hr/employees/${adminUserId}`)
    const userIdData = await userIdResponse.json()
    
    if (userIdResponse.ok) {
      console.log('✅ SUCCESS: Employee API now accepts User ID!')
      console.log(`   Found: ${userIdData.data.firstName} ${userIdData.data.lastName}`)
      console.log(`   Employee ID: ${userIdData.data.id}`)
      console.log(`   Employee Number: ${userIdData.data.employeeId}`)
    } else {
      console.log('❌ FAILED: Still getting error with User ID')
      console.log(`   Error: ${userIdData.error}`)
      console.log(`   Message: ${userIdData.message}`)
    }
    
    console.log('\n📊 Test 2: Fetch Employee using Employee ID (should still work)')
    console.log(`Trying with Employee ID: ${adminEmployeeId}`)
    
    const employeeIdResponse = await fetch(`${baseUrl}/api/hr/employees/${adminEmployeeId}`)
    const employeeIdData = await employeeIdResponse.json()
    
    if (employeeIdResponse.ok) {
      console.log('✅ SUCCESS: Employee API still works with Employee ID!')
      console.log(`   Found: ${employeeIdData.data.firstName} ${employeeIdData.data.lastName}`)
    } else {
      console.log('❌ FAILED: Error with Employee ID')
      console.log(`   Error: ${employeeIdData.error}`)
    }
    
    console.log('\n📊 Test 3: Update Employee using User ID (the original problem)')
    console.log(`Trying to update with User ID: ${adminUserId}`)
    
    const updateData = {
      firstName: 'System',
      lastName: 'Administrator',
      position: 'System Administrator',
      department: 'HR'
    }
    
    const updateResponse = await fetch(`${baseUrl}/api/hr/employees/${adminUserId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    })
    
    const updateResult = await updateResponse.json()
    
    if (updateResponse.ok) {
      console.log('✅ SUCCESS: Employee update now works with User ID!')
      console.log('   The 404 error should be fixed!')
    } else {
      console.log('❌ FAILED: Still getting error on update')
      console.log(`   Status: ${updateResponse.status}`)
      console.log(`   Error: ${updateResult.error}`)
      console.log(`   Message: ${updateResult.message}`)
      
      if (updateResult.currentEmployees) {
        console.log('\n📋 Available Employees:')
        updateResult.currentEmployees.forEach(emp => {
          console.log(`   - ${emp.firstName} ${emp.lastName} (${emp.email})`)
          console.log(`     Employee ID: ${emp.id}`)
          console.log(`     User ID: ${emp.userId}`)
        })
      }
    }
    
    console.log('\n🎯 SUMMARY:')
    if (userIdResponse.ok && employeeIdResponse.ok) {
      console.log('✅ FIX SUCCESSFUL!')
      console.log('   - API now accepts both User IDs and Employee IDs')
      console.log('   - Frontend can continue using User IDs') 
      console.log('   - 404 errors should be resolved')
    } else {
      console.log('❌ Fix needs more work')
      console.log('   - Check server logs for details')
      console.log('   - May need authentication headers')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.log('\n💡 This might be because:')
    console.log('- Server is not running (npm run dev)')
    console.log('- Authentication required')
    console.log('- Database connection issues')
  }
}

// Wait a moment for server to start, then run test
setTimeout(testEmployeeIdFix, 5000)
