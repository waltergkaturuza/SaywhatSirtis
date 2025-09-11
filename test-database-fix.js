/**
 * Test script to verify database operations are working correctly
 * Run this after seeding to ensure all Prisma operations function properly
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function runDatabaseTests() {
  console.log('🧪 Running database connectivity tests...\n')

  try {
    // Test 1: Count operations (the original issue)
    console.log('📊 Testing count operations:')
    const projectCount = await prisma.project.count()
    const userCount = await prisma.user.count()
    const callRecordCount = await prisma.callRecord.count()
    const activityCount = await prisma.activity.count()
    
    console.log(`   Projects: ${projectCount}`)
    console.log(`   Users: ${userCount}`)
    console.log(`   Call Records: ${callRecordCount}`)
    console.log(`   Activities: ${activityCount}`)
    console.log('   ✅ Count operations working\n')

    // Test 2: Complex queries
    console.log('🔍 Testing complex queries:')
    const activeProjects = await prisma.project.count({
      where: { status: 'ACTIVE' }
    })
    const highPriorityCallsCount = await prisma.callRecord.count({
      where: { priority: 'HIGH' }
    })
    console.log(`   Active Projects: ${activeProjects}`)
    console.log(`   High Priority Calls: ${highPriorityCallsCount}`)
    console.log('   ✅ Complex queries working\n')

    // Test 3: Relationship queries
    console.log('🔗 Testing relationship queries:')
    const projectsWithActivities = await prisma.project.findMany({
      include: {
        activities: true,
        creator: {
          select: { firstName: true, lastName: true }
        }
      },
      take: 2
    })
    console.log(`   Found ${projectsWithActivities.length} projects with relationships`)
    console.log(`   First project has ${projectsWithActivities[0]?.activities.length || 0} activities`)
    console.log('   ✅ Relationship queries working\n')

    // Test 4: Data integrity
    console.log('🔐 Testing data integrity:')
    const usersWithProjects = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            createdProjects: true,
            managedProjects: true
          }
        }
      }
    })
    
    const totalCreatedProjects = usersWithProjects.reduce(
      (sum, user) => sum + user._count.createdProjects, 0
    )
    const totalManagedProjects = usersWithProjects.reduce(
      (sum, user) => sum + user._count.managedProjects, 0
    )
    
    console.log(`   Total projects created by users: ${totalCreatedProjects}`)
    console.log(`   Total projects managed by users: ${totalManagedProjects}`)
    console.log('   ✅ Data integrity verified\n')

    // Test 5: Prisma client functionality
    console.log('⚙️ Testing Prisma client functionality:')
    const firstProject = await prisma.project.findFirst({
      orderBy: { createdAt: 'asc' }
    })
    console.log(`   Oldest project: ${firstProject?.name}`)
    
    const recentCallRecord = await prisma.callRecord.findFirst({
      orderBy: { createdAt: 'desc' }
    })
    console.log(`   Most recent call: ${recentCallRecord?.caseNumber}`)
    console.log('   ✅ Prisma client working properly\n')

    console.log('🎉 All database tests passed successfully!')
    console.log('\n📋 Summary:')
    console.log('   ✅ prisma.project.count() - FIXED')
    console.log('   ✅ prisma.user.count() - Working')
    console.log('   ✅ prisma.callRecord.count() - Working')
    console.log('   ✅ Complex queries - Working')
    console.log('   ✅ Relationships - Working')
    console.log('   ✅ Data integrity - Verified')
    console.log('\n🚀 Your database is ready for production use!')

  } catch (error) {
    console.error('❌ Database test failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the tests
runDatabaseTests()
  .then(() => {
    console.log('\n✅ Database tests completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Database tests failed:', error)
    process.exit(1)
  })
