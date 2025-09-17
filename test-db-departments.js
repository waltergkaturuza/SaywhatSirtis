const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function testDepartments() {
  try {
    console.log('🔍 Testing database connection...')
    
    // Test basic connection
    await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Database connection successful')
    
    // List all tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%department%'
    `
    console.log('📋 Department-related tables:', tables)
    
    // Try to query departments table
    console.log('🏢 Fetching departments...')
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
    
    if (error.code === 'P2021') {
      console.log('🔍 Table does not exist. Checking schema...')
      
      try {
        const allTables = await prisma.$queryRaw`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
          ORDER BY table_name
        `
        console.log('📋 All tables in database:', allTables.map(t => t.table_name))
      } catch (schemaError) {
        console.error('❌ Cannot read schema:', schemaError.message)
      }
    }
  } finally {
    await prisma.$disconnect()
  }
}

testDepartments()