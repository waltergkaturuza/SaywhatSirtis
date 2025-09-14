const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStatuses() {
  try {
    const employees = await prisma.employees.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        status: true,
        updatedAt: true
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    console.log('All employees and their statuses:');
    employees.forEach(emp => {
      console.log(`${emp.firstName} ${emp.lastName}: ${emp.status} (Updated: ${emp.updatedAt})`);
    });
    
    console.log('\nStatus counts:');
    const statusCounts = employees.reduce((acc, emp) => {
      acc[emp.status] = (acc[emp.status] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`${status}: ${count}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStatuses();
