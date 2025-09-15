const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setupRolesForTesting() {
  try {
    console.log('🚀 Setting up roles for performance plan workflow testing...');

    // Update John Smith to be a supervisor
    await prisma.users.update({
      where: { email: 'pm@saywhat.org' },
      data: {
        roles: ['PROJECT_MANAGER', 'supervisor'],
        position: 'Program Manager'
      }
    });
    console.log('✅ John Smith set as supervisor');

    // Update Sharon to be a reviewer  
    await prisma.users.update({
      where: { email: 'sharon@saywhat.org' },
      data: {
        roles: ['reviewer'],
        position: 'Senior Research Officer',
        supervisorId: 'cmfft5u150001vc8oi4i8b8e9' // John Smith as supervisor
      }
    });
    console.log('✅ Sharon Mazwi set as reviewer with John as supervisor');

    // Update Takesure to have John as supervisor
    await prisma.users.update({
      where: { email: 'takesure@saywhat.org' },
      data: {
        position: 'Research Officer',
        supervisorId: 'cmfft5u150001vc8oi4i8b8e9' // John Smith as supervisor
      }
    });
    console.log('✅ Takesure Marozva set with John as supervisor');

    // Update Jimmy to be HR
    await prisma.users.update({
      where: { email: 'jimmy@saywhat.org.zw' },
      data: {
        roles: ['hr'],
        position: 'HR Officer',
        department: 'Human Resources'
      }
    });
    console.log('✅ Jimmy Wilford set as HR');

    // Update Admin to have all roles for testing
    await prisma.users.update({
      where: { email: 'admin@saywhat.org' },
      data: {
        roles: ['hr', 'supervisor', 'reviewer', 'ADMIN', 'SUPER_USER']
      }
    });
    console.log('✅ Admin user updated with all roles');

    console.log('\n🎯 Role setup complete! Testing structure:');
    console.log('👑 Admin: All roles (hr, supervisor, reviewer)');
    console.log('👔 John Smith: Supervisor');
    console.log('🔍 Sharon Mazwi: Reviewer (reports to John)');
    console.log('👨‍💼 Takesure: Employee (reports to John)');
    console.log('🏢 Jimmy: HR Officer');

    // Verify the setup
    const updatedUsers = await prisma.users.findMany({
      select: {
        email: true,
        firstName: true,
        lastName: true,
        roles: true,
        supervisorId: true,
        position: true,
        department: true
      },
      orderBy: { firstName: 'asc' }
    });

    console.log('\n📊 Current user roles:');
    updatedUsers.forEach(user => {
      const supervisor = updatedUsers.find(u => u.id === user.supervisorId);
      console.log(`${user.firstName} ${user.lastName}: ${user.roles.join(', ')} ${supervisor ? `(reports to ${supervisor.firstName})` : ''}`);
    });

  } catch (error) {
    console.error('❌ Error setting up roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupRolesForTesting();
