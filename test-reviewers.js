const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function testReviewers() {
  try {
    console.log('🔍 Testing reviewers query...')
    
    // Test the exact same query used in the API
    const reviewers = await prisma.users.findMany({
      where: {
        OR: [
          { roles: { has: 'reviewer' } },
          { roles: { has: 'supervisor' } },
          { roles: { has: 'hr_manager' } },
          { role: 'ADMIN' }
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
    
    console.log(`✅ Found ${reviewers.length} potential reviewers:`)
    reviewers.forEach(reviewer => {
      const name = `${reviewer.firstName || 'Unknown'} ${reviewer.lastName || ''}`
      const roles = reviewer.roles?.join(', ') || 'No roles'
      const superviseeCount = reviewer._count.supervisees
      console.log(`  - ${name} (${reviewer.email}) - ${reviewer.position || 'No position'} - Roles: [${roles}] - Supervisees: ${superviseeCount}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('Full error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testReviewers()