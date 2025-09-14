/**
 * Quick test script to verify all HR analytics APIs are working correctly
 * Run with: node test-analytics-apis.js
 */

const analytics_endpoints = [
  'http://localhost:3001/api/hr/analytics/salary?period=12months&department=all',
  'http://localhost:3001/api/hr/analytics/metrics?period=12months&department=all', 
  'http://localhost:3001/api/hr/analytics/departments?period=12months',
  'http://localhost:3001/api/hr/analytics/performance?period=12months&department=all',
  'http://localhost:3001/api/hr/analytics/turnover?period=12months'
]

async function testAnalyticsAPIs() {
  console.log('🧪 Testing HR Analytics APIs...\n')
  
  for (const endpoint of analytics_endpoints) {
    const apiName = endpoint.split('/').pop().split('?')[0]
    
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log(`✅ ${apiName.toUpperCase()} API: Working correctly (${response.status})`)
        
        // Show sample data structure
        if (Array.isArray(data) && data.length > 0) {
          console.log(`   📊 Sample data: ${Object.keys(data[0]).join(', ')}`)
        } else if (typeof data === 'object' && data) {
          console.log(`   📊 Data keys: ${Object.keys(data).join(', ')}`)
        }
      } else {
        console.log(`❌ ${apiName.toUpperCase()} API: Error ${response.status}`)
        console.log(`   📄 Response: ${await response.text()}`)
      }
    } catch (error) {
      console.log(`❌ ${apiName.toUpperCase()} API: Network/Server Error`)
      console.log(`   💥 Error: ${error.message}`)
    }
    console.log('')
  }
  
  console.log('🏁 Analytics API testing complete!')
}

testAnalyticsAPIs().catch(console.error)
