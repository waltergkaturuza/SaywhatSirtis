// Test script to show the distinction between system users and employees
const testUserTypes = async () => {
  try {
    console.log('🔍 Testing User vs Employee distinction...\n')
    
    const response = await fetch('http://localhost:3000/api/admin/users')
    const data = await response.json()
    
    if (!data.success) {
      console.error('❌ API call failed:', data)
      return
    }
    
    const users = data.data.users
    console.log(`📊 Total users: ${users.length}\n`)
    
    // Categorize users
    const systemOnlyUsers = users.filter(u => u.isSystemUser && !u.isEmployee)
    const employeeUsers = users.filter(u => u.isSystemUser && u.isEmployee) 
    const activeEmployees = employeeUsers.filter(u => u.employeeStatus === 'ACTIVE')
    const inactiveEmployees = employeeUsers.filter(u => u.employeeStatus !== 'ACTIVE')
    
    console.log('📋 User Categories:')
    console.log(`   System-only users (no employee record): ${systemOnlyUsers.length}`)
    console.log(`   Employee users (have system + employee): ${employeeUsers.length}`)
    console.log(`   └─ Active employees: ${activeEmployees.length}`)
    console.log(`   └─ Inactive/Archived employees: ${inactiveEmployees.length}\n`)
    
    console.log('👥 System-only users:')
    systemOnlyUsers.forEach(user => {
      console.log(`   - ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role}`)
    })
    
    console.log('\n🏢 Employee users:')
    employeeUsers.forEach(user => {
      console.log(`   - ${user.firstName} ${user.lastName} (${user.email}) - ${user.employeeId} - ${user.employeeStatus}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

// Run in Node.js context (import fetch for older Node versions)
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

testUserTypes()