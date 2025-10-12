const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyEmployeeRoles() {
  try {
    console.log('🔍 Verifying current employee role assignments...\n');

    // Get a few sample employees to check current state
    const employees = await prisma.employees.findMany({
      where: {
        employeeId: { in: ['EMP0006', 'EMP8132875O', 'EMP0009'] } // Belinda, System Admin, Dorcas
      },
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

    for (const employee of employees) {
      console.log(`👤 ${employee.firstName} ${employee.lastName} (${employee.employeeId}):`);
      console.log(`   User Role: ${employee.users?.role || 'NO USER ACCOUNT'}`);
      console.log(`   Employee user_role: ${employee.user_role}`);
      console.log(`   Access Level: ${employee.access_level}`);
      console.log(`   Document Security: ${employee.document_security_clearance}`);
      console.log(`   Expected Access: ${employee.users?.role === 'SYSTEM_ADMINISTRATOR' ? 'FULL' : employee.users?.role === 'SUPERUSER' ? 'FULL' : 'OTHER'}`);
      console.log();
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyEmployeeRoles();