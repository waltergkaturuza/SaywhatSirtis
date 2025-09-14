// Migrate users to employees table
const { PrismaClient } = require('@prisma/client')

async function migrateUsersToEmployees() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔄 Starting User to Employee Migration...')
    console.log('=' .repeat(50))
    
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Get all active users who don't have employee records
    const users = await prisma.users.findMany({
      where: {
        isActive: true,
        employee: null // Users without employee records
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isActive: true
      }
    })
    
    console.log(`📊 Found ${users.length} users without employee records`)
    
    if (users.length === 0) {
      console.log('✅ All active users already have employee records')
      
      // Show existing employees
      const existingEmployees = await prisma.employees.findMany({
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      })
      
      console.log(`\n📋 Existing Employee Records: ${existingEmployees.length}`)
      existingEmployees.forEach((emp, index) => {
        console.log(`${index + 1}. ${emp.employeeId} - ${emp.firstName} ${emp.lastName} (${emp.email})`)
      })
      
      return
    }
    
    console.log('\n🔄 Creating employee records for users...')
    console.log('-' .repeat(40))
    
    const createdEmployees = []
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i]
      const employeeId = `EMP${String(Date.now() + i).slice(-6)}` // Generate unique employee ID
      
      try {
        const employee = await prisma.employees.create({
          data: {
            id: `emp-${Date.now()}-${i}`,
            userId: user.id,
            employeeId: employeeId,
            firstName: user.firstName || 'Unknown',
            lastName: user.lastName || 'User',
            email: user.email,
            position: 'Employee', // Default position
            employmentType: 'FULL_TIME',
            startDate: new Date(), // Current date as start date
            status: 'ACTIVE',
            currency: 'USD',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })
        
        createdEmployees.push(employee)
        console.log(`✅ Created: ${employeeId} - ${user.firstName} ${user.lastName} (${user.email})`)
        
      } catch (error) {
        console.error(`❌ Failed to create employee for ${user.email}:`, error.message)
      }
    }
    
    console.log(`\n🎉 Migration Complete!`)
    console.log(`✅ Successfully created ${createdEmployees.length} employee records`)
    
    // Verify final count
    const totalEmployees = await prisma.employees.count({ where: { status: 'ACTIVE' } })
    console.log(`📊 Total active employees: ${totalEmployees}`)
    
    // Show all employees now
    const allEmployees = await prisma.employees.findMany({
      where: { status: 'ACTIVE' },
      select: {
        employeeId: true,
        firstName: true,
        lastName: true,
        email: true,
        position: true,
        department: true
      },
      orderBy: { firstName: 'asc' }
    })
    
    console.log('\n📋 All Active Employees:')
    console.log('-' .repeat(40))
    allEmployees.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.employeeId} - ${emp.firstName} ${emp.lastName}`)
      console.log(`   Email: ${emp.email}`)
      console.log(`   Position: ${emp.position}`)
      console.log(`   Department: ${emp.department || 'Not assigned'}`)
      console.log('')
    })
    
  } catch (error) {
    console.error('❌ Migration Error:', error)
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      meta: error.meta
    })
  } finally {
    await prisma.$disconnect()
  }
}

migrateUsersToEmployees()
