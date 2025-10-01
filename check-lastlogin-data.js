const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLastLoginData() {
  try {
    console.log('=== CHECKING LAST LOGIN DATA ===');
    
    const users = await prisma.users.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        lastLogin: true,
        createdAt: true,
        isActive: true
      },
      orderBy: {
        email: 'asc'
      }
    });

    console.log(`Found ${users.length} users in database:`);
    console.log('');

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   Created: ${user.createdAt ? user.createdAt.toISOString() : 'Unknown'}`);
      console.log(`   Last Login: ${user.lastLogin ? user.lastLogin.toISOString() : 'NEVER'}`);
      
      if (user.lastLogin) {
        const now = new Date();
        const timeDiff = now.getTime() - user.lastLogin.getTime();
        const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutesDiff = Math.floor(timeDiff / (1000 * 60));
        
        if (daysDiff > 0) {
          console.log(`   Last login was ${daysDiff} days ago`);
        } else if (hoursDiff > 0) {
          console.log(`   Last login was ${hoursDiff} hours ago`);
        } else {
          console.log(`   Last login was ${minutesDiff} minutes ago`);
        }
      }
      console.log('');
    });

    console.log('=== SUMMARY ===');
    const neverLoggedIn = users.filter(u => !u.lastLogin).length;
    const loggedInBefore = users.filter(u => u.lastLogin).length;
    
    console.log(`Users who never logged in: ${neverLoggedIn}`);
    console.log(`Users who logged in before: ${loggedInBefore}`);
    
    if (neverLoggedIn === users.length) {
      console.log('⚠️  ALL USERS SHOW "NEVER" - lastLogin field is not being updated!');
      console.log('💡 This explains why the admin page shows "Never" for all users.');
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error checking last login data:', error);
    await prisma.$disconnect();
  }
}

checkLastLoginData();