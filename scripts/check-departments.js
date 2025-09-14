const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDepartments() {
  try {
    console.log('🏢 Checking departments in the database...\n')

    const departments = await prisma.departments.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        status: true,
        _count: {
          select: {
            employees: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    if (departments.length > 0) {
      console.log('📋 Available Departments:')
      departments.forEach((dept, index) => {
        console.log(`   ${index + 1}. ${dept.name} (${dept.code || 'No Code'}) - ${dept.status} - ${dept._count.employees} employees`)
        console.log(`      ID: ${dept.id}`)
      })
    } else {
      console.log('❌ No departments found in the database!')
      console.log('📝 Creating default departments...')
      
      // Create default departments
      const defaultDepartments = [
        { name: 'Human Resources', code: 'HR', description: 'Human Resources Department' },
        { name: 'Information Technology', code: 'IT', description: 'Information Technology Department' },
        { name: 'Finance', code: 'FIN', description: 'Finance Department' },
        { name: 'Operations', code: 'OPS', description: 'Operations Department' },
        { name: 'Administration', code: 'ADMIN', description: 'Administration Department' }
      ]

      for (const dept of defaultDepartments) {
        const created = await prisma.departments.create({
          data: {
            id: require('crypto').randomUUID(),
            name: dept.name,
            code: dept.code,
            description: dept.description,
            status: 'ACTIVE',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })
        console.log(`   ✅ Created: ${created.name} (ID: ${created.id})`)
      }
    }

    console.log('\n📊 Department Statistics:')
    const totalDepartments = await prisma.departments.count()
    const activeDepartments = await prisma.departments.count({ where: { status: 'ACTIVE' } })
    console.log(`   - Total Departments: ${totalDepartments}`)
    console.log(`   - Active Departments: ${activeDepartments}`)

  } catch (error) {
    console.error('❌ Error checking departments:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDepartments()
