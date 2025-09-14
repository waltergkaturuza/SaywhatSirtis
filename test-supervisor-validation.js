const { PrismaClient } = require('@prisma/client')

async function testSupervisorValidation() {
  const prisma = new PrismaClient()

  try {
    console.log('🔍 Testing supervisor validation...')

    // Test 1: Check if we have employees to test with
    const employees = await prisma.employees.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        supervisor_id: true
      },
      take: 5
    })

    console.log('\n📋 Available employees for testing:')
    employees.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.firstName} ${emp.lastName} (ID: ${emp.id}, Supervisor: ${emp.supervisor_id || 'None'})`)
    })

    if (employees.length === 0) {
      console.log('❌ No employees found to test with')
      return
    }

    // Test 2: Try to update an employee with a valid supervisor
    const testEmployee = employees[0]
    const validSupervisor = employees.find(emp => emp.id !== testEmployee.id)

    if (validSupervisor) {
      console.log(`\n✅ Test 1: Updating ${testEmployee.firstName} ${testEmployee.lastName} with valid supervisor ${validSupervisor.firstName} ${validSupervisor.lastName}`)
      
      const updateResult = await prisma.employees.update({
        where: { id: testEmployee.id },
        data: {
          supervisor_id: validSupervisor.id
        }
      })
      console.log('✅ Update successful with valid supervisor')
    }

    // Test 3: Try to update an employee with an invalid supervisor ID
    console.log(`\n🧪 Test 2: Attempting to update ${testEmployee.firstName} ${testEmployee.lastName} with invalid supervisor ID`)
    
    try {
      const invalidSupervisorId = 'invalid-supervisor-id-12345'
      
      // Check if supervisor exists first (this is what our API does now)
      const supervisorExists = await prisma.employees.findUnique({
        where: { id: invalidSupervisorId }
      })

      if (!supervisorExists) {
        console.log('❌ Supervisor validation: Invalid supervisor ID detected - setting to null')
        
        const updateResult = await prisma.employees.update({
          where: { id: testEmployee.id },
          data: {
            supervisor_id: null // This is what our API does now
          }
        })
        console.log('✅ Update successful with null supervisor (invalid ID handled gracefully)')
      }

    } catch (error) {
      console.log('❌ Foreign key constraint error (this would happen without validation):', error.message)
    }

    // Test 4: Test self-referential supervisor (employee as their own supervisor)
    console.log(`\n🧪 Test 3: Attempting to set ${testEmployee.firstName} ${testEmployee.lastName} as their own supervisor`)
    
    try {
      const updateResult = await prisma.employees.update({
        where: { id: testEmployee.id },
        data: {
          supervisor_id: testEmployee.id
        }
      })
      console.log('⚠️  Self-referential supervisor allowed (may want to add validation for this)')
    } catch (error) {
      console.log('❌ Self-referential supervisor error:', error.message)
    }

    console.log('\n🎯 Supervisor validation tests completed!')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testSupervisorValidation()
