const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function checkTatendaData() {
  try {
    console.log('Checking Tatenda\'s data consistency...\n')

    // Find user record
    const user = await prisma.users.findUnique({
      where: { email: 'tatenda@saywhat.org' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true
      }
    })

    if (!user) {
      console.log('❌ User not found with email: tatenda@saywhat.org')
      return
    }

    console.log('👤 USER RECORD:')
    console.log('   ID:', user.id)
    console.log('   Name:', user.firstName, user.lastName)
    console.log('   Email:', user.email)
    console.log('   Role:', user.role)
    console.log('   Active:', user.isActive)
    console.log('   Updated:', user.updatedAt)
    console.log()

    // Find employee record
    const employee = await prisma.employees.findUnique({
      where: { userId: user.id },
      select: {
        id: true,
        employeeId: true,
        firstName: true,
        lastName: true,
        email: true,
        position: true,
        department: true,
        status: true,
        updatedAt: true,
        userId: true
      }
    })

    if (!employee) {
      console.log('❌ Employee record not found for user ID:', user.id)
      return
    }

    console.log('👷 EMPLOYEE RECORD:')
    console.log('   ID:', employee.id)
    console.log('   Employee ID:', employee.employeeId)
    console.log('   Name:', employee.firstName, employee.lastName)
    console.log('   Email:', employee.email)
    console.log('   Position:', employee.position)
    console.log('   Department:', employee.department)
    console.log('   Status:', employee.status)
    console.log('   Updated:', employee.updatedAt)
    console.log('   User ID:', employee.userId)
    console.log()

    // Check for inconsistencies
    console.log('🔍 DATA CONSISTENCY CHECK:')
    
    const issues = []
    
    if (user.firstName !== employee.firstName) {
      issues.push(`❌ First Name mismatch: User="${user.firstName}" vs Employee="${employee.firstName}"`)
    }
    
    if (user.lastName !== employee.lastName) {
      issues.push(`❌ Last Name mismatch: User="${user.lastName}" vs Employee="${employee.lastName}"`)
    }
    
    if (user.email !== employee.email) {
      issues.push(`❌ Email mismatch: User="${user.email}" vs Employee="${employee.email}"`)
    }

    if (issues.length === 0) {
      console.log('✅ No data inconsistencies found')
    } else {
      console.log('Found inconsistencies:')
      issues.forEach(issue => console.log('   ', issue))
      
      console.log('\n🔧 PROPOSING SYNC SOLUTION:')
      console.log('   Would sync Employee data with User data:')
      console.log(`   Employee.firstName: "${employee.firstName}" → "${user.firstName}"`)
      console.log(`   Employee.lastName: "${employee.lastName}" → "${user.lastName}"`)
      console.log(`   Employee.email: "${employee.email}" → "${user.email}"`)
    }

  } catch (error) {
    console.error('Error checking Tatenda data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkTatendaData()