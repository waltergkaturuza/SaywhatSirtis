// Execute SQL Script
import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'

const prisma = new PrismaClient()

async function executeSqlScript() {
  try {
    console.log('📄 Reading SQL script...')
    const sql = readFileSync('scripts/add-sample-assets.sql', 'utf8')
    
    console.log('🔧 Executing SQL script...')
    await prisma.$executeRawUnsafe(sql)
    
    console.log('✅ Sample assets added successfully!')
    
    // Check total count
    const count = await prisma.asset.count()
    console.log(`📊 Total assets in database: ${count}`)
    
    // Show sample
    const assets = await prisma.asset.findMany({ take: 3 })
    console.log('\n📝 Sample assets:')
    assets.forEach(asset => {
      console.log(`- ${asset.name} (${asset.assetTag}) - ${asset.brand} ${asset.model}`)
    })
    
  } catch (error) {
    console.error('❌ Error executing SQL script:', error)
  } finally {
    await prisma.$disconnect()
  }
}

executeSqlScript()
