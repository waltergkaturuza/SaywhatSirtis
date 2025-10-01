const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function checkAdminPassword() {
  try {
    console.log('=== CHECKING ADMIN USER PASSWORD ===');
    
    const adminUser = await prisma.users.findUnique({
      where: { email: 'admin@saywhat.org' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        passwordHash: true,
        role: true,
        department: true,
        isActive: true,
        createdAt: true,
        lastLogin: true
      }
    });

    if (!adminUser) {
      console.log('❌ Admin user not found in database');
      return;
    }

    console.log('✅ Admin user found:');
    console.log('Name:', adminUser.firstName, adminUser.lastName);
    console.log('Email:', adminUser.email);
    console.log('Role:', adminUser.role);
    console.log('Department:', adminUser.department);
    console.log('Active:', adminUser.isActive);
    console.log('Created:', adminUser.createdAt);
    console.log('Last Login:', adminUser.lastLogin || 'NEVER');
    console.log('');

    // Check password hash
    console.log('=== PASSWORD HASH ANALYSIS ===');
    if (!adminUser.passwordHash) {
      console.log('❌ NO PASSWORD HASH SET!');
      console.log('💡 This explains why database authentication fails');
      console.log('');
      
      // Set a password hash for admin123 to match development user
      console.log('🔧 Setting password hash for "admin123"...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const result = await prisma.users.update({
        where: { id: adminUser.id },
        data: { passwordHash: hashedPassword }
      });
      
      console.log('✅ Password hash set successfully');
      console.log('Hash length:', hashedPassword.length);
      console.log('');
      
      // Test the hash
      const testMatch = await bcrypt.compare('admin123', hashedPassword);
      console.log('✅ Password verification test:', testMatch);
      
    } else {
      console.log('✅ Password hash exists');
      console.log('Hash length:', adminUser.passwordHash.length);
      console.log('Hash preview:', adminUser.passwordHash.substring(0, 20) + '...');
      console.log('');
      
      // Test common passwords
      const testPasswords = ['admin123', 'admin', 'password', 'Admin123'];
      console.log('🔍 Testing common passwords:');
      
      for (const testPass of testPasswords) {
        try {
          const match = await bcrypt.compare(testPass, adminUser.passwordHash);
          console.log(`"${testPass}": ${match ? '✅ MATCH' : '❌ No match'}`);
        } catch (error) {
          console.log(`"${testPass}": ❌ Error - ${error.message}`);
        }
      }
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

checkAdminPassword();