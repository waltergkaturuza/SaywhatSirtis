const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testArchivedEmployeesDirectly() {
  try {
    console.log('Testing archived employees database query directly...');
    
    // Test the same query as the API
    const archivedEmployees = await prisma.employees.findMany({
      where: { 
        status: 'ARCHIVED'
      },
      include: {
        departments: true,
        employees: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    console.log(`Found ${archivedEmployees.length} archived employees:`);
    
    if (archivedEmployees.length > 0) {
      archivedEmployees.forEach(emp => {
        console.log(`- ${emp.firstName} ${emp.lastName}`);
        console.log(`  Department: ${emp.departments?.name || emp.department || 'N/A'}`);
        console.log(`  Position: ${emp.position || 'N/A'}`);
        console.log(`  Status: ${emp.status}`);
        console.log(`  Updated: ${emp.updatedAt}`);
        console.log('');
      });
      
      console.log('✅ Database query works correctly');
      console.log('The issue is likely in the API authentication or response handling');
    } else {
      console.log('❌ No archived employees found in database');
    }
    
  } catch (error) {
    console.error('❌ Database query failed:', error.message);
    
    // Try with the include relationships issue
    console.log('\nTrying with simpler query...');
    
    try {
      const simpleQuery = await prisma.employees.findMany({
        where: { 
          status: 'ARCHIVED'
        }
      });
      
      console.log(`Simple query found ${simpleQuery.length} archived employees`);
      if (simpleQuery.length > 0) {
        console.log('✅ Simple query works - the issue is with the include relationships');
        console.log('Error details for include:', error.message);
      }
      
    } catch (simpleError) {
      console.error('❌ Even simple query failed:', simpleError.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testArchivedEmployeesDirectly();
