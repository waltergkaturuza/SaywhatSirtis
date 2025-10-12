const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Role to access level mapping
const ROLE_ACCESS_MAPPING = {
  'BASIC_USER_1': { accessLevel: 'BASIC', documentLevel: 'CONFIDENTIAL' },
  'BASIC_USER_2': { accessLevel: 'BASIC', documentLevel: 'CONFIDENTIAL' },
  'ADVANCE_USER_1': { accessLevel: 'ADVANCED', documentLevel: 'SECRET' },
  'ADVANCE_USER_2': { accessLevel: 'ADVANCED', documentLevel: 'SECRET' },
  'HR': { accessLevel: 'FULL', documentLevel: 'TOP_SECRET' },
  'SUPERUSER': { accessLevel: 'FULL', documentLevel: 'TOP_SECRET' },
  'SYSTEM_ADMINISTRATOR': { accessLevel: 'FULL', documentLevel: 'TOP_SECRET' }
};

async function updateAllEmployeeRoles() {
  try {
    console.log('🔄 Starting employee role synchronization...\n');

    // Get all employees with their linked user accounts
    const employees = await prisma.employees.findMany({
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
      },
      orderBy: { employeeId: 'asc' }
    });

    console.log(`📊 Found ${employees.length} employees to process\n`);

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const employee of employees) {
      try {
        if (!employee.users) {
          console.log(`⚠️  Skipping ${employee.firstName} ${employee.lastName} (${employee.employeeId}) - No linked user account`);
          skippedCount++;
          continue;
        }

        const userRole = employee.users.role;
        const currentEmployeeRole = employee.user_role;
        const currentAccessLevel = employee.access_level;
        const currentDocLevel = employee.document_security_clearance;

        // Get expected values based on user role
        const roleConfig = ROLE_ACCESS_MAPPING[userRole] || { accessLevel: 'BASIC', documentLevel: 'PUBLIC' };
        const expectedAccessLevel = roleConfig.accessLevel;
        const expectedDocLevel = roleConfig.documentLevel;

        // Check if update is needed
        const needsUpdate = 
          currentEmployeeRole !== userRole ||
          currentAccessLevel !== expectedAccessLevel ||
          currentDocLevel !== expectedDocLevel;

        if (!needsUpdate) {
          console.log(`✅ ${employee.firstName} ${employee.lastName} (${employee.employeeId}) - Already correct`);
          successCount++;
          continue;
        }

        // Update the employee record
        await prisma.employees.update({
          where: { id: employee.id },
          data: {
            user_role: userRole,
            access_level: expectedAccessLevel,
            document_security_clearance: expectedDocLevel,
            updatedAt: new Date()
          }
        });

        console.log(`🔧 Updated ${employee.firstName} ${employee.lastName} (${employee.employeeId}):`);
        console.log(`   User Role: ${currentEmployeeRole} → ${userRole}`);
        console.log(`   Access Level: ${currentAccessLevel} → ${expectedAccessLevel}`);
        console.log(`   Doc Security: ${currentDocLevel} → ${expectedDocLevel}`);
        console.log();

        successCount++;

      } catch (error) {
        console.error(`❌ Error updating ${employee.firstName} ${employee.lastName} (${employee.employeeId}):`, error.message);
        errorCount++;
      }
    }

    console.log('\n📋 SUMMARY:');
    console.log(`✅ Successfully updated: ${successCount}`);
    console.log(`⚠️  Skipped (no user account): ${skippedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📊 Total processed: ${employees.length}`);

    if (successCount > 0) {
      console.log('\n🎉 Employee role synchronization completed successfully!');
      console.log('\n💡 Next steps:');
      console.log('1. Test the employee view page to verify roles are displayed correctly');
      console.log('2. Check that access levels show proper document security clearance');
      console.log('3. Verify that new employee creation uses the updated logic');
    }

  } catch (error) {
    console.error('❌ Fatal error during employee role synchronization:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
console.log('🚀 EMPLOYEE ROLE SYNCHRONIZATION TOOL');
console.log('=====================================');
console.log('This script will update all employee records to match their user account roles.\n');

updateAllEmployeeRoles();