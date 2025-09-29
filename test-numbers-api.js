// Test script to verify systematic numbering is working
const testSystematicNumbering = async () => {
  try {
    console.log('Testing systematic number generation...')
    
    // Test the next numbers API directly
    const response = await fetch('http://localhost:3000/api/call-centre/next-numbers')
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Next numbers API response:', JSON.stringify(data, null, 2))
      
      // Verify format
      const { nextCallNumber, nextCaseNumber } = data.data
      
      // Check call number format: should be 00002/2025 (since we have 1 existing call)
      console.log('Call number format test:', nextCallNumber)
      if (/^\d{5}\/\d{4}$/.test(nextCallNumber)) {
        console.log('✅ Call number format is correct')
        
        // Extract number part and check if it's sequential
        const numberPart = parseInt(nextCallNumber.split('/')[0])
        console.log('Next call number should be:', numberPart)
        
      } else {
        console.log('❌ Call number format is incorrect')
      }
      
      // Check case number format: should be CASE-2025-00000002
      console.log('Case number format test:', nextCaseNumber)
      if (/^CASE-\d{4}-\d{8}$/.test(nextCaseNumber)) {
        console.log('✅ Case number format is correct')
        
        // Extract number part and check if it's sequential
        const caseNumberPart = parseInt(nextCaseNumber.split('-')[2])
        console.log('Next case number should be:', caseNumberPart)
        
      } else {
        console.log('❌ Case number format is incorrect')
      }
    } else {
      console.log('❌ Failed to fetch next numbers. Status:', response.status)
      console.log('Response:', await response.text())
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run test
testSystematicNumbering()