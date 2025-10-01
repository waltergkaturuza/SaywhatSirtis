const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserPermissions() {
  try {
    const user = await prisma.users.findUnique({
      where: { email: 'admin@saywhat.org' },
      select: { 
        firstName: true, 
        lastName: true, 
        email: true, 
        role: true,
        roles: true  // This might be the correct field
      }
    });
    
    console.log('=== ADMIN USER DETAILS ===');
    console.log('User:', user);
    console.log('Role field:', user?.role);
    console.log('Roles field:', user?.roles);
    
    // Check what the API expects
    const apiRoles = ['admin', 'manager'];
    const hasAPIRoleAccess = apiRoles.includes(user?.role);
    console.log('API role access (needs:', apiRoles, '):', hasAPIRoleAccess);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUserPermissions();