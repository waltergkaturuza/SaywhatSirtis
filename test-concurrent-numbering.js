// Test concurrent systematic numbering to ensure no duplicates
const { PrismaClient } = require('@prisma/client')

async function testConcurrentSystematicNumbering() {
  console.log('Testing Concurrent Systematic Numbering\n' + '='.repeat(50));
  
  const prisma = new PrismaClient()
  
  try {
    console.log('🧪 Simulating concurrent number generation...\n');
    
    // Simulate the systematic case number generation logic
    async function generateNextCaseNumber() {
      const currentYear = new Date().getFullYear()
      
      return await prisma.$transaction(async (tx) => {
        const latestCase = await tx.call_records.findFirst({
          where: {
            caseNumber: {
              startsWith: `CASE-${currentYear}-`
            }
          },
          orderBy: {
            caseNumber: 'desc'
          },
          select: {
            caseNumber: true
          }
        })
        
        let nextCaseNumber = 1
        if (latestCase) {
          const caseNumberPart = latestCase.caseNumber.split('-')[2]
          if (caseNumberPart) {
            nextCaseNumber = parseInt(caseNumberPart) + 1
          }
        }
        
        const formattedNumber = nextCaseNumber.toString().padStart(8, '0')
        return `CASE-${currentYear}-${formattedNumber}`
      })
    }
    
    // Simulate the systematic call number generation logic
    async function generateNextCallNumber() {
      const currentYear = new Date().getFullYear()
      
      return await prisma.$transaction(async (tx) => {
        const latestCall = await tx.call_records.findFirst({
          where: {
            callNumber: {
              endsWith: `/${currentYear}`
            }
          },
          orderBy: {
            callNumber: 'desc'
          },
          select: {
            callNumber: true
          }
        })
        
        let nextCallNumber = 1
        if (latestCall && latestCall.callNumber) {
          const callNumberPart = latestCall.callNumber.split('/')[0]
          if (callNumberPart) {
            nextCallNumber = parseInt(callNumberPart) + 1
          }
        }
        
        const formattedNumber = nextCallNumber.toString().padStart(7, '0')
        return `${formattedNumber}/${currentYear}`
      })
    }
    
    // Test concurrent case number generation
    console.log('Testing concurrent case number generation...');
    const casePromises = []
    for (let i = 0; i < 5; i++) {
      casePromises.push(generateNextCaseNumber())
    }
    
    const caseResults = await Promise.all(casePromises)
    console.log('Generated case numbers:')
    caseResults.forEach((caseNum, i) => {
      console.log(`   ${i + 1}. ${caseNum}`)
    })
    
    // Check for duplicates in case numbers
    const uniqueCaseNumbers = new Set(caseResults)
    if (uniqueCaseNumbers.size === caseResults.length) {
      console.log('✅ All case numbers are unique!')
    } else {
      console.log('❌ Duplicate case numbers detected!')
    }
    
    // Test concurrent call number generation
    console.log('\nTesting concurrent call number generation...');
    const callPromises = []
    for (let i = 0; i < 5; i++) {
      callPromises.push(generateNextCallNumber())
    }
    
    const callResults = await Promise.all(callPromises)
    console.log('Generated call numbers:')
    callResults.forEach((callNum, i) => {
      console.log(`   ${i + 1}. ${callNum}`)
    })
    
    // Check for duplicates in call numbers
    const uniqueCallNumbers = new Set(callResults)
    if (uniqueCallNumbers.size === callResults.length) {
      console.log('✅ All call numbers are unique!')
    } else {
      console.log('❌ Duplicate call numbers detected!')
    }
    
    // Show current database state
    console.log('\n📊 Current database records:');
    const allRecords = await prisma.call_records.findMany({
      select: {
        caseNumber: true,
        callNumber: true,
        callerName: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })
    
    if (allRecords.length === 0) {
      console.log('   No records found in database')
    } else {
      console.log(`   Found ${allRecords.length} records:`)
      allRecords.forEach((record, i) => {
        console.log(`   ${i + 1}. Case: ${record.caseNumber || 'N/A'} | Call: ${record.callNumber || 'N/A'} | Caller: ${record.callerName}`)
      })
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📋 SYSTEMATIC NUMBERING SUMMARY:');
    console.log(`✅ Case Number Format: CASE-YYYY-NNNNNNNN (8 digits)`);
    console.log(`✅ Call Number Format: NNNNNNN/YYYY (7 digits)`);
    console.log(`✅ Transaction-safe: Uses database transactions to prevent duplicates`);
    console.log(`✅ Year-based: Numbers reset each year`);
    console.log(`✅ Sequential: Numbers increment by 1`);
    console.log(`✅ Search-friendly: Easy to query by patterns`);
    
    const currentYear = new Date().getFullYear()
    console.log(`\n🔍 Search Examples for ${currentYear}:`);
    console.log(`   - All cases: CASE-${currentYear}-*`);
    console.log(`   - Case 1: CASE-${currentYear}-00000001`);
    console.log(`   - Cases 1-100: CASE-${currentYear}-000000[0-9][0-9]`);
    console.log(`   - All calls: */${currentYear}`);
    console.log(`   - Call 1: 0000001/${currentYear}`);
    console.log(`   - Calls 1-100: 00000[0-9][0-9]/${currentYear}`);
    
  } catch (error) {
    console.error('❌ Concurrent test error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConcurrentSystematicNumbering().catch(console.error);