const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testHRStats() {
  try {
    console.log('Testing HR statistics manually...');
    
    // Manually run the same queries as the API
    const [
      totalEmployees,
      activeEmployees,
      departmentCount,
      trainingCount,
      activeTrainings
    ] = await Promise.all([
      prisma.employee.count().catch(e => { console.error('Employee count error:', e); return 0; }),
      prisma.employee.count({
        where: { status: 'ACTIVE' }
      }).catch(e => { console.error('Active employee count error:', e); return 0; }),
      prisma.department.count().catch(e => { console.error('Department count error:', e); return 0; }),
      prisma.event.count({
        where: { type: 'training' }
      }).catch(e => { console.error('Training count error:', e); return 0; }),
      prisma.event.count({
        where: {
          type: 'training',
          status: { in: ['approved', 'in-progress'] }
        }
      }).catch(e => { console.error('Active training count error:', e); return 0; })
    ]);

    console.log('Manual stats:', { 
      totalEmployees, 
      activeEmployees, 
      departmentCount, 
      trainingCount, 
      activeTrainings 
    });

    // Test employee fetching
    const employees = await prisma.employee.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        employeeId: true,
        firstName: true,
        lastName: true,
        email: true,
        department: true,
        position: true,
        status: true
      }
    });

    console.log('Employees found:', employees.length);
    console.log('Sample employee:', employees[0]);

    // Test department fetching
    const departments = await prisma.department.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        status: true,
        _count: {
          select: {
            employees: true
          }
        }
      }
    });

    console.log('Departments found:', departments.length);
    console.log('Departments:', departments);

    await prisma.$disconnect();

  } catch (error) {
    console.error('Error testing HR stats:', error);
    await prisma.$disconnect();
  }
}

testHRStats();
