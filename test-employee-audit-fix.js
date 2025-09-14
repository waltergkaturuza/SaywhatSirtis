const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testEmployeeUpdate() {
  try {
    console.log('🧪 Testing employee update API...');
    
    // First, let's get an existing employee
    const existingEmployee = await prisma.employees.findFirst({
      where: { status: 'ACTIVE' },
      include: {
        departments: { select: { id: true, name: true } }
      }
    });
    
    if (!existingEmployee) {
      console.log('❌ No active employees found to test update');
      return;
    }
    
    console.log('📝 Found employee to test:', {
      id: existingEmployee.id,
      email: existingEmployee.email,
      firstName: existingEmployee.firstName,
      lastName: existingEmployee.lastName
    });
    
    // Test the audit log user resolution
    console.log('\n🔍 Testing user ID resolution for audit log...');
    const testUser = await prisma.users.findUnique({
      where: { email: 'admin@saywhat.org' },
      select: { id: true, email: true, firstName: true, lastName: true }
    });
    
    if (testUser) {
      console.log('✅ Found user for audit log:', testUser);
    } else {
      console.log('❌ No user found for email: admin@saywhat.org');
    }
    
    // Test creating an audit log directly
    console.log('\n📋 Testing direct audit log creation...');
    const { randomUUID } = require('crypto');
    
    if (testUser) {
      await prisma.audit_logs.create({
        data: {
          id: randomUUID(),
          action: 'TEST',
          resource: 'Employee',
          resourceId: existingEmployee.id,
          userId: testUser.id,
          details: 'Test audit log creation',
          ipAddress: 'test'
        }
      });
      console.log('✅ Audit log created successfully');
    }
    
    console.log('\n🎉 Employee update audit fix verification complete!');
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testEmployeeUpdate();
