const { PrismaClient } = require('@prisma/client');

async function checkExistingEmployees() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking existing employees in database...\n');
    
    // Check total employees
    const totalEmployees = await prisma.employees.count();
    console.log(`📊 Total employees in database: ${totalEmployees}`);
    
    if (totalEmployees > 0) {
      // Get sample employees
      const employees = await prisma.employees.findMany({
        take: 10,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          department: true,
          position: true,
          status: true,
          employeeId: true
        }
      });
      
      console.log('\n👥 Sample employees:');
      employees.forEach((emp, index) => {
        console.log(`${index + 1}. ${emp.firstName} ${emp.lastName} (${emp.email})`);
        console.log(`   Department: ${emp.department || 'Not set'}`);
        console.log(`   Position: ${emp.position || 'Not set'}`);
        console.log(`   Status: ${emp.status || 'Not set'}`);
        console.log(`   Employee ID: ${emp.employeeId || 'Not set'}`);
        console.log('');
      });
      
      // Check departments
      const departments = await prisma.employees.groupBy({
        by: ['department'],
        _count: { id: true },
        where: {
          department: { not: null }
        }
      });
      
      console.log('🏢 Departments and employee counts:');
      departments.forEach(dept => {
        console.log(`   ${dept.department}: ${dept._count.id} employees`);
      });
    }
    
    // Check users for comparison
    const totalUsers = await prisma.users.count();
    console.log(`\n👤 Total users in database: ${totalUsers}`);
    
    if (totalUsers > 0) {
      const users = await prisma.users.findMany({
        take: 5,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          status: true
        }
      });
      
      console.log('\n👤 Sample users:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking employees:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkExistingEmployees();