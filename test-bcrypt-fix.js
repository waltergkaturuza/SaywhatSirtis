// Test script to verify bcrypt functionality is working
const testUserCreation = async () => {
  try {
    console.log('Testing user creation API...')
    
    const testUserData = {
      action: 'create_user',
      firstName: 'Test',
      lastName: 'User',
      email: `test.user.${Date.now()}@saywhat.org`,
      department: 'IT',
      position: 'Developer',
      password: 'TestPassword123',
      role: 'BASIC_USER_1'
    }

    const response = await fetch('http://localhost:3000/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUserData)
    })

    const result = await response.json()
    
    console.log('Response Status:', response.status)
    console.log('Response Body:', JSON.stringify(result, null, 2))
    
    if (response.ok) {
      console.log('✅ SUCCESS: User creation works with bcryptjs!')
    } else {
      console.log('❌ ERROR: User creation failed')
    }
    
  } catch (error) {
    console.error('❌ FETCH ERROR:', error.message)
  }
}

testUserCreation()
