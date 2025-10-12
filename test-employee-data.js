const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testEmployeeData() {
  try {
    console.log('🔍 Testing employee role and access level display...\n');

    // Get the System Administrator employee to test
    const employee = await prisma.employees.findFirst({
      where: { employeeId: 'EMP8132875O' },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            isActive: true
          }
        }
      }
    });

    if (!employee) {
      console.log('❌ System Administrator employee not found');
      return;
    }

    console.log('👤 Employee Data Test Results:');
    console.log('================================');
    console.log('Employee ID:', employee.employeeId);
    console.log('Name:', employee.firstName, employee.lastName);
    console.log('Position:', employee.position);
    console.log();
    
    console.log('🔐 Access & Security Fields:');
    console.log('User Role (from employee):', employee.user_role);
    console.log('User Role (from linked user):', employee.users?.role);
    console.log('Access Level:', employee.access_level);
    console.log('Document Security Clearance:', employee.document_security_clearance);
    console.log('System Access:', employee.system_access);
    console.log();

    console.log('✅ Expected vs Actual:');
    console.log('Expected User Role: SYSTEM_ADMINISTRATOR');
    console.log('Actual User Role (employee):', employee.user_role);
    console.log('Actual User Role (user):', employee.users?.role);
    console.log();
    console.log('Expected Access Level: FULL');
    console.log('Actual Access Level:', employee.access_level);
    console.log();
    console.log('Expected Doc Security: TOP_SECRET');
    console.log('Actual Doc Security:', employee.document_security_clearance);
    console.log();

    // Check if data matches expectations
    const roleMatches = employee.user_role === 'SYSTEM_ADMINISTRATOR' && employee.users?.role === 'SYSTEM_ADMINISTRATOR';
    const accessMatches = employee.access_level === 'FULL';
    const securityMatches = employee.document_security_clearance === 'TOP_SECRET';

    console.log('🎯 Validation Results:');
    console.log('Role Sync:', roleMatches ? '✅ Correct' : '❌ Mismatch');
    console.log('Access Level:', accessMatches ? '✅ Correct' : '❌ Mismatch');
    console.log('Security Clearance:', securityMatches ? '✅ Correct' : '❌ Mismatch');

    if (roleMatches && accessMatches && securityMatches) {
      console.log('\n🎉 All employee data is correctly synchronized!');
    } else {
      console.log('\n⚠️ Some data needs correction.');
    }

  } catch (error) {
    console.error('❌ Error testing employee data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testEmployeeData();