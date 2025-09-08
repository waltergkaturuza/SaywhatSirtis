import { prisma } from './src/lib/prisma.ts'

async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Test a simple query
    const userCount = await prisma.user.count()
    console.log(`✅ Users in database: ${userCount}`)
    
    // Test employee count
    const employeeCount = await prisma.employee.count()
    console.log(`✅ Employees in database: ${employeeCount}`)
    
    await prisma.$disconnect()
    console.log('✅ Database disconnected successfully')
    
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    process.exit(1)
  }
}

testDatabaseConnection()
