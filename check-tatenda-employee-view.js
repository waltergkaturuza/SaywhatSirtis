const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function refreshTatendaEmployeeView() {
  try {
    console.log('Fetching Tatenda\'s complete employee view data...\n')

    // Simulate the exact query that the employee view page makes
    const employee = await prisma.employees.findUnique({
      where: { 
        email: 'tatenda@saywhat.org'
      },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
          }
        },
        departments: {
          select: {
            id: true,
            name: true,
            code: true,
            parentId: true
          }
        },
        employees: { // supervisor
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true
          }
        },
        other_employees: { // subordinates
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true
          }
        }
      }
    })

    if (!employee) {
      console.log('❌ Employee not found')
      return
    }

    console.log('📋 COMPLETE EMPLOYEE VIEW DATA:')
    console.log('=====================================')
    console.log('Basic Info:')
    console.log('   ID:', employee.id)
    console.log('   Employee ID:', employee.employeeId)
    console.log('   Name:', employee.firstName, employee.lastName)
    console.log('   Email:', employee.email)
    console.log('   Position:', employee.position)
    console.log('   Department:', employee.department)
    console.log('   Status:', employee.status)
    console.log('   Phone:', employee.phoneNumber)
    console.log('   Personal Email:', employee.personalEmail)
    console.log('   Address:', employee.address)
    console.log()

    console.log('Employment Details:')
    console.log('   Employment Type:', employee.employmentType)
    console.log('   Start Date:', employee.startDate)
    console.log('   Hire Date:', employee.hireDate)
    console.log('   Salary:', employee.salary, employee.currency)
    console.log('   Is Supervisor:', employee.is_supervisor)
    console.log('   Is Reviewer:', employee.is_reviewer)
    console.log()

    console.log('Personal Info:')
    console.log('   Date of Birth:', employee.dateOfBirth)
    console.log('   Gender:', employee.gender)
    console.log('   Nationality:', employee.nationality)
    console.log('   National ID:', employee.nationalId)
    console.log('   Marital Status:', employee.marital_status)
    console.log('   Country:', employee.country)
    console.log('   Province:', employee.province)
    console.log()

    console.log('Contact Info:')
    console.log('   Emergency Contact:', employee.emergencyContact)
    console.log('   Emergency Phone:', employee.emergencyPhone)
    console.log('   Emergency Relationship:', employee.emergencyContactRelationship)
    console.log()

    console.log('Benefits:')
    console.log('   Medical Aid:', employee.medical_aid)
    console.log('   Funeral Cover:', employee.funeral_cover)
    console.log('   Vehicle Benefit:', employee.vehicle_benefit)
    console.log('   Health Insurance:', employee.health_insurance)
    console.log('   Dental Coverage:', employee.dental_coverage)
    console.log()

    console.log('Related User Account:')
    if (employee.users) {
      console.log('   User ID:', employee.users.id)
      console.log('   User Name:', employee.users.firstName, employee.users.lastName)
      console.log('   User Email:', employee.users.email)
      console.log('   User Role:', employee.users.role)
      console.log('   User Active:', employee.users.isActive)
      console.log('   User Updated:', employee.users.updatedAt)
    } else {
      console.log('   ❌ No linked user account found')
    }
    console.log()

    console.log('Department Info:')
    if (employee.departments) {
      console.log('   Dept ID:', employee.departments.id)
      console.log('   Dept Name:', employee.departments.name)
      console.log('   Dept Code:', employee.departments.code)
    } else {
      console.log('   ❌ No department linked')
    }
    console.log()

    console.log('Timestamps:')
    console.log('   Created:', employee.createdAt)
    console.log('   Updated:', employee.updatedAt)
    console.log()

    // Also check what the HR employees API would return
    console.log('🔄 TESTING API RESPONSE FORMAT:')
    console.log('=====================================')
    
    const apiFormattedData = {
      id: employee.id,
      employeeId: employee.employeeId,
      name: `${employee.firstName} ${employee.lastName}`,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      position: employee.position,
      department: employee.department,
      status: employee.status,
      phoneNumber: employee.phoneNumber,
      hireDate: employee.hireDate?.toISOString(),
      isActive: employee.status === 'ACTIVE',
      updatedAt: employee.updatedAt?.toISOString()
    }

    console.log('API Formatted Data:')
    console.log(JSON.stringify(apiFormattedData, null, 2))

  } catch (error) {
    console.error('Error fetching employee view data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

refreshTatendaEmployeeView()