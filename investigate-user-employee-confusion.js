// Investigate Users vs Employees table confusion
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: ['query', 'error', 'info', 'warn'],
})

async function investigateUserEmployeeConfusion() {
  console.log('🔍 USERS vs EMPLOYEES TABLE ANALYSIS')
  console.log('=' .repeat(60))
  
  try {
    // Test 1: Check admin@saywhat.org in Users table
    console.log('\n📊 Test 1: Admin in Users Table')
    const adminUser = await prisma.users.findUnique({
      where: { email: 'admin@saywhat.org' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        department: true,
        position: true,
        isActive: true,
        roles: true
      }
    })
    
    if (adminUser) {
      console.log('✅ Found admin in USERS table:')
      console.log(`   User ID: ${adminUser.id}`)
      console.log(`   Name: ${adminUser.firstName} ${adminUser.lastName}`)
      console.log(`   Email: ${adminUser.email}`)
      console.log(`   Department: ${adminUser.department}`)
      console.log(`   Position: ${adminUser.position}`)
      console.log(`   Roles: ${adminUser.roles?.join(', ') || 'None'}`)
      console.log(`   Active: ${adminUser.isActive}`)
    } else {
      console.log('❌ Admin NOT found in users table')
    }

    // Test 2: Check admin@saywhat.org in Employees table
    console.log('\n📊 Test 2: Admin in Employees Table')
    const adminEmployee = await prisma.employees.findFirst({
      where: { email: 'admin@saywhat.org' },
      select: {
        id: true,
        userId: true,
        employeeId: true,
        email: true,
        firstName: true,
        lastName: true,
        department: true,
        departmentId: true,
        position: true,
        status: true
      }
    })
    
    if (adminEmployee) {
      console.log('✅ Found admin in EMPLOYEES table:')
      console.log(`   Employee ID: ${adminEmployee.id}`)
      console.log(`   Employee Number: ${adminEmployee.employeeId}`)
      console.log(`   User ID Link: ${adminEmployee.userId || 'Not linked'}`)
      console.log(`   Name: ${adminEmployee.firstName} ${adminEmployee.lastName}`)
      console.log(`   Email: ${adminEmployee.email}`)
      console.log(`   Department: ${adminEmployee.department}`)
      console.log(`   Department ID: ${adminEmployee.departmentId}`)
      console.log(`   Position: ${adminEmployee.position}`)
      console.log(`   Status: ${adminEmployee.status}`)
    } else {
      console.log('❌ Admin NOT found in employees table')
    }

    // Test 3: Check relationship between users and employees
    console.log('\n📊 Test 3: User-Employee Relationship Analysis')
    
    if (adminUser && adminEmployee) {
      console.log('🔗 RELATIONSHIP CHECK:')
      console.log(`   User ID: ${adminUser.id}`)
      console.log(`   Employee.userId: ${adminEmployee.userId}`)
      
      if (adminEmployee.userId === adminUser.id) {
        console.log('✅ Properly linked: Employee.userId matches User.id')
      } else {
        console.log('❌ NOT LINKED: Employee.userId does not match User.id')
        console.log('💡 This explains the confusion!')
      }
    }

    // Test 4: Count total records
    console.log('\n📊 Test 4: Table Counts')
    const userCount = await prisma.users.count()
    const employeeCount = await prisma.employees.count()
    
    console.log(`   Users table: ${userCount} records`)
    console.log(`   Employees table: ${employeeCount} records`)

    // Test 5: Find all users without employee records
    console.log('\n📊 Test 5: Users Without Employee Records')
    const usersWithoutEmployees = await prisma.users.findMany({
      where: {
        employees: {
          none: {}
        }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        position: true
      }
    })
    
    console.log(`   Found ${usersWithoutEmployees.length} users without employee records:`)
    usersWithoutEmployees.forEach(user => {
      console.log(`   - ${user.firstName} ${user.lastName} (${user.email})`)
    })

    // Test 6: Find all employees without user records
    console.log('\n📊 Test 6: Employees Without User Records')
    const employeesWithoutUsers = await prisma.employees.findMany({
      where: {
        OR: [
          { userId: null },
          { user: null }
        ]
      },
      select: {
        id: true,
        employeeId: true,
        email: true,
        firstName: true,
        lastName: true
      }
    })
    
    console.log(`   Found ${employeesWithoutUsers.length} employees without user records:`)
    employeesWithoutUsers.forEach(emp => {
      console.log(`   - ${emp.firstName} ${emp.lastName} (${emp.email}) - Employee ID: ${emp.employeeId}`)
    })

    console.log('\n🎯 DIAGNOSIS:')
    console.log('This explains the 404 errors! The system has:')
    console.log('1. USERS table - for authentication and permissions')
    console.log('2. EMPLOYEES table - for HR management') 
    console.log('3. Missing/broken relationships between them')
    console.log('')
    console.log('💡 SOLUTION NEEDED:')
    console.log('- Link existing users to employee records')
    console.log('- OR consolidate into single table')
    console.log('- OR create proper user-employee relationships')

  } catch (error) {
    console.error('❌ Analysis failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

investigateUserEmployeeConfusion()
