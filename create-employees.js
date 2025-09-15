const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createEmployeeRecords() {
  try {
    console.log('🔍 Checking existing employee records...');
    
    const existingEmployees = await prisma.employees.findMany({
      include: {
        user: {
          select: { email: true, firstName: true, lastName: true }
        }
      }
    });
    
    console.log(`Found ${existingEmployees.length} existing employees`);
    
    if (existingEmployees.length > 0) {
      console.log('Existing employees:');
      existingEmployees.forEach(emp => {
        console.log(`- ${emp.firstName} ${emp.lastName} (${emp.user?.email || 'no user'})`);
      });
    }

    // Get all users
    const users = await prisma.users.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        department: true,
        position: true
      }
    });

    console.log('\n🚀 Creating missing employee records...');

    for (const user of users) {
      // Check if employee already exists for this user
      const existingEmployee = await prisma.employees.findFirst({
        where: { userId: user.id }
      });

      if (!existingEmployee) {
        const newEmployee = await prisma.employees.create({
          data: {
            id: `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            employeeId: `EMP${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
            firstName: user.firstName || 'Unknown',
            lastName: user.lastName || 'User',
            position: user.position || 'Employee',
            userId: user.id,
            startDate: new Date('2024-01-01'),
            status: 'active'
          }
        });
        console.log(`✅ Created employee record for ${user.firstName} ${user.lastName}`);
      } else {
        console.log(`ℹ️  Employee record already exists for ${user.firstName} ${user.lastName}`);
      }
    }

    console.log('\n📊 Final employee count:');
    const finalEmployees = await prisma.employees.findMany({
      include: {
        user: {
          select: { email: true, firstName: true, lastName: true }
        }
      }
    });
    console.log(`Total employees: ${finalEmployees.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createEmployeeRecords();
