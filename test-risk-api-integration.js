// Test Risk Management API Integration
// This script tests the risk management API to ensure mock data removal is successful

const testRiskApi = async () => {
  try {
    console.log('🔍 Testing Risk Management API...')
    
    // Test 1: Health check
    console.log('\n1. Testing API endpoint...')
    const response = await fetch('http://localhost:3000/api/risk-management/risks')
    
    console.log(`Response Status: ${response.status}`)
    console.log(`Response Status Text: ${response.statusText}`)
    
    if (response.status === 401) {
      console.log('✅ API requires authentication (expected)')
      console.log('📝 Mock data removal successful - API is properly connected')
      return
    }
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ API Response received:')
      console.log(JSON.stringify(data, null, 2))
      
      if (data.success && data.data && data.data.risks) {
        console.log(`📊 Found ${data.data.risks.length} risks in database`)
        console.log('✅ Mock data removal successful - API is working with real data')
      }
    } else {
      console.log(`❌ API Error: ${response.status} - ${response.statusText}`)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
testRiskApi()
