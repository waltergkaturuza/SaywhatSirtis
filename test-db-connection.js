const { PrismaClient } = require('@prisma/client')

async function testDatabaseConnection() {
  const prisma = new PrismaClient()
  
  try {
    console.log('Testing database connection...')
    
    // Try a simple query
    await prisma.$connect()
    console.log('✅ Database connection successful!')
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Database query successful:', result)
    
  } catch (error) {
    console.error('❌ Database connection failed:')
    console.error('Error:', error.message)
    console.error('Code:', error.code)
    
    if (error.code === 'P1001') {
      console.log('\n🔍 Troubleshooting suggestions:')
      console.log('1. Check if Supabase project is active and running')
      console.log('2. Verify DATABASE_URL is correct in .env.local')
      console.log('3. Check if your IP is allowed in Supabase dashboard')
      console.log('4. Verify network connectivity to Supabase')
    }
  } finally {
    await prisma.$disconnect()
  }
}

testDatabaseConnection()
