// Test employee data and database connection
const { PrismaClient } = require('@prisma/client')

async function testEmployeeData() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 Testing Employee Database Connection...')
    console.log('=' .repeat(50))
    
    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Check employee count
    const employeeCount = await prisma.employees.count()
    console.log(`📊 Total employees in database: ${employeeCount}`)
    
    // Check active employees
    const activeEmployees = await prisma.employees.count({
      where: { status: 'ACTIVE' }
    })
    console.log(`👥 Active employees: ${activeEmployees}`)
    
    // Get all employees with basic info
    const employees = await prisma.employees.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        employeeId: true,
        firstName: true,
        lastName: true,
        email: true,
        position: true,
        department: true,
        status: true,
        createdAt: true
      },
      orderBy: { firstName: 'asc' }
    })
    
    console.log('\n📋 Employee Data:')
    console.log('-' .repeat(50))
    
    if (employees.length === 0) {
      console.log('❌ No employees found in database')
      
      // Check if there are any employees at all (including inactive)
      const allEmployees = await prisma.employees.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          status: true
        }
      })
      
      console.log(`\n🔍 Total employees (all statuses): ${allEmployees.length}`)
      
      if (allEmployees.length > 0) {
        console.log('\n📄 All employees (including inactive):')
        allEmployees.forEach((emp, index) => {
          console.log(`${index + 1}. ${emp.firstName} ${emp.lastName} (${emp.email}) - Status: ${emp.status}`)
        })
      }
    } else {
      employees.forEach((emp, index) => {
        console.log(`${index + 1}. ${emp.employeeId} - ${emp.firstName} ${emp.lastName}`)
        console.log(`   Email: ${emp.email}`)
        console.log(`   Position: ${emp.position || 'N/A'}`)
        console.log(`   Department: ${emp.department || 'N/A'}`)
        console.log(`   Status: ${emp.status}`)
        console.log(`   Created: ${emp.createdAt}`)
        console.log('')
      })
    }
    
    // Check for users table as well
    try {
      const userCount = await prisma.users.count()
      console.log(`👤 Users in system: ${userCount}`)
      
      const users = await prisma.users.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          isActive: true
        }
      })
      
      console.log('\n👥 User Data:')
      console.log('-' .repeat(30))
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - Active: ${user.isActive}`)
      })
      
    } catch (userError) {
      console.log('⚠️ Could not fetch users:', userError.message)
    }
    
  } catch (error) {
    console.error('❌ Database Error:', error)
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      meta: error.meta
    })
  } finally {
    await prisma.$disconnect()
  }
}

testEmployeeData()
