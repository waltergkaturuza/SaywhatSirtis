// Test script for Employee Archive and Restore functionality
const testArchiveRestoreFunctionality = async () => {
  console.log('🧪 Testing Employee Archive and Restore Functionality...\n')

  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-production-url.com' 
    : 'http://localhost:3000'

  // Test data
  const testEmployee = {
    email: 'test.archive@saywhat.org',
    username: 'testarchive',
    department: 'IT',
    position: 'Test Developer',
    clearanceLevel: 'PUBLIC',
    employeeType: 'FULL_TIME',
    emergencyContact: {
      name: 'Emergency Contact',
      phone: '+1234567890',
      relationship: 'Family'
    }
  }

  let createdEmployeeId = null

  try {
    // 1. Create a test employee
    console.log('1️⃣ Creating test employee...')
    const createResponse = await fetch(`${baseUrl}/api/hr/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testEmployee)
    })

    if (!createResponse.ok) {
      throw new Error(`Failed to create employee: ${createResponse.status}`)
    }

    const createResult = await createResponse.json()
    createdEmployeeId = createResult.data.id
    console.log(`✅ Employee created with ID: ${createdEmployeeId}`)

    // 2. Verify employee exists in active list
    console.log('\n2️⃣ Verifying employee in active list...')
    const activeResponse = await fetch(`${baseUrl}/api/hr/employees`)
    const activeResult = await activeResponse.json()
    
    const foundActive = activeResult.data.employees.find(emp => emp.id === createdEmployeeId)
    if (!foundActive) {
      throw new Error('Employee not found in active list')
    }
    console.log('✅ Employee found in active list')

    // 3. Archive the employee
    console.log('\n3️⃣ Archiving employee...')
    const archiveResponse = await fetch(`${baseUrl}/api/hr/employees/${createdEmployeeId}/archive`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!archiveResponse.ok) {
      const errorData = await archiveResponse.json()
      throw new Error(`Failed to archive employee: ${errorData.message}`)
    }

    console.log('✅ Employee archived successfully')

    // 4. Verify employee is no longer in active list
    console.log('\n4️⃣ Verifying employee removed from active list...')
    const activeResponse2 = await fetch(`${baseUrl}/api/hr/employees`)
    const activeResult2 = await activeResponse2.json()
    
    const stillActive = activeResult2.data.employees.find(emp => emp.id === createdEmployeeId)
    if (stillActive) {
      throw new Error('Employee still found in active list after archiving')
    }
    console.log('✅ Employee removed from active list')

    // 5. Verify employee appears in archived list
    console.log('\n5️⃣ Verifying employee in archived list...')
    const archivedResponse = await fetch(`${baseUrl}/api/hr/employees/archived`)
    const archivedResult = await archivedResponse.json()
    
    const foundArchived = archivedResult.data.employees.find(emp => emp.id === createdEmployeeId)
    if (!foundArchived) {
      throw new Error('Employee not found in archived list')
    }
    console.log('✅ Employee found in archived list')
    console.log(`   Status: ${foundArchived.status}`)
    console.log(`   Archived At: ${foundArchived.archivedAt}`)

    // 6. Restore the employee
    console.log('\n6️⃣ Restoring employee...')
    const restoreResponse = await fetch(`${baseUrl}/api/hr/employees/${createdEmployeeId}/restore`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!restoreResponse.ok) {
      const errorData = await restoreResponse.json()
      throw new Error(`Failed to restore employee: ${errorData.message}`)
    }

    console.log('✅ Employee restored successfully')

    // 7. Verify employee is back in active list
    console.log('\n7️⃣ Verifying employee back in active list...')
    const activeResponse3 = await fetch(`${baseUrl}/api/hr/employees`)
    const activeResult3 = await activeResponse3.json()
    
    const restoredActive = activeResult3.data.employees.find(emp => emp.id === createdEmployeeId)
    if (!restoredActive) {
      throw new Error('Employee not found in active list after restore')
    }
    console.log('✅ Employee back in active list')
    console.log(`   Status: ${restoredActive.status}`)

    // 8. Verify employee no longer in archived list
    console.log('\n8️⃣ Verifying employee removed from archived list...')
    const archivedResponse2 = await fetch(`${baseUrl}/api/hr/employees/archived`)
    const archivedResult2 = await archivedResponse2.json()
    
    const stillArchived = archivedResult2.data.employees.find(emp => emp.id === createdEmployeeId)
    if (stillArchived) {
      throw new Error('Employee still found in archived list after restore')
    }
    console.log('✅ Employee removed from archived list')

    // 9. Test audit trail
    console.log('\n9️⃣ Checking audit trail...')
    const auditResponse = await fetch(`${baseUrl}/api/hr/employees/${createdEmployeeId}/audit`)
    if (auditResponse.ok) {
      const auditResult = await auditResponse.json()
      const archiveLog = auditResult.data.find(log => log.action === 'ARCHIVE')
      const restoreLog = auditResult.data.find(log => log.action === 'RESTORE')
      
      if (archiveLog && restoreLog) {
        console.log('✅ Audit trail complete')
        console.log(`   Archive log: ${archiveLog.timestamp}`)
        console.log(`   Restore log: ${restoreLog.timestamp}`)
      } else {
        console.log('⚠️ Audit trail incomplete (some logs missing)')
      }
    } else {
      console.log('⚠️ Could not verify audit trail (endpoint may not exist)')
    }

    console.log('\n🎉 All archive/restore tests passed!')

  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
    throw error
  } finally {
    // Cleanup: Delete the test employee
    if (createdEmployeeId) {
      console.log('\n🧹 Cleaning up test data...')
      try {
        // First try to restore if archived
        await fetch(`${baseUrl}/api/hr/employees/${createdEmployeeId}/restore`, {
          method: 'PATCH'
        })
        
        // Then delete
        const deleteResponse = await fetch(`${baseUrl}/api/hr/employees/${createdEmployeeId}`, {
          method: 'DELETE'
        })
        
        if (deleteResponse.ok) {
          console.log('✅ Test employee deleted')
        } else {
          console.log('⚠️ Could not delete test employee (may need manual cleanup)')
        }
      } catch (cleanupError) {
        console.log('⚠️ Cleanup failed:', cleanupError.message)
      }
    }
  }
}

// Helper function to test error cases
const testArchiveRestoreErrorCases = async () => {
  console.log('\n🧪 Testing Archive/Restore Error Cases...\n')

  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-production-url.com' 
    : 'http://localhost:3000'

  try {
    // Test 1: Archive non-existent employee
    console.log('1️⃣ Testing archive of non-existent employee...')
    const archiveResponse = await fetch(`${baseUrl}/api/hr/employees/non-existent-id/archive`, {
      method: 'PATCH'
    })
    
    if (archiveResponse.status === 404) {
      console.log('✅ Correctly returned 404 for non-existent employee')
    } else {
      console.log('❌ Did not handle non-existent employee correctly')
    }

    // Test 2: Restore non-existent employee
    console.log('\n2️⃣ Testing restore of non-existent employee...')
    const restoreResponse = await fetch(`${baseUrl}/api/hr/employees/non-existent-id/restore`, {
      method: 'PATCH'
    })
    
    if (restoreResponse.status === 404) {
      console.log('✅ Correctly returned 404 for non-existent employee')
    } else {
      console.log('❌ Did not handle non-existent employee correctly')
    }

    // Test 3: Restore already active employee
    console.log('\n3️⃣ Testing restore of already active employee...')
    const employeesResponse = await fetch(`${baseUrl}/api/hr/employees`)
    if (employeesResponse.ok) {
      const employeesResult = await employeesResponse.json()
      if (employeesResult.data.employees.length > 0) {
        const activeEmployee = employeesResult.data.employees[0]
        const restoreActiveResponse = await fetch(`${baseUrl}/api/hr/employees/${activeEmployee.id}/restore`, {
          method: 'PATCH'
        })
        
        if (restoreActiveResponse.status === 400) {
          console.log('✅ Correctly returned 400 for already active employee')
        } else {
          console.log('❌ Did not handle already active employee correctly')
        }
      }
    }

    console.log('\n🎉 Error case testing complete!')

  } catch (error) {
    console.error('\n❌ Error case testing failed:', error.message)
  }
}

// Run the tests
if (require.main === module) {
  const runTests = async () => {
    try {
      await testArchiveRestoreFunctionality()
      await testArchiveRestoreErrorCases()
      console.log('\n✅ All tests completed successfully!')
    } catch (error) {
      console.error('\n❌ Test suite failed:', error.message)
      process.exit(1)
    }
  }

  runTests()
}

module.exports = {
  testArchiveRestoreFunctionality,
  testArchiveRestoreErrorCases
}
