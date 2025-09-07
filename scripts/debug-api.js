// Quick API Test for Debugging
async function testInventoryAPI() {
  try {
    console.log('Testing inventory API endpoints...')
    
    // Test with a simple fetch to see the actual error
    const response = await fetch('https://sirtis-saywhat.onrender.com/api/inventory/assets', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    })
    
    console.log('Response status:', response.status)
    console.log('Response headers:', [...response.headers.entries()])
    
    const text = await response.text()
    console.log('Response body:', text)
    
    if (response.headers.get('content-type')?.includes('application/json')) {
      try {
        const json = JSON.parse(text)
        console.log('Parsed JSON:', json)
      } catch (e) {
        console.log('Failed to parse as JSON')
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testInventoryAPI()
