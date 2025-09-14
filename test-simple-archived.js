const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testSimpleArchived() {
  try {
    console.log('Testing simple archived employees query...');
    
    const archivedEmployees = await prisma.employees.findMany({
      where: { 
        status: 'ARCHIVED'
      },
      include: {
        departments: true
      }
    });
    
    console.log(`Found ${archivedEmployees.length} archived employees:`);
    
    if (archivedEmployees.length > 0) {
      archivedEmployees.forEach(emp => {
        console.log(`- ${emp.firstName} ${emp.lastName}`);
        console.log(`  Department: ${emp.departments?.name || emp.department || 'N/A'}`);
        console.log(`  Position: ${emp.position || 'N/A'}`);
        console.log(`  Status: ${emp.status}`);
      });
      
      console.log('✅ Database query with departments works!');
    }
    
  } catch (error) {
    console.error('❌ Query failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testSimpleArchived();
