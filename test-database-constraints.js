// Direct database test for unique constraint handling
const { PrismaClient } = require('@prisma/client')

async function testUniqueConstraintFix() {
  console.log('Testing Unique Constraint Fix with Direct Database Access...\n');
  
  const prisma = new PrismaClient()
  
  try {
    // Test the unique case number generation logic
    console.log('Test 1: Generating unique case numbers...');
    
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    
    // Check existing case numbers for today
    const existingCalls = await prisma.call_records.findMany({
      where: {
        caseNumber: {
          startsWith: `CASE-${today}-`
        }
      },
      select: {
        caseNumber: true
      }
    });
    
    console.log(`Found ${existingCalls.length} existing calls for today`);
    
    // Generate multiple unique case numbers
    const generatedNumbers = new Set();
    
    for (let i = 0; i < 10; i++) {
      let attempts = 0;
      let caseNumber;
      
      do {
        attempts++;
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        caseNumber = `CASE-${today}-${timestamp}-${random}`;
        
        // Check if exists in database
        const existsInDb = await prisma.call_records.findUnique({
          where: { caseNumber }
        });
        
        if (!existsInDb && !generatedNumbers.has(caseNumber)) {
          generatedNumbers.add(caseNumber);
          break;
        }
        
        if (attempts > 10) {
          // Use UUID as fallback
          const { randomUUID } = require('crypto');
          caseNumber = `CASE-${today}-${randomUUID().slice(0, 8)}`;
          generatedNumbers.add(caseNumber);
          break;
        }
        
        // Small delay to ensure different timestamps
        await new Promise(resolve => setTimeout(resolve, 1));
      } while (true);
      
      console.log(`Generated #${i + 1}: ${caseNumber} (attempts: ${attempts})`);
    }
    
    console.log(`✅ Successfully generated ${generatedNumbers.size} unique case numbers`);
    
    console.log('\nTest 2: Testing database insertion with unique constraint...');
    
    // Test creating a few actual records
    const testRecords = [];
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < 3; i++) {
      try {
        const timestamp = Date.now() + i; // Ensure different timestamps
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const caseNumber = `TEST-${today}-${timestamp}-${random}`;
        
        const record = await prisma.call_records.create({
          data: {
            id: require('crypto').randomUUID(),
            caseNumber: caseNumber,
            callNumber: `CALL-${timestamp}`,
            officerName: 'Test Officer',
            callerName: `Test Caller ${i + 1}`,
            callerPhone: `123456789${i}`,
            callType: 'inbound',
            modeOfCommunication: 'inbound',
            callDescription: `Test call ${i + 1} for unique constraint verification`,
            purpose: 'Testing',
            category: 'INQUIRY',
            priority: 'MEDIUM',
            subject: 'Test Call',
            description: 'Testing unique constraint fix',
            summary: 'Test call',
            assignedOfficer: 'Test Officer',
            status: 'OPEN',
            callStartTime: new Date(),
            updatedAt: new Date()
          }
        });
        
        testRecords.push(record);
        successCount++;
        console.log(`✅ Created record ${i + 1}: ${record.caseNumber}`);
        
      } catch (error) {
        errorCount++;
        console.log(`❌ Failed to create record ${i + 1}:`, error.message);
      }
    }
    
    console.log(`\nResults: ${successCount} successful, ${errorCount} failed`);
    
    if (successCount === 3) {
      console.log('✅ Test 2 PASSED - All records created successfully');
    } else if (successCount > 0) {
      console.log('⚠️  Test 2 PARTIAL - Some records created');
    } else {
      console.log('❌ Test 2 FAILED - No records created');
    }
    
    // Cleanup test records
    if (testRecords.length > 0) {
      console.log('\nCleaning up test records...');
      const deleteResult = await prisma.call_records.deleteMany({
        where: {
          id: {
            in: testRecords.map(r => r.id)
          }
        }
      });
      console.log(`Cleaned up ${deleteResult.count} test records`);
    }
    
  } catch (error) {
    console.error('Test Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testUniqueConstraintFix().catch(console.error);