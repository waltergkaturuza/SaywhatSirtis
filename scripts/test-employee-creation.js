const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testEmployeeCreation() {
  try {
    console.log('🧪 Testing employee creation with user relationship...\n')

    // Get the first user to test with
    const firstUser = await prisma.users.findFirst({
      where: { role: 'USER' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    })

    if (!firstUser) {
      console.log('❌ No users found to test with')
      return
    }

    console.log(`👤 Selected user: ${firstUser.firstName} ${firstUser.lastName} (${firstUser.email})`)

    // Check if employee already exists for this user
    const existingEmployee = await prisma.employees.findUnique({
      where: { userId: firstUser.id }
    })

    if (existingEmployee) {
      console.log('⚠️  Employee already exists for this user')
      return
    }

    // Generate employee ID
    const lastEmployee = await prisma.employees.findFirst({
      orderBy: { employeeId: 'desc' },
      select: { employeeId: true }
    })

    const nextNumber = lastEmployee 
      ? parseInt(lastEmployee.employeeId.replace('EMP', '')) + 1 
      : 1001

    const employeeId = `EMP${nextNumber.toString().padStart(4, '0')}`

    // Check if department exists
    let department = await prisma.departments.findFirst({
      where: { name: 'General' }
    })

    if (!department) {
      console.log('📁 Creating default department...')
      department = await prisma.departments.create({
        data: {
          id: `dept-${Date.now()}`,
          name: 'General',
          code: 'GEN',
          description: 'General department for all employees',
          level: 1,
          status: 'ACTIVE',
          updatedAt: new Date()
        }
      })
    }

    // Create employee
    console.log('👨‍💼 Creating employee record...')
    const newEmployee = await prisma.employees.create({
      data: {
        id: `emp-${Date.now()}`,
        userId: firstUser.id,
        employeeId: employeeId,
        firstName: firstUser.firstName || 'Test',
        lastName: firstUser.lastName || 'Employee',
        email: firstUser.email,
        position: 'Software Developer',
        startDate: new Date(),
        departmentId: department.id,
        status: 'ACTIVE',
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            role: true
          }
        },
        departments: {
          select: {
            name: true,
            code: true
          }
        }
      }
    })

    console.log('✅ Employee created successfully!')
    console.log(`   Employee ID: ${newEmployee.employeeId}`)
    console.log(`   Name: ${newEmployee.firstName} ${newEmployee.lastName}`)
    console.log(`   Email: ${newEmployee.email}`)
    console.log(`   Position: ${newEmployee.position}`)
    console.log(`   Department: ${newEmployee.departments?.name}`)
    console.log(`   Linked User: ${newEmployee.user.firstName} ${newEmployee.user.lastName} (${newEmployee.user.role})`)

    console.log('\n🔗 Testing relationship query...')
    const userWithEmployee = await prisma.users.findUnique({
      where: { id: firstUser.id },
      include: {
        employee: {
          select: {
            employeeId: true,
            position: true,
            departments: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    if (userWithEmployee?.employee) {
      console.log('✅ User-Employee relationship working!')
      console.log(`   User ${userWithEmployee.firstName} has employee record: ${userWithEmployee.employee.employeeId}`)
    } else {
      console.log('❌ User-Employee relationship not working')
    }

  } catch (error) {
    console.error('❌ Error testing employee creation:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testEmployeeCreation()
