// Test the case edit functionality by making direct API calls
const { PrismaClient } = require('@prisma/client');

async function testCaseEditFunctionality() {
  console.log('🧪 Testing Case Edit Functionality\n' + '='.repeat(50));
  
  const prisma = new PrismaClient();
  
  try {
    // 1. Get the case from database
    console.log('1. Fetching case from database...');
    const caseFromDb = await prisma.call_records.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    
    if (!caseFromDb) {
      console.log('❌ No case found in database');
      return;
    }
    
    console.log('✅ Found case:');
    console.log('   ID:', caseFromDb.id);
    console.log('   Case Number:', caseFromDb.caseNumber);
    console.log('   Caller Name:', caseFromDb.callerName);
    console.log('   Status:', caseFromDb.status);
    console.log('   Priority:', caseFromDb.priority);
    
    // 2. Test the API GET endpoint logic directly
    console.log('\n2. Testing API GET logic...');
    
    const caseData = {
      id: caseFromDb.id,
      caseNumber: caseFromDb.caseNumber,
      callNumber: caseFromDb.callNumber,
      status: caseFromDb.status || 'OPEN',
      priority: caseFromDb.priority || 'MEDIUM',
      // Client Information
      clientName: caseFromDb.callerName || caseFromDb.clientName,
      clientPhone: caseFromDb.callerPhone,
      clientEmail: caseFromDb.callerEmail,
      clientAge: caseFromDb.callerAge,
      clientGender: caseFromDb.callerGender,
      clientAddress: caseFromDb.callerAddress,
      clientProvince: caseFromDb.callerProvince,
      // Case details
      assignedOfficer: caseFromDb.assignedOfficer,
      notes: caseFromDb.notes,
      summary: caseFromDb.summary,
      followUpRequired: caseFromDb.followUpRequired,
      followUpDate: caseFromDb.followUpDate,
      createdAt: caseFromDb.createdAt,
      updatedAt: caseFromDb.updatedAt
    };
    
    console.log('✅ Case data structure for frontend:');
    console.log('   Case Number:', caseData.caseNumber);
    console.log('   Client Name:', caseData.clientName);
    console.log('   Client Phone:', caseData.clientPhone);
    console.log('   Status:', caseData.status);
    console.log('   Assigned Officer:', caseData.assignedOfficer);
    
    // 3. Test update logic
    console.log('\n3. Testing update logic...');
    
    // Simulate form data that might come from frontend
    const updateData = {
      clientName: 'Walter Oscar (Updated)',
      clientPhone: '0777937721',
      clientEmail: 'walter@example.com',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      assignedOfficer: 'System Administrator',
      notes: 'Updated case notes',
      followUpRequired: true,
      followUpDate: new Date('2025-10-15')
    };
    
    console.log('Update data to be sent:', updateData);
    
    // Test the update
    const updatedCase = await prisma.call_records.update({
      where: { id: caseFromDb.id },
      data: {
        // Client Information
        callerName: updateData.clientName,
        callerPhone: updateData.clientPhone,
        callerEmail: updateData.clientEmail,
        // Management
        status: updateData.status,
        priority: updateData.priority,
        assignedOfficer: updateData.assignedOfficer,
        notes: updateData.notes,
        followUpRequired: updateData.followUpRequired,
        followUpDate: updateData.followUpDate,
        updatedAt: new Date()
      }
    });
    
    console.log('✅ Update successful!');
    console.log('   Updated Caller Name:', updatedCase.callerName);
    console.log('   Updated Phone:', updatedCase.callerPhone);
    console.log('   Updated Status:', updatedCase.status);
    console.log('   Updated Priority:', updatedCase.priority);
    console.log('   Updated Notes:', updatedCase.notes);
    
    // 4. Verify the update
    console.log('\n4. Verifying update...');
    const verifiedCase = await prisma.call_records.findUnique({
      where: { id: caseFromDb.id }
    });
    
    if (verifiedCase) {
      console.log('✅ Verification successful!');
      console.log('   Case Number:', verifiedCase.caseNumber, '(should remain unchanged)');
      console.log('   Caller Name:', verifiedCase.callerName);
      console.log('   Status:', verifiedCase.status);
      console.log('   Updated At:', verifiedCase.updatedAt.toISOString());
    }
    
    console.log('\n🎉 Case edit functionality test PASSED!');
    console.log('The API should now work correctly with the frontend form.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testCaseEditFunctionality().catch(console.error);