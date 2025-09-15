// Test to check what actual departments exist in the database
const { PrismaClient } = require('@prisma/client')

const testRealDepartments = async () => {
  console.log('🔍 Checking actual departments in database...')
  
  const prisma = new PrismaClient()
  
  try {
    // Test database connection
    console.log('\n📊 Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Get actual departments from users table
    console.log('\n📋 Fetching actual departments from users table...')
    const departments = await prisma.users.findMany({
      where: {
        department: {
          not: null
        },
        isActive: true
      },
      select: {
        department: true,
        name: true,
        position: true
      }
    })
    
    console.log(`Found ${departments.length} active users with departments`)
    
    // Get unique departments
    const uniqueDepartments = [...new Set(departments.map(d => d.department).filter(Boolean))].sort()
    
    console.log('\n🏢 Actual departments in your database:')
    uniqueDepartments.forEach((dept, index) => {
      const userCount = departments.filter(u => u.department === dept).length
      console.log(`${index + 1}. ${dept} (${userCount} employees)`)
    })
    
    if (uniqueDepartments.length === 0) {
      console.log('\n⚠️  No departments found! This means:')
      console.log('- Users table might be empty')
      console.log('- Department field might be null for all users')
      console.log('- Database might not be properly seeded')
    }
    
    // Show some sample users for debugging
    console.log('\n👥 Sample users in database:')
    const sampleUsers = await prisma.users.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        position: true,
        isActive: true
      }
    })
    
    sampleUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Department: ${user.department || 'NULL'} - Active: ${user.isActive}`)
    })
    
  } catch (error) {
    console.error('❌ Database error:', error.message)
    console.log('\n🔧 This explains why the API is using fallback data!')
    console.log('The database connection is failing, so the API returns mock departments.')
  } finally {
    await prisma.$disconnect()
  }
}

testRealDepartments()
