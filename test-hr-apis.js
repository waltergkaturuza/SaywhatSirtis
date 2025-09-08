const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testHRAPIs() {
  console.log('🧪 Testing HR Dashboard APIs...\n');

  try {
    // Test database connection
    console.log('1. Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected');

    // Test users table
    console.log('\n2. Checking users table...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        roles: true,
        department: true
      }
    });
    console.log(`✅ Users found: ${users.length}`);
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.role}) - Dept: ${user.department || 'None'}`);
      console.log(`     Roles: ${JSON.stringify(user.roles)}`);
    });

    // Test departments table
    console.log('\n3. Checking departments table...');
    const departments = await prisma.department.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            employees: true
          }
        }
      }
    });
    console.log(`✅ Departments found: ${departments.length}`);
    departments.forEach(dept => {
      console.log(`   - ${dept.name} (${dept.employees || 0} employees)`);
    });

    // Test employees table
    console.log('\n4. Checking employees table...');
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        departmentId: true,
        departmentRef: {
          select: {
            name: true
          }
        }
      }
    });
    console.log(`✅ Employees found: ${employees.length}`);
    employees.forEach(emp => {
      console.log(`   - ${emp.firstName} ${emp.lastName} (${emp.email}) - Dept: ${emp.departmentRef?.name || 'None'}`);
    });

    // Test events table for activities
    console.log('\n5. Checking events table...');
    const events = await prisma.event.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        type: true,
        createdAt: true
      }
    });
    console.log(`✅ Events found: ${events.length}`);
    events.forEach(event => {
      console.log(`   - ${event.title} (${event.type}) - ${event.createdAt}`);
    });

    // Test specific queries that might be failing
    console.log('\n6. Testing specific dashboard queries...');
    
    try {
      const totalEmployees = await prisma.employee.count();
      console.log(`✅ Total employees count: ${totalEmployees}`);
    } catch (error) {
      console.error(`❌ Employee count failed: ${error.message}`);
    }

    try {
      const totalDepartments = await prisma.department.count();
      console.log(`✅ Total departments count: ${totalDepartments}`);
    } catch (error) {
      console.error(`❌ Department count failed: ${error.message}`);
    }

    try {
      const totalEvents = await prisma.event.count();
      console.log(`✅ Total events count: ${totalEvents}`);
    } catch (error) {
      console.error(`❌ Event count failed: ${error.message}`);
    }

    try {
      const activeEmployees = await prisma.employee.count({
        where: {
          status: 'active'
        }
      });
      console.log(`✅ Active employees count: ${activeEmployees}`);
    } catch (error) {
      console.error(`❌ Active employees count failed: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testHRAPIs().catch(console.error);
