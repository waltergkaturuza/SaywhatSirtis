import { PrismaClient, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

async function safeSeed() {
  console.log('🌱 Starting SAFE database seeding...')
  
  // First, check if data already exists
  console.log('🔍 Checking existing data...')
  
  const existingCounts = {
    users: await prisma.user.count(),
    projects: await prisma.project.count(),
    callRecords: await prisma.callRecord.count(),
    activities: await prisma.activity.count()
  }
  
  console.log('📊 Current data counts:', existingCounts)
  
  // Only proceed if database is empty OR if explicitly forced
  const forceReseed = process.env.FORCE_RESEED === 'true'
  const isEmpty = Object.values(existingCounts).every(count => count === 0)
  
  if (!isEmpty && !forceReseed) {
    console.log('⚠️  Database already contains data!')
    console.log('💡 To reseed anyway, set environment variable: FORCE_RESEED=true')
    console.log('🔒 Skipping seed to preserve existing data.')
    console.log('\n📋 Current data preserved:')
    console.log(`   👥 Users: ${existingCounts.users}`)
    console.log(`   📋 Projects: ${existingCounts.projects}`)
    console.log(`   📞 Call Records: ${existingCounts.callRecords}`)
    console.log(`   📝 Activities: ${existingCounts.activities}`)
    return
  }
  
  if (forceReseed) {
    console.log('⚠️  FORCE_RESEED=true detected - clearing existing data...')
    console.log('🗑️  This will DELETE ALL EXISTING DATA!')
    
    // Wait 3 seconds to allow cancellation
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Clear existing data in reverse order of dependencies
    await prisma.activity.deleteMany({})
    await prisma.callRecord.deleteMany({})
    await prisma.project.deleteMany({})
    await prisma.auditLog.deleteMany({})
    await prisma.session.deleteMany({})
    await prisma.account.deleteMany({})
    await prisma.user.deleteMany({})
    
    console.log('✅ Existing data cleared')
  }

  // Create Users (only if they don't exist)
  console.log('👥 Creating users...')
  
  const adminExists = await prisma.user.findUnique({ where: { email: 'admin@saywhat.org' } })
  if (!adminExists) {
    await prisma.user.create({
      data: {
        email: 'admin@saywhat.org',
        username: 'admin',
        firstName: 'System',
        lastName: 'Administrator',
        role: 'SYSTEM_ADMINISTRATOR' as any,
        department: 'IT',
        position: 'System Administrator',
        phoneNumber: '+27123456789',
        location: 'Cape Town, South Africa',
        isActive: true,
        roles: ['ADMIN', 'SUPER_USER'],
        twoFactorEnabled: true,
      }
    })
    console.log('   ✅ Created admin user')
  } else {
    console.log('   ℹ️  Admin user already exists')
  }

  const pmExists = await prisma.user.findUnique({ where: { email: 'pm@saywhat.org' } })
  if (!pmExists) {
    await prisma.user.create({
      data: {
        email: 'pm@saywhat.org',
        username: 'projectmanager',
        firstName: 'John',
        lastName: 'Smith',
        role: 'ADVANCE_USER_2' as any,
        department: 'Programs',
        position: 'Project Manager',
        phoneNumber: '+27123456790',
        location: 'Johannesburg, South Africa',
        isActive: true,
        roles: ['PROJECT_MANAGER', 'PROJECT_LEAD'],
      }
    })
    console.log('   ✅ Created project manager')
  } else {
    console.log('   ℹ️  Project manager already exists')
  }

  // Only create sample projects if none exist
  const projectCount = await prisma.project.count()
  if (projectCount === 0) {
    console.log('📋 Creating sample projects...')
    
    const admin = await prisma.user.findUnique({ where: { email: 'admin@saywhat.org' } })
    const projectManager = await prisma.user.findUnique({ where: { email: 'pm@saywhat.org' } })
    
    if (admin && projectManager) {
      await prisma.project.create({
        data: {
          name: 'Community Water Access Program',
          description: 'Implementing sustainable water access solutions in rural communities.',
          objectives: {
            primary: 'Provide clean water access to 10,000 residents',
            secondary: ['Install 25 water points', 'Train 50 community members']
          },
          timeframe: '18 months',
          startDate: new Date('2024-01-15'),
          endDate: new Date('2025-07-15'),
          country: 'South Africa',
          province: 'Eastern Cape',
          budget: 2500000.00,
          actualSpent: 450000.00,
          status: 'ACTIVE',
          priority: 'HIGH',
          progress: 25,
          currency: 'ZAR',
          creatorId: admin.id,
          managerId: projectManager.id,
        }
      })
      console.log('   ✅ Created sample project')
    }
  } else {
    console.log('   ℹ️  Projects already exist, skipping sample creation')
  }

  console.log('\n🎉 Safe seeding completed!')
  
  // Final counts
  const finalCounts = {
    users: await prisma.user.count(),
    projects: await prisma.project.count(),
    callRecords: await prisma.callRecord.count(),
    activities: await prisma.activity.count()
  }
  
  console.log('📊 Final data counts:', finalCounts)
}

async function main() {
  try {
    await safeSeed()
  } catch (error) {
    console.error('❌ Error during safe seeding:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .then(() => {
    console.log('✅ Safe seed completed successfully')
  })
  .catch((error) => {
    console.error('❌ Safe seed failed:', error)
    process.exit(1)
  })
