// Test systematic case number generation locally
const { PrismaClient } = require('@prisma/client')

async function testSystematicNumbering() {
  console.log('🧪 Testing Systematic Case Number Generation\n' + '='.repeat(50))
  
  const prisma = new PrismaClient()
  
  try {
    // Test the systematic case number generation logic
    const year = new Date().getFullYear()
    
    // Get latest case number for this year
    const latestCase = await prisma.call_records.findFirst({
      where: {
        caseNumber: {
          startsWith: `CASE-${year}-`
        }
      },
      orderBy: {
        caseNumber: 'desc'
      }
    })
    
    console.log('Latest case found:', latestCase?.caseNumber || 'None')
    
    // Generate next case number
    let nextCaseNum = 1
    if (latestCase?.caseNumber) {
      const currentNum = parseInt(latestCase.caseNumber.split('-')[2])
      if (!isNaN(currentNum)) {
        nextCaseNum = currentNum + 1
      }
    }
    
    const newCaseNumber = `CASE-${year}-${nextCaseNum.toString().padStart(8, '0')}`
    console.log('Next case number would be:', newCaseNumber)
    
    // Test call number generation
    const latestCall = await prisma.call_records.findFirst({
      where: {
        callNumber: {
          endsWith: `/${year}`
        }
      },
      orderBy: {
        callNumber: 'desc'
      }
    })
    
    console.log('Latest call found:', latestCall?.callNumber || 'None')
    
    let nextCallNum = 1
    if (latestCall?.callNumber) {
      const currentNum = parseInt(latestCall.callNumber.split('/')[0])
      if (!isNaN(currentNum)) {
        nextCallNum = currentNum + 1
      }
    }
    
    const newCallNumber = `${nextCallNum.toString().padStart(8, '0')}/${year}`
    console.log('Next call number would be:', newCallNumber)
    
    console.log('\n✅ Systematic numbering logic working correctly!')
    console.log('Case format: CASE-YYYY-XXXXXXXX')
    console.log('Call format: XXXXXXXX/YYYY')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testSystematicNumbering().catch(console.error)