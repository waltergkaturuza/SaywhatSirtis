// Check current database state
const { PrismaClient } = require('@prisma/client')

async function checkDatabaseState() {
  const prisma = new PrismaClient()
  
  try {
    console.log('SIRTIS Database Status Check\n' + '='.repeat(50));
    
    // Check call_records table
    const callCount = await prisma.call_records.count()
    console.log(`📞 Call Records: ${callCount} total`);
    
    if (callCount > 0) {
      const recentCalls = await prisma.call_records.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          caseNumber: true,
          callerName: true,
          callType: true,
          status: true,
          createdAt: true
        }
      });
      
      console.log('\nRecent calls:');
      recentCalls.forEach((call, i) => {
        console.log(`${i + 1}. ${call.caseNumber} - ${call.callerName} (${call.status}) - ${call.createdAt.toISOString()}`);
      });
    }
    
    // Check users table
    const userCount = await prisma.user.count()
    console.log(`\n👥 Users: ${userCount} total`);
    
    if (userCount > 0) {
      const users = await prisma.user.findMany({
        take: 3,
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      });
      
      console.log('\nUsers:');
      users.forEach((user, i) => {
        console.log(`${i + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
      });
    }
    
    // Check employees table
    const employeeCount = await prisma.employee.count()
    console.log(`\n👔 Employees: ${employeeCount} total`);
    
    // Check departments
    const departmentCount = await prisma.department.count()
    console.log(`🏢 Departments: ${departmentCount} total`);
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ Database connection successful!');
    
  } catch (error) {
    console.error('❌ Database Error:', error.message);
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabaseState().catch(console.error);