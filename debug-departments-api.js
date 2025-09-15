// Test to debug the departments API query
const { PrismaClient } = require('@prisma/client')

const debugDepartmentsAPI = async () => {
  console.log('🔍 Debugging departments API query...')
  
  const prisma = new PrismaClient()
  
  try {
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Test 1: Check total users
    console.log('\n📊 Test 1: Total users in database')
    const totalUsers = await prisma.users.count()
    console.log(`Total users: ${totalUsers}`)
    
    // Test 2: Check active users
    console.log('\n📊 Test 2: Active users')
    const activeUsers = await prisma.users.count({
      where: {
        isActive: true
      }
    })
    console.log(`Active users: ${activeUsers}`)
    
    // Test 3: Users with departments
    console.log('\n📊 Test 3: Users with departments (not null)')
    const usersWithDepts = await prisma.users.count({
      where: {
        department: {
          not: null
        }
      }
    })
    console.log(`Users with departments: ${usersWithDepts}`)
    
    // Test 4: Active users with departments
    console.log('\n📊 Test 4: Active users with departments')
    const activeUsersWithDepts = await prisma.users.count({
      where: {
        department: {
          not: null
        },
        isActive: true
      }
    })
    console.log(`Active users with departments: ${activeUsersWithDepts}`)
    
    // Test 5: Sample users to see actual data
    console.log('\n📊 Test 5: Sample users data')
    const sampleUsers = await prisma.users.findMany({
      take: 10,
      select: {
        id: true,
        email: true,
        department: true,
        isActive: true,
        firstName: true,
        lastName: true
      }
    })
    
    console.log('Sample users:')
    sampleUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`)
      console.log(`   Department: ${user.department || 'NULL'}`)
      console.log(`   Active: ${user.isActive}`)
      console.log('')
    })
    
    // Test 6: Try the exact query from the API
    console.log('\n📊 Test 6: Exact API query test')
    const departments = await prisma.users.findMany({
      where: {
        department: {
          not: null
        },
        isActive: true
      },
      select: {
        department: true
      },
      distinct: ['department']
    })
    
    console.log(`Query returned ${departments.length} departments:`)
    departments.forEach((dept, index) => {
      console.log(`${index + 1}. "${dept.department}"`)
    })
    
    if (departments.length === 0) {
      console.log('\n❌ This is the problem! The query returns 0 departments.')
      console.log('Possible causes:')
      console.log('- All users have department: null')
      console.log('- All users have isActive: false') 
      console.log('- No users exist in database')
    } else {
      console.log('\n✅ Query works! API should be returning real data.')
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message)
    console.log('This explains why fallback data is being used.')
  } finally {
    await prisma.$disconnect()
  }
}

debugDepartmentsAPI()
