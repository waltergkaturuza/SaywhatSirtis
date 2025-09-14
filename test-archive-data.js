const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testArchiveAPIData() {
  try {
    console.log('Testing archived employees API data structure...');
    
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
        console.log(`\n--- Employee: ${emp.firstName} ${emp.lastName} ---`);
        console.log(`ID: ${emp.id}`);
        console.log(`Employee ID: ${emp.employeeId}`);
        console.log(`Email: ${emp.email}`);
        console.log(`Department: ${emp.departments?.name || emp.department || 'N/A'}`);
        console.log(`Position: ${emp.position || 'N/A'}`);
        console.log(`Phone: ${emp.phoneNumber || 'N/A'}`);
        console.log(`Status: ${emp.status}`);
        console.log(`Archive Date: ${emp.archived_at || 'Not set'}`);
        console.log(`Archive Reason: ${emp.archive_reason || 'Not specified'}`);
        console.log(`Access Revoked: ${emp.access_revoked}`);
        console.log(`Created: ${emp.createdAt}`);
        console.log(`Updated: ${emp.updatedAt}`);
        
        // Test the transformation
        const transformed = {
          id: emp.id,
          employeeId: emp.employeeId,
          email: emp.email,
          username: `${emp.firstName} ${emp.lastName}`,
          department: emp.departments?.name || emp.department || 'N/A',
          position: emp.position || 'N/A',
          phone: emp.phoneNumber || 'N/A',
          archiveDate: emp.archived_at ? new Date(emp.archived_at) : new Date(emp.updatedAt),
          archiveReason: emp.archive_reason || 'Not specified',
          clearanceStatus: emp.access_revoked ? 'Revoked' : 'Pending',
          supervisor: 'N/A',
          exitInterview: false,
          notes: 'N/A',
          createdAt: emp.createdAt,
          updatedAt: emp.updatedAt,
          lastLogin: null
        };
        
        console.log('\n--- Transformed for API ---');
        console.log(`Username: ${transformed.username}`);
        console.log(`Archive Date: ${transformed.archiveDate.toLocaleDateString()}`);
        console.log(`Archive Reason: ${transformed.archiveReason}`);
        console.log(`Clearance Status: ${transformed.clearanceStatus}`);
      });
      
      console.log('\n✅ Archive data structure looks good!');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testArchiveAPIData();
