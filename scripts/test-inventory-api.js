// Test Inventory API and Add Sample Data
async function testInventoryAPI() {
  const baseUrl = 'https://sirtis-saywhat.onrender.com'
  
  console.log('🧪 Testing Inventory API...')
  
  try {
    // Test the assets endpoint
    console.log('1. Testing GET /api/inventory/assets...')
    const response = await fetch(`${baseUrl}/api/inventory/assets`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log('✅ Assets API Response:', {
      totalAssets: data.assets?.length || 0,
      pagination: data.pagination,
      firstAsset: data.assets?.[0] || 'No assets found'
    })
    
    // If no assets, try to add one via API
    if (!data.assets || data.assets.length === 0) {
      console.log('\n2. No assets found. Testing POST to add sample asset...')
      
      const sampleAsset = {
        name: 'Test Laptop',
        assetNumber: 'TST-001',
        category: 'COMPUTER',
        model: 'Test Model',
        procurementValue: 1000,
        currentValue: 800,
        allocation: 'IT Department',
        location: 'Office',
        condition: 'GOOD',
        status: 'ACTIVE',
        procurementDate: '2023-01-01'
      }
      
      const createResponse = await fetch(`${baseUrl}/api/inventory/assets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sampleAsset)
      })
      
      if (createResponse.ok) {
        const createdAsset = await createResponse.json()
        console.log('✅ Sample asset created:', createdAsset)
      } else {
        const errorText = await createResponse.text()
        console.log('⚠️ Could not create asset:', createResponse.status, errorText)
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing inventory API:', error)
  }
}

// Run the test
testInventoryAPI()
