// Script to check the actual database schema
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDatabaseSchema() {
  try {
    // Check what we can do with the current schema
    console.log('🔍 Checking current database capabilities...')
    
    // Try basic operations first
    const employeeCount = await prisma.employee.count()
    console.log(`📊 Total employees: ${employeeCount}`)
    
    if (employeeCount > 0) {
      const sample = await prisma.employee.findFirst({
        select: {
          id: true,
          employeeId: true,
          firstName: true,
          lastName: true,
          email: true,
          status: true,
          department: true,
          position: true
        }
      })
      console.log('📋 Sample employee fields available:', Object.keys(sample))
    }
    
    console.log('✅ Basic Employee operations work')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabaseSchema()
