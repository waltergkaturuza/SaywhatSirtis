const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCallCentreData() {
  try {
    console.log('Checking call centre data...');
    
    // Check if call_records table exists and has data
    const callRecordsCount = await prisma.call_records.count();
    console.log(`Total call records: ${callRecordsCount}`);
    
    if (callRecordsCount > 0) {
      const sampleRecords = await prisma.call_records.findMany({
        take: 5,
        select: {
          id: true,
          officerName: true,
          callerPhone: true,
          callerProvince: true,
          purpose: true,
          callValidity: true,
          createdAt: true
        }
      });
      
      console.log('Sample call records:');
      console.table(sampleRecords);
    }
    
    // Check users table for officers
    const usersCount = await prisma.users.count();
    console.log(`Total users: ${usersCount}`);
    
    if (usersCount > 0) {
      const sampleUsers = await prisma.users.findMany({
        take: 5,
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          email: true,
          roles: true,
          isActive: true
        }
      });
      
      console.log('Sample users:');
      console.table(sampleUsers);
    }
    
  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCallCentreData();