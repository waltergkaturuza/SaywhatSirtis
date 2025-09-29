// Test systematic case and call number generation
const { PrismaClient } = require('@prisma/client')

async function testSystematicNumbering() {
  console.log('Testing Systematic Case and Call Number Generation\n' + '='.repeat(60));
  
  const prisma = new PrismaClient()
  
  try {
    const currentYear = new Date().getFullYear()
    
    console.log('🔍 Checking existing case and call numbers...\n');
    
    // Check existing case numbers
    const existingCases = await prisma.call_records.findMany({
      where: {
        caseNumber: {
          startsWith: `CASE-${currentYear}-`
        }
      },
      select: {
        id: true,
        caseNumber: true,
        callNumber: true,
        createdAt: true
      },
      orderBy: {
        caseNumber: 'asc'
      }
    });
    
    console.log(`📊 Found ${existingCases.length} existing records for ${currentYear}:`);
    existingCases.forEach((record, i) => {
      console.log(`   ${i + 1}. Case: ${record.caseNumber} | Call: ${record.callNumber}`);
    });
    
    // Simulate what the next numbers would be
    console.log('\n🔮 Predicting next numbers...');
    
    // Find latest case number
    const latestCase = await prisma.call_records.findFirst({
      where: {
        caseNumber: {
          startsWith: `CASE-${currentYear}-`
        }
      },
      orderBy: {
        caseNumber: 'desc'
      }
    });
    
    let nextCaseNumber = 1
    if (latestCase) {
      const caseNumberPart = latestCase.caseNumber.split('-')[2]
      if (caseNumberPart) {
        nextCaseNumber = parseInt(caseNumberPart) + 1
      }
    }
    
    // Find latest call number  
    const latestCall = await prisma.call_records.findFirst({
      where: {
        callNumber: {
          endsWith: `/${currentYear}`
        }
      },
      orderBy: {
        callNumber: 'desc'
      }
    });
    
    let nextCallNumber = 1
    if (latestCall && latestCall.callNumber) {
      const callNumberPart = latestCall.callNumber.split('/')[0]
      if (callNumberPart) {
        nextCallNumber = parseInt(callNumberPart) + 1
      }
    }
    
    const predictedCaseNumber = `CASE-${currentYear}-${nextCaseNumber.toString().padStart(8, '0')}`
    const predictedCallNumber = `${nextCallNumber.toString().padStart(7, '0')}/${currentYear}`
    
    console.log(`   Next Case Number: ${predictedCaseNumber}`);
    console.log(`   Next Call Number: ${predictedCallNumber}`);
    
    // Test the numbering format
    console.log('\n📝 Testing number formatting...');
    
    const testNumbers = [1, 10, 100, 1000, 10000, 100000, 1000000, 9999999];
    console.log('   Case Number Format (8 digits):');
    testNumbers.forEach(num => {
      if (num <= 99999999) {
        const formatted = `CASE-${currentYear}-${num.toString().padStart(8, '0')}`;
        console.log(`     ${num} -> ${formatted}`);
      }
    });
    
    console.log('   Call Number Format (7 digits):');
    testNumbers.forEach(num => {
      if (num <= 9999999) {
        const formatted = `${num.toString().padStart(7, '0')}/${currentYear}`;
        console.log(`     ${num} -> ${formatted}`);
      }
    });
    
    // Demonstrate search capabilities
    console.log('\n🔍 Testing search capabilities...');
    
    // Search by case number prefix
    const caseSearchResults = await prisma.call_records.findMany({
      where: {
        caseNumber: {
          startsWith: `CASE-${currentYear}`
        }
      },
      select: {
        caseNumber: true,
        callerName: true
      },
      take: 3,
      orderBy: {
        caseNumber: 'asc'
      }
    });
    
    console.log(`   Case Number Search (CASE-${currentYear}*): ${caseSearchResults.length} results`);
    caseSearchResults.forEach(result => {
      console.log(`     ${result.caseNumber} - ${result.callerName}`);
    });
    
    // Search by call number pattern  
    const callSearchResults = await prisma.call_records.findMany({
      where: {
        callNumber: {
          endsWith: `/${currentYear}`
        }
      },
      select: {
        callNumber: true,
        callerName: true
      },
      take: 3,
      orderBy: {
        callNumber: 'asc'
      }
    });
    
    console.log(`   Call Number Search (*/${currentYear}): ${callSearchResults.length} results`);
    callSearchResults.forEach(result => {
      console.log(`     ${result.callNumber} - ${result.callerName}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 SYSTEMATIC NUMBERING ANALYSIS:');
    
    console.log('\n✅ ADVANTAGES:');
    console.log('   - Sequential and predictable numbering');
    console.log('   - Easy to search by year and number ranges');
    console.log('   - Clear chronological ordering');
    console.log('   - Professional appearance');
    console.log('   - No duplicates with proper database constraints');
    
    console.log('\n📈 CAPACITY:');
    console.log(`   - Case Numbers: Up to 99,999,999 per year`);
    console.log(`   - Call Numbers: Up to 9,999,999 per year`);
    console.log(`   - Format: CASE-${currentYear}-00000001 to CASE-${currentYear}-99999999`);
    console.log(`   - Format: 0000001/${currentYear} to 9999999/${currentYear}`);
    
    console.log('\n🔍 SEARCH EXAMPLES:');
    console.log(`   - All cases for ${currentYear}: CASE-${currentYear}-*`);
    console.log(`   - Cases 1-1000: CASE-${currentYear}-0000000[1-9] or CASE-${currentYear}-000000[1-9]*`);
    console.log(`   - All calls for ${currentYear}: */${currentYear}`);
    console.log(`   - Calls 1-1000: 000000[1-9]*/${currentYear}`);
    
  } catch (error) {
    console.error('❌ Test Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testSystematicNumbering().catch(console.error);