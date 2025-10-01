// Check password hashes in the database
const { PrismaClient } = require('@prisma/client');

async function checkPasswordHashes() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Checking password hashes in database...');
    
    const users = await prisma.users.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        passwordHash: true,
      }
    });

    console.log('\nUsers and their password hash status:');
    users.forEach(user => {
      console.log(`\nUser: ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`  Password hash exists: ${!!user.passwordHash}`);
      if (user.passwordHash) {
        console.log(`  Password hash type: ${typeof user.passwordHash}`);
        console.log(`  Password hash length: ${user.passwordHash.length}`);
        console.log(`  First 20 chars: ${user.passwordHash.substring(0, 20)}...`);
      } else {
        console.log(`  Password hash: ${user.passwordHash}`);
      }
    });

  } finally {
    await prisma.$disconnect();
  }
}

checkPasswordHashes();