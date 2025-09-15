const { PrismaClient } = require('@prisma/client');

async function checkUsers() {
  const prisma = new PrismaClient();
  
  try {
    const users = await prisma.users.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        roles: true,
        department: true,
        position: true,
        supervisorId: true,
        isActive: true
      }
    });
    
    console.log(`Total users in database: ${users.length}`);
    console.log('Users:', JSON.stringify(users, null, 2));
    
    // Also check if admin user exists
    const adminUser = users.find(u => u.email && u.email.includes('admin'));
    console.log('Admin user found:', adminUser ? 'Yes' : 'No');
    
  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
