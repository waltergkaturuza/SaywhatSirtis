// Database migration script to add new Employee fields
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function migrateEmployeeSchema() {
  try {
    console.log('🚀 Starting Employee schema migration...')
    
    // Step 1: Add supervisor fields
    console.log('📝 Adding supervisor fields...')
    await prisma.$executeRaw`
      ALTER TABLE employees ADD COLUMN IF NOT EXISTS supervisor_id TEXT
    `
    await prisma.$executeRaw`
      ALTER TABLE employees ADD COLUMN IF NOT EXISTS is_supervisor BOOLEAN DEFAULT FALSE
    `
    await prisma.$executeRaw`
      ALTER TABLE employees ADD COLUMN IF NOT EXISTS is_reviewer BOOLEAN DEFAULT FALSE
    `
    
    // Step 2: Add benefits fields
    console.log('💰 Adding benefits fields...')
    await prisma.$executeRaw`
      ALTER TABLE employees ADD COLUMN IF NOT EXISTS medical_aid BOOLEAN DEFAULT FALSE
    `
    await prisma.$executeRaw`
      ALTER TABLE employees ADD COLUMN IF NOT EXISTS funeral_cover BOOLEAN DEFAULT FALSE
    `
    await prisma.$executeRaw`
      ALTER TABLE employees ADD COLUMN IF NOT EXISTS vehicle_benefit BOOLEAN DEFAULT FALSE
    `
    await prisma.$executeRaw`
      ALTER TABLE employees ADD COLUMN IF NOT EXISTS fuel_allowance BOOLEAN DEFAULT FALSE
    `
    await prisma.$executeRaw`
      ALTER TABLE employees ADD COLUMN IF NOT EXISTS airtime_allowance BOOLEAN DEFAULT FALSE
    `
    await prisma.$executeRaw`
      ALTER TABLE employees ADD COLUMN IF NOT EXISTS other_benefits TEXT[] DEFAULT '{}'
    `
    
    // Step 3: Add archive fields
    console.log('📁 Adding archive fields...')
    await prisma.$executeRaw`
      ALTER TABLE employees ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP
    `
    await prisma.$executeRaw`
      ALTER TABLE employees ADD COLUMN IF NOT EXISTS archive_reason TEXT
    `
    await prisma.$executeRaw`
      ALTER TABLE employees ADD COLUMN IF NOT EXISTS access_revoked BOOLEAN DEFAULT FALSE
    `
    
    // Step 4: Add indexes
    console.log('📊 Adding indexes...')
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_employees_supervisor_id ON employees(supervisor_id)
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_employees_is_supervisor ON employees(is_supervisor)
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_employees_is_reviewer ON employees(is_reviewer)
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_employees_archived_at ON employees(archived_at)
    `
    
    // Step 5: Add foreign key constraint
    console.log('🔗 Adding foreign key constraint...')
    try {
      await prisma.$executeRaw`
        ALTER TABLE employees ADD CONSTRAINT fk_employee_supervisor 
        FOREIGN KEY (supervisor_id) REFERENCES employees(id) ON DELETE SET NULL
      `
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️ Foreign key constraint already exists, skipping...')
      } else {
        throw error
      }
    }
    
    // Step 6: Verify migration
    console.log('✅ Verifying migration...')
    const columns = await prisma.$queryRaw`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'employees' 
        AND column_name IN (
          'supervisor_id', 'is_supervisor', 'is_reviewer',
          'medical_aid', 'funeral_cover', 'vehicle_benefit', 
          'fuel_allowance', 'airtime_allowance', 'other_benefits',
          'archived_at', 'archive_reason', 'access_revoked'
        )
      ORDER BY column_name
    `
    
    console.log('📋 New columns added:')
    columns.forEach(col => {
      console.log(`  ✓ ${col.column_name} (${col.data_type})`)
    })
    
    console.log('🎉 Migration completed successfully!')
    console.log('📝 Next steps:')
    console.log('  1. Update Prisma schema with new fields')
    console.log('  2. Run: npx prisma generate')
    console.log('  3. Uncomment TODO sections in API routes')
    console.log('  4. Test new functionality')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  migrateEmployeeSchema()
    .then(() => {
      console.log('✅ Migration script completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error)
      process.exit(1)
    })
}

module.exports = { migrateEmployeeSchema }
