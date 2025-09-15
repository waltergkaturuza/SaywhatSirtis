// Get current valid employee IDs and details
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function getCurrentEmployees() {
  console.log('📋 CURRENT VALID EMPLOYEES')
  console.log('=' .repeat(50))
  
  try {
    const employees = await prisma.employees.findMany({
      select: {
        id: true,
        employeeId: true,
        firstName: true,
        lastName: true,
        email: true,
        position: true,
        status: true,
        departmentId: true
      },
      orderBy: {
        firstName: 'asc'
      }
    })
    
    console.log(`Found ${employees.length} employees:\n`)
    
    employees.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.firstName} ${emp.lastName}`)
      console.log(`   ID: ${emp.id}`)
      console.log(`   Employee ID: ${emp.employeeId}`)
      console.log(`   Email: ${emp.email}`)
      console.log(`   Position: ${emp.position}`)
      console.log(`   Status: ${emp.status}`)
      console.log(`   Department ID: ${emp.departmentId || 'None'}`)
      console.log('')
    })
    
    // Find the admin user specifically
    const adminEmployee = employees.find(emp => emp.email === 'admin@saywhat.org')
    if (adminEmployee) {
      console.log('🔍 ADMIN USER DETAILS:')
      console.log(`Correct ID to use: ${adminEmployee.id}`)
      console.log(`Employee ID: ${adminEmployee.employeeId}`)
      console.log(`Status: ${adminEmployee.status}`)
      console.log('')
      console.log('✅ Use this ID in frontend instead of: cmfft5t770000vc8o37ras3qa')
    }
    
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

getCurrentEmployees()
