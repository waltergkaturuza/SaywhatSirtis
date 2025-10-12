const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const ROLE_DEFINITIONS = {
  BASIC_USER_1: { accessLevel: 'BASIC' },
  BASIC_USER_2: { accessLevel: 'BASIC' },
  ADVANCE_USER_1: { accessLevel: 'ADVANCED' },
  ADVANCE_USER_2: { accessLevel: 'ADVANCED' },
  HR: { accessLevel: 'FULL' },
  SUPERUSER: { accessLevel: 'FULL' },
  SYSTEM_ADMINISTRATOR: { accessLevel: 'FULL' }
};

async function checkAllEmployeeRoles() {
  try {
    console.log('🔍 Checking all employees for role-access level mismatches...\n');

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

    console.log(`📊 Found ${employees.length} employees to analyze\n`);

    let mismatches = [];
    let correctRecords = 0;

    for (const employee of employees) {
      const userRole = employee.users?.role || 'UNKNOWN';
      const employeeRole = employee.user_role || 'UNKNOWN';
      const currentAccessLevel = employee.access_level || 'UNKNOWN';
      
      const expectedAccessLevel = ROLE_DEFINITIONS[userRole]?.accessLevel || 'BASIC';
      
      const isRoleMismatch = userRole !== employeeRole;
      const isAccessLevelMismatch = currentAccessLevel !== expectedAccessLevel;
      
      if (isRoleMismatch || isAccessLevelMismatch) {
        mismatches.push({
          employeeId: employee.employeeId,
          name: `${employee.firstName} ${employee.lastName}`,
          email: employee.email,
          userRole,
          employeeRole,
          currentAccessLevel,
          expectedAccessLevel,
          isRoleMismatch,
          isAccessLevelMismatch
        });
      } else {
        correctRecords++;
      }
    }

    console.log(`✅ Correct records: ${correctRecords}`);
    console.log(`❌ Mismatched records: ${mismatches.length}\n`);

    if (mismatches.length > 0) {
      console.log('🚨 FOUND MISMATCHES:\n');
      console.log('Employee ID | Name | User Role | Employee Role | Current Access | Expected Access | Issues');
      console.log('------------|------|-----------|---------------|----------------|-----------------|-------');
      
      mismatches.forEach(mismatch => {
        const issues = [];
        if (mismatch.isRoleMismatch) issues.push('Role Mismatch');
        if (mismatch.isAccessLevelMismatch) issues.push('Access Level Wrong');
        
        console.log(`${mismatch.employeeId.padEnd(11)} | ${mismatch.name.padEnd(20)} | ${mismatch.userRole.padEnd(9)} | ${mismatch.employeeRole.padEnd(13)} | ${mismatch.currentAccessLevel.padEnd(14)} | ${mismatch.expectedAccessLevel.padEnd(15)} | ${issues.join(', ')}`);
      });

      console.log('\n🔧 GENERATED UPDATE QUERIES:\n');
      
      mismatches.forEach(mismatch => {
        if (mismatch.isRoleMismatch || mismatch.isAccessLevelMismatch) {
          console.log(`-- Fix ${mismatch.name} (${mismatch.employeeId})`);
          console.log(`UPDATE employees SET`);
          
          const updates = [];
          if (mismatch.isRoleMismatch) {
            updates.push(`user_role = '${mismatch.userRole}'`);
          }
          if (mismatch.isAccessLevelMismatch) {
            updates.push(`access_level = '${mismatch.expectedAccessLevel}'`);
          }
          
          console.log(`  ${updates.join(',\n  ')}`);
          console.log(`WHERE employeeId = '${mismatch.employeeId}';\n`);
        }
      });
    } else {
      console.log('🎉 All employee roles and access levels are correctly synchronized!');
    }

  } catch (error) {
    console.error('❌ Error checking employee roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllEmployeeRoles();