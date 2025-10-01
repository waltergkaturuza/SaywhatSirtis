const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkNewUser() {
  try {
    const user = await prisma.users.findUnique({
      where: { email: 'tatenda@saywhat.org' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        passwordHash: true,
        role: true,
        department: true,
        position: true,
        isActive: true,
        createdAt: true
      }
    });
    
    if (user) {
      console.log('=== USER FOUND IN DATABASE ===');
      console.log('Name:', user.firstName, user.lastName);
      console.log('Email:', user.email);
      console.log('Role:', user.role);
      console.log('Department:', user.department);
      console.log('Position:', user.position);
      console.log('Active:', user.isActive);
      console.log('Password hash exists:', !!user.passwordHash);
      console.log('Password hash length:', user.passwordHash ? user.passwordHash.length : 0);
      console.log('Created:', user.createdAt);
      
      if (user.passwordHash) {
        console.log('Password hash starts with:', user.passwordHash.substring(0, 10) + '...');
      }
    } else {
      console.log('❌ User not found in database');
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

checkNewUser();