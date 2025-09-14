const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUserEmployeeRelation() {
  try {
    console.log('🔍 Checking user-employee relationships...\n')

    // Get all users
    const allUsers = await prisma.users.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    })

    // Get all employees
    const allEmployees = await prisma.employees.findMany({
      select: {
        id: true,
        employeeId: true,
        email: true,
        firstName: true,
        lastName: true,
        userId: true
      }
    })

    console.log(`👥 Total Users: ${allUsers.length}`)
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.firstName || 'N/A'} ${user.lastName || 'N/A'} (${user.email}) - Role: ${user.role}`)
    })

    console.log(`\n👨‍💼 Total Employees: ${allEmployees.length}`)
    allEmployees.forEach((emp, index) => {
      console.log(`   ${index + 1}. ${emp.employeeId} - ${emp.firstName} ${emp.lastName} (${emp.email}) - UserID: ${emp.userId || 'NULL'}`)
    })

    // Check relationships
    const employeesWithUsers = allEmployees.filter(emp => emp.userId && allUsers.some(user => user.id === emp.userId))
    const employeesWithoutUsers = allEmployees.filter(emp => !emp.userId || !allUsers.some(user => user.id === emp.userId))
    const usersWithoutEmployees = allUsers.filter(user => !allEmployees.some(emp => emp.userId === user.id))

    console.log(`\n✅ Employees with valid user connections: ${employeesWithUsers.length}`)
    employeesWithUsers.forEach((emp, index) => {
      console.log(`   ${index + 1}. ${emp.employeeId} - ${emp.firstName} ${emp.lastName}`)
    })

    console.log(`\n❌ Employees without user connections: ${employeesWithoutUsers.length}`)
    employeesWithoutUsers.forEach((emp, index) => {
      console.log(`   ${index + 1}. ${emp.employeeId} - ${emp.firstName} ${emp.lastName} - UserID: ${emp.userId || 'NULL'}`)
    })

    console.log(`\n👤 Users without employee records: ${usersWithoutEmployees.length}`)
    usersWithoutEmployees.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.firstName || 'N/A'} ${user.lastName || 'N/A'} (${user.email}) - Role: ${user.role}`)
    })

    console.log('\n📊 Summary:')
    console.log(`   - Total Users: ${allUsers.length}`)
    console.log(`   - Total Employees: ${allEmployees.length}`)
    console.log(`   - Valid User-Employee connections: ${employeesWithUsers.length}`)
    console.log(`   - Employees without users: ${employeesWithoutUsers.length}`)
    console.log(`   - Users without employees: ${usersWithoutEmployees.length}`)

  } catch (error) {
    console.error('❌ Error checking relationships:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserEmployeeRelation()
