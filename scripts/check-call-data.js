const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCallData() {
  try {
    console.log('🔍 Checking call records data...');
    
    // Get total count
    const totalCalls = await prisma.call_records.count();
    console.log(`📊 Total call records: ${totalCalls}`);
    
    if (totalCalls === 0) {
      console.log('❌ No call records found in database');
      return;
    }
    
    // Get sample call records
    const sampleCalls = await prisma.call_records.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        caseNumber: true,
        callNumber: true,
        officerName: true,
        assignedOfficer: true,
        callerName: true,
        modeOfCommunication: true,
        callValidity: true,
        voucherIssued: true,
        purpose: true,
        status: true,
        createdAt: true
      }
    });
    
    console.log('\n📋 Sample call records:');
    sampleCalls.forEach((call, index) => {
      console.log(`\n${index + 1}. Call ID: ${call.id}`);
      console.log(`   Case Number: ${call.caseNumber}`);
      console.log(`   Officer Name: ${call.officerName || 'NULL'}`);
      console.log(`   Assigned Officer: ${call.assignedOfficer || 'NULL'}`);
      console.log(`   Caller Name: ${call.callerName || 'NULL'}`);
      console.log(`   Communication Mode: ${call.modeOfCommunication || 'NULL'}`);
      console.log(`   Call Validity: ${call.callValidity || 'NULL'}`);
      console.log(`   Purpose: ${call.purpose || 'NULL'}`);
      console.log(`   Status: ${call.status || 'NULL'}`);
      console.log(`   Voucher Issued: ${call.voucherIssued || 'NULL'}`);
      console.log(`   Created: ${call.createdAt}`);
    });
    
    // Check for null officer names
    const nullOfficerCount = await prisma.call_records.count({
      where: {
        AND: [
          { officerName: null },
          { assignedOfficer: null }
        ]
      }
    });
    
    console.log(`\n⚠️  Records with no officer assigned: ${nullOfficerCount} out of ${totalCalls}`);
    
    if (nullOfficerCount > 0) {
      console.log('\n🔧 These records will show "N/A" for officer field');
      console.log('💡 Suggestion: Update records with proper officer assignments');
    }
    
  } catch (error) {
    console.error('❌ Error checking call data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCallData();