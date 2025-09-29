// Fix the existing case record to use systematic case numbering
const { PrismaClient } = require('@prisma/client');

async function fixExistingCaseNumber() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Fixing existing case record to use systematic case numbering...\n');
    
    // Get the current record
    const existingCall = await prisma.call_records.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    
    if (!existingCall) {
      console.log('No records found');
      return;
    }
    
    console.log('Current record:');
    console.log('ID:', existingCall.id);
    console.log('Case Number:', existingCall.caseNumber);
    console.log('Call Number:', existingCall.callNumber);
    console.log('Caller:', existingCall.callerName);
    
    // Generate proper systematic case number
    const year = new Date().getFullYear();
    const newCaseNumber = `CASE-${year}-00000001`;
    const newCallNumber = `00000001/${year}`;
    
    console.log('\nUpdating to systematic format:');
    console.log('New Case Number:', newCaseNumber);
    console.log('New Call Number:', newCallNumber);
    
    // Update the record
    const updatedCall = await prisma.call_records.update({
      where: { id: existingCall.id },
      data: {
        caseNumber: newCaseNumber,
        callNumber: newCallNumber,
        updatedAt: new Date()
      }
    });
    
    console.log('\n✅ Successfully updated case record!');
    console.log('Updated Case Number:', updatedCall.caseNumber);
    console.log('Updated Call Number:', updatedCall.callNumber);
    
    // Verify the change
    const verifyCall = await prisma.call_records.findUnique({
      where: { id: existingCall.id },
      select: {
        id: true,
        caseNumber: true,
        callNumber: true,
        callerName: true,
        status: true
      }
    });
    
    console.log('\n🔍 Verification:');
    console.log('ID:', verifyCall.id);
    console.log('Case Number:', verifyCall.caseNumber);
    console.log('Call Number:', verifyCall.callNumber);
    console.log('Caller:', verifyCall.callerName);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixExistingCaseNumber().catch(console.error);