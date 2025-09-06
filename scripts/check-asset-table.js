// Check Asset Table Structure
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Use the same connection logic as the API
const executeQuery = async (sql) => {
  try {
    return await prisma.$queryRawUnsafe(sql)
  } catch (error) {
    console.error('Query error:', error)
    throw error
  }
}

async function checkAssetTable() {
  try {
    console.log('🔍 Checking Asset table structure...')
    
    // Get table structure
    const columns = await executeQuery(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'assets' 
      ORDER BY ordinal_position;
    `)
    
    console.log('\n📋 Asset table columns:')
    console.table(columns)
    
    // Check if table has any data
    const count = await executeQuery('SELECT COUNT(*) as count FROM assets')
    console.log(`\n📊 Total assets in database: ${count[0]?.count || 0}`)
    
    // Show sample data if available
    if (count[0]?.count > 0) {
      const sample = await executeQuery('SELECT * FROM assets LIMIT 3')
      console.log('\n📝 Sample asset data:')
      console.table(sample)
    }
    
  } catch (error) {
    console.error('❌ Error checking asset table:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAssetTable()
