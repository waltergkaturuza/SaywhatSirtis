const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCaseData() {
  try {
    const calls = await prisma.call_records.findMany({
      select: {
        id: true,
        caseNumber: true,
        callNumber: true,
        callerName: true,
        status: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('Current call records in database:');
    console.log('='.repeat(60));
    calls.forEach(call => {
      console.log(`ID: ${call.id}`);
      console.log(`Case Number: ${call.caseNumber}`);
      console.log(`Call Number: ${call.callNumber}`);
      console.log(`Caller: ${call.callerName}`);
      console.log(`Status: ${call.status}`);
      console.log('---');
    });
    
    // Check for ID format issues
    console.log('\nID Format Analysis:');
    calls.forEach(call => {
      const idSubstring = call.id.substring(0, 8);
      console.log(`Call ID: ${call.id}`);
      console.log(`ID substring (0,8): ${idSubstring}`);
      console.log(`Case Number: ${call.caseNumber}`);
      console.log(`Match old format?: CASE-${idSubstring} = CASE-${idSubstring}`);
      console.log('');
    });
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    await prisma.$disconnect();
  }
}

checkCaseData();