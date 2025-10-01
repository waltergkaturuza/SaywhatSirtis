const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateAdminLastLogin() {
  try {
    console.log('=== UPDATING ADMIN LAST LOGIN ===');
    
    // Update the admin user's lastLogin to current time
    const result = await prisma.users.updateMany({
      where: {
        email: 'admin@saywhat.org'
      },
      data: {
        lastLogin: new Date()
      }
    });

    console.log(`Updated ${result.count} admin user(s) with current lastLogin timestamp`);
    
    // Verify the update
    const adminUser = await prisma.users.findUnique({
      where: { email: 'admin@saywhat.org' },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        lastLogin: true
      }
    });

    if (adminUser) {
      console.log('Admin user after update:');
      console.log(`Name: ${adminUser.firstName} ${adminUser.lastName}`);
      console.log(`Email: ${adminUser.email}`);
      console.log(`Last Login: ${adminUser.lastLogin ? adminUser.lastLogin.toISOString() : 'STILL NULL'}`);
      
      if (adminUser.lastLogin) {
        const now = new Date();
        const secondsAgo = Math.floor((now.getTime() - adminUser.lastLogin.getTime()) / 1000);
        console.log(`✅ Last login updated ${secondsAgo} seconds ago`);
      }
    } else {
      console.log('❌ Admin user not found');
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error updating admin last login:', error);
    await prisma.$disconnect();
  }
}

updateAdminLastLogin();