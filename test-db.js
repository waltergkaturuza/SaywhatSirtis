const { PrismaClient } = require('@prisma/client')

async function testConnection() {
  const prisma = new PrismaClient()
  
  try {
    console.log('Testing Prisma connection...')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Prisma connected successfully')
    
    // Test Department table query
    const departments = await prisma.department.findMany()
    console.log('✅ Department query successful:', departments)
    
    // Test creating a department
    const newDept = await prisma.department.create({
      data: {
        name: 'Test Department',
        description: 'A test department'
      }
    })
    console.log('✅ Department created:', newDept)
    
  } catch (error) {
    console.error('❌ Database error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
