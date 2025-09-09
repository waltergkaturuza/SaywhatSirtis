const testRoleCreation = async () => {
  console.log('Testing role creation API...')
  
  try {
    // Test GET endpoint
    console.log('1. Testing GET /api/admin/roles-test')
    const getResponse = await fetch('http://localhost:3000/api/admin/roles-test')
    const getRoles = await getResponse.json()
    
    console.log('GET Response:', {
      status: getResponse.status,
      totalRoles: getRoles.roles?.length || 0,
      message: getRoles.message
    })
    
    if (getRoles.roles && getRoles.roles.length > 0) {
      console.log('Sample role:', {
        id: getRoles.roles[0].id,
        name: getRoles.roles[0].displayName,
        level: getRoles.roles[0].level,
        permissions: getRoles.roles[0].permissions?.length || 0
      })
    }
    
    // Test POST endpoint
    console.log('\n2. Testing POST /api/admin/roles-test')
    const newRoleData = {
      name: 'Test Custom Role',
      displayName: 'Test Custom Role',
      description: 'A test role created via API',
      level: 2,
      category: 'user'
    }
    
    const postResponse = await fetch('http://localhost:3000/api/admin/roles-test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newRoleData)
    })
    
    const createResult = await postResponse.json()
    
    console.log('POST Response:', {
      status: postResponse.status,
      roleId: createResult.role?.id,
      roleName: createResult.role?.displayName,
      message: createResult.message
    })
    
    console.log('\n✅ Role API testing completed successfully!')
    
  } catch (error) {
    console.error('❌ Error testing role API:', error)
  }
}

// Run the test
testRoleCreation()
