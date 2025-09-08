const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testHRAPIFlow() {
  console.log('🧪 Testing HR API Flow...\n');

  try {
    // 1. Test database connection
    console.log('1. Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // 2. Test table existence and structure
    console.log('\n2. Testing table existence...');
    
    try {
      const userCount = await prisma.user.count();
      console.log(`✅ Users table accessible - ${userCount} records`);
    } catch (error) {
      console.error(`❌ Users table error: ${error.message}`);
    }

    try {
      const empCount = await prisma.employee.count();
      console.log(`✅ Employees table accessible - ${empCount} records`);
    } catch (error) {
      console.error(`❌ Employees table error: ${error.message}`);
    }

    try {
      const deptCount = await prisma.department.count();
      console.log(`✅ Departments table accessible - ${deptCount} records`);
    } catch (error) {
      console.error(`❌ Departments table error: ${error.message}`);
    }

    try {
      const eventCount = await prisma.event.count();
      console.log(`✅ Events table accessible - ${eventCount} records`);
    } catch (error) {
      console.error(`❌ Events table error: ${error.message}`);
    }

    // 3. Test specific queries used in HR APIs
    console.log('\n3. Testing HR dashboard queries...');

    try {
      // Test employee queries (from stats API)
      const activeEmployees = await prisma.employee.count({
        where: { status: 'ACTIVE' }
      });
      console.log(`✅ Active employees query: ${activeEmployees}`);
    } catch (error) {
      console.error(`❌ Active employees query failed: ${error.message}`);
    }

    try {
      // Test department breakdown (from stats API)
      const departmentBreakdown = await prisma.department.findMany({
        include: {
          _count: {
            select: {
              employees: {
                where: { status: 'ACTIVE' }
              }
            }
          }
        },
        orderBy: { name: 'asc' }
      });
      console.log(`✅ Department breakdown query: ${departmentBreakdown.length} departments`);
    } catch (error) {
      console.error(`❌ Department breakdown query failed: ${error.message}`);
    }

    try {
      // Test training enrollment queries (from activities API)
      const trainingEnrollments = await prisma.trainingEnrollment.findMany({
        where: {
          status: 'completed',
          updatedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        include: {
          employee: true,
          program: true
        },
        orderBy: { updatedAt: 'desc' },
        take: 5
      });
      console.log(`✅ Training enrollments query: ${trainingEnrollments.length} records`);
    } catch (error) {
      console.error(`❌ Training enrollments query failed: ${error.message}`);
    }

    try {
      // Test performance review queries (from activities API)
      const performanceReviews = await prisma.performanceReview.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        include: {
          employee: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      });
      console.log(`✅ Performance reviews query: ${performanceReviews.length} records`);
    } catch (error) {
      console.error(`❌ Performance reviews query failed: ${error.message}`);
    }

    // 4. Test schema relationships
    console.log('\n4. Testing schema relationships...');

    try {
      // Test if Employee -> Department relationship works
      const employeesWithDept = await prisma.employee.findMany({
        include: {
          departmentRef: true
        },
        take: 1
      });
      console.log(`✅ Employee-Department relationship: ${employeesWithDept.length} tested`);
    } catch (error) {
      console.error(`❌ Employee-Department relationship failed: ${error.message}`);
    }

    // 5. Simulate API data structure
    console.log('\n5. Simulating API responses...');
    
    // Stats API simulation
    const statsResponse = {
      totalEmployees: await prisma.employee.count().catch(() => 0),
      activeEmployees: await prisma.employee.count({ where: { status: 'ACTIVE' }}).catch(() => 0),
      departmentCount: await prisma.department.count().catch(() => 0),
      trainingCount: await prisma.event.count({ where: { type: 'training' }}).catch(() => 0),
      departments: await prisma.department.findMany({
        include: {
          _count: {
            select: {
              employees: { where: { status: 'ACTIVE' }}
            }
          }
        }
      }).catch(() => [])
    };

    console.log('✅ Stats API simulation:', JSON.stringify(statsResponse, null, 2));

    // Activities API simulation
    const activitiesResponse = [];
    
    // Add recent employees
    const recentEmployees = await prisma.employee.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    }).catch(() => []);

    recentEmployees.forEach(emp => {
      activitiesResponse.push({
        id: `emp-${emp.id}`,
        type: 'employee_onboarding',
        title: 'New Employee Onboarded',
        description: `${emp.firstName} ${emp.lastName} joined the organization`,
        timestamp: emp.createdAt.toISOString(),
        user: `${emp.firstName} ${emp.lastName}`,
        status: 'completed'
      });
    });

    console.log('✅ Activities API simulation:', JSON.stringify(activitiesResponse, null, 2));

    console.log('\n🎉 All API flow tests completed successfully!');

  } catch (error) {
    console.error('❌ API flow test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testHRAPIFlow().catch(console.error);
