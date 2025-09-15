const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('🔍 Checking current database state...\n');
    
    // Check departments
    console.log('📋 DEPARTMENTS TABLE:');
    const departments = await prisma.departments.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        status: true,
        _count: {
          select: {
            employees: true
          }
        }
      }
    });
    
    if (departments.length === 0) {
      console.log('   ❌ No departments found in departments table');
    } else {
      console.log(`   ✅ Found ${departments.length} departments:`);
      departments.forEach(dept => {
        console.log(`      - ${dept.name} (${dept.code}) - ${dept._count.employees} employees - Status: ${dept.status}`);
      });
    }
    
    // Check users department field
    console.log('\n👥 USERS DEPARTMENTS:');
    const userDepartments = await prisma.users.groupBy({
      by: ['department'],
      _count: {
        department: true
      },
      where: {
        department: {
          not: null
        }
      }
    });
    
    if (userDepartments.length === 0) {
      console.log('   ❌ No departments found in users table');
    } else {
      console.log(`   Found departments in users table:`);
      userDepartments.forEach(dept => {
        console.log(`      - ${dept.department}: ${dept._count.department} users`);
      });
    }
    
    // Check employees table departments
    console.log('\n🏢 EMPLOYEES DEPARTMENTS:');
    const employeeDepartments = await prisma.employees.groupBy({
      by: ['department'],
      _count: {
        department: true
      },
      where: {
        department: {
          not: null
        }
      }
    });
    
    if (employeeDepartments.length === 0) {
      console.log('   ❌ No departments found in employees table');
    } else {
      console.log(`   Found departments in employees table:`);
      employeeDepartments.forEach(dept => {
        console.log(`      - ${dept.department}: ${dept._count.department} employees`);
      });
    }
    
    // Check roles
    console.log('\n🎭 USER ROLES:');
    const userRoles = await prisma.users.groupBy({
      by: ['role'],
      _count: {
        role: true
      }
    });
    
    console.log('   Current roles in use:');
    userRoles.forEach(role => {
      console.log(`      - ${role.role}: ${role._count.role} users`);
    });
    
    // Check custom roles array
    console.log('\n📋 CUSTOM ROLES ARRAY:');
    const usersWithCustomRoles = await prisma.users.findMany({
      where: {
        roles: {
          isEmpty: false
        }
      },
      select: {
        email: true,
        roles: true
      }
    });
    
    if (usersWithCustomRoles.length === 0) {
      console.log('   ❌ No users with custom roles array');
    } else {
      console.log('   Users with custom roles:');
      usersWithCustomRoles.forEach(user => {
        console.log(`      - ${user.email}: [${user.roles.join(', ')}]`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
