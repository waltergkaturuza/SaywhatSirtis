const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function testSupervisors() {
  try {
    console.log('🔍 Testing supervisors query...')
    
    // Test the exact same query used in the supervisors API
    const supervisors = await prisma.users.findMany({
      where: {
        OR: [
          { roles: { has: 'supervisor' } },
          { role: 'ADMIN' },
          { 
            supervisees: {
              some: {}
            }
          }
        ],
        isActive: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        department: true,
        position: true,
        roles: true,
        _count: {
          select: {
            supervisees: true
          }
        }
      },
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' }
      ]
    })
    
    console.log(`✅ Found ${supervisors.length} supervisors:`)
    supervisors.forEach(supervisor => {
      const name = `${supervisor.firstName || 'Unknown'} ${supervisor.lastName || ''}`
      const roles = supervisor.roles?.join(', ') || 'No roles'
      const superviseeCount = supervisor._count.supervisees
      console.log(`  - ${name} (${supervisor.email}) - ${supervisor.position || 'No position'} - Roles: [${roles}] - Supervisees: ${superviseeCount}`)
    })
    
    // Also test departments
    console.log('\n🏢 Testing departments query...')
    const departments = await prisma.departments.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        status: true
      },
      take: 10
    })
    
    console.log(`✅ Found ${departments.length} departments:`)
    departments.forEach(dept => {
      console.log(`  - ${dept.name} (${dept.code || 'No code'}) - Status: ${dept.status || 'N/A'}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('Full error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testSupervisors()