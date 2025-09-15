// Test the updated admin users API with HR-aligned roles
const testAdminUsersAPI = async () => {
  try {
    console.log('Testing Admin Users API with HR-aligned roles...\n')

    const response = await fetch('http://localhost:3001/api/admin/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('Response status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('Success! API Response:')
      console.log('- Total users:', data.total)
      console.log('- Users returned:', data.users?.length || 0)
      
      if (data.users && data.users.length > 0) {
        console.log('\nUser Details:')
        data.users.forEach((user, index) => {
          console.log(`\n${index + 1}. ${user.firstName} ${user.lastName}`)
          console.log(`   Email: ${user.email}`)
          console.log(`   Role: ${user.role}`)
          console.log(`   Display Name: ${user.roles?.[0]?.role?.displayName || 'N/A'}`)
          console.log(`   Department: ${user.department}`)
          console.log(`   Status: ${user.status}`)
          console.log(`   Last Login: ${user.lastLogin || 'Never'}`)
          console.log(`   Permissions (${user.permissions?.length || 0}):`, user.permissions?.slice(0, 5) || [])
          if (user.permissions?.length > 5) {
            console.log(`   ... and ${user.permissions.length - 5} more`)
          }
        })
      }
    } else {
      const errorData = await response.json()
      console.log('Error response:', errorData)
    }
  } catch (error) {
    console.error('Test failed:', error.message)
  }
}

// Run the test
testAdminUsersAPI()
