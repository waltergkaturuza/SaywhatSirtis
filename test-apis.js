// Test script to verify API endpoints
const testAPIs = async () => {
  const baseUrl = 'http://localhost:3000'
  
  console.log('Testing API endpoints...\n')
  
  // Test 1: Departments API
  try {
    console.log('1. Testing departments API...')
    const response = await fetch(`${baseUrl}/api/hr/departments`)
    console.log(`   Status: ${response.status}`)
    if (response.ok) {
      const data = await response.json()
      console.log(`   Success: Found ${data.departments?.length || 0} departments`)
    } else {
      console.log(`   Error: ${response.statusText}`)
    }
  } catch (error) {
    console.log(`   Failed: ${error.message}`)
  }
  
  // Test 2: Activities API  
  try {
    console.log('2. Testing activities API...')
    const response = await fetch(`${baseUrl}/api/hr/performance/activities`)
    console.log(`   Status: ${response.status}`)
    if (response.ok) {
      const data = await response.json()
      console.log(`   Success: Found ${data.activities?.length || 0} activities`)
    } else {
      console.log(`   Error: ${response.statusText}`)
    }
  } catch (error) {
    console.log(`   Failed: ${error.message}`)
  }
  
  // Test 3: Performance Plans API
  try {
    console.log('3. Testing performance plans API...')
    const response = await fetch(`${baseUrl}/api/hr/performance/plans?year=2025`)
    console.log(`   Status: ${response.status}`)
    if (response.ok) {
      const data = await response.json()
      console.log(`   Success: ${data.message || 'API responded successfully'}`)
    } else {
      console.log(`   Error: ${response.statusText}`)
    }
  } catch (error) {
    console.log(`   Failed: ${error.message}`)
  }
}

// Run the tests
testAPIs().catch(console.error)
