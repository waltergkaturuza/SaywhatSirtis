const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('Checking database...');
    
    const userCount = await prisma.users.count();
    console.log(`Users count: ${userCount}`);
    
    const employeeCount = await prisma.employees.count();
    console.log(`Employees count: ${employeeCount}`);
    
    if (userCount > 0) {
      const users = await prisma.users.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true
        }
      });
      console.log('Users:', users);
    }
    
    if (employeeCount > 0) {
      const employees = await prisma.employees.findMany({
        select: {
          id: true,
          employeeId: true,
          firstName: true,
          lastName: true,
          userId: true
        }
      });
      console.log('Employees:', employees);
    }
    
  } catch (error) {
    console.error('Database check error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();