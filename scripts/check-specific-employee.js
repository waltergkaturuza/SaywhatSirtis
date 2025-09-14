const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkSpecificEmployee() {
  try {
    console.log('🔍 Checking specific employee: emp-1757841783672\n')

    const employee = await prisma.employees.findUnique({
      where: { id: 'emp-1757841783672' }
    })

    if (employee) {
      console.log('✅ Employee found!')
      console.log(`   ID: ${employee.id}`)
      console.log(`   Employee ID: ${employee.employeeId}`)
      console.log(`   Name: ${employee.firstName} ${employee.lastName}`)
      console.log(`   Email: ${employee.email}`)
      console.log(`   Status: ${employee.status}`)
    } else {
      console.log('❌ Employee NOT found with ID: emp-1757841783672')
    }

  } catch (error) {
    console.error('❌ Error checking employee:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSpecificEmployee()
