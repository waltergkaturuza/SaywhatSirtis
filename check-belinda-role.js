const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function checkBelindaRole() {
  try {
    console.log('Checking Belinda\'s role and access level...\n')

    // Find Belinda's employee record
    const employee = await prisma.employees.findFirst({
      where: { 
        OR: [
          { firstName: { contains: 'Belinda', mode: 'insensitive' } },
          { email: { contains: 'belinda', mode: 'insensitive' } }
        ]
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
    })

    if (!employee) {
      console.log('❌ Belinda not found')
      return
    }

    console.log('👤 BELINDA\'S EMPLOYEE RECORD:')
    console.log('   Employee ID:', employee.employeeId)
    console.log('   Name:', employee.firstName, employee.lastName)
    console.log('   Email:', employee.email)
    console.log('   Position:', employee.position)
    console.log('   Department:', employee.department)
    console.log('   User Role:', employee.user_role)
    console.log('   Access Level:', employee.access_level)
    console.log('   Document Security Clearance:', employee.document_security_clearance)
    console.log()

    if (employee.users) {
      console.log('👥 RELATED USER ACCOUNT:')
      console.log('   User ID:', employee.users.id)
      console.log('   User Name:', employee.users.firstName, employee.users.lastName)
      console.log('   User Email:', employee.users.email)
      console.log('   User Role:', employee.users.role)
      console.log()
    }

    // Analyze what the access level should be based on role
    console.log('🔍 ACCESS LEVEL ANALYSIS:')
    const userRole = employee.user_role || employee.users?.role
    
    if (!userRole) {
      console.log('❌ No role found')
      return
    }

    console.log('   Current Role:', userRole)
    
    // Define expected access levels based on role definitions
    const expectedAccessLevels = {
      'BASIC_USER_1': 'BASIC',
      'BASIC_USER_2': 'BASIC',
      'ADVANCE_USER_1': 'ADVANCED',
      'ADVANCE_USER_2': 'ADVANCED', 
      'HR': 'ADVANCED',
      'SUPERUSER': 'FULL',
      'SYSTEM_ADMINISTRATOR': 'FULL'
    }

    const expectedLevel = expectedAccessLevels[userRole] || 'BASIC'
    const currentLevel = employee.access_level

    console.log('   Expected Access Level:', expectedLevel)
    console.log('   Current Access Level:', currentLevel)
    
    if (currentLevel !== expectedLevel) {
      console.log('   ❌ MISMATCH DETECTED!')
      console.log('   🔧 SHOULD UPDATE:', employee.employeeId, 'from', currentLevel, 'to', expectedLevel)
      
      // Show what would be updated
      console.log('\n🛠️  PROPOSED UPDATE:')
      console.log('   UPDATE employees SET access_level = \'' + expectedLevel + '\' WHERE id = \'' + employee.id + '\';')
    } else {
      console.log('   ✅ Access level is correct')
    }

  } catch (error) {
    console.error('Error checking Belinda role:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkBelindaRole()