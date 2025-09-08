// Production Database Migration Script
// This script safely adds the new employee fields to production database

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkAndMigrateProduction() {
  console.log('🔍 Checking production database schema...')
  
  try {
    // Check if the new columns exist
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'employees' 
      AND table_schema = 'public'
      ORDER BY column_name;
    `
    
    const existingColumns = tableInfo.map(row => row.column_name)
    console.log('📋 Existing columns:', existingColumns)
    
    const requiredColumns = [
      'supervisor_id',
      'is_supervisor', 
      'is_reviewer',
      'medical_aid',
      'funeral_cover',
      'vehicle_benefit',
      'fuel_allowance',
      'airtime_allowance',
      'other_benefits',
      'archived_at',
      'archive_reason',
      'access_revoked'
    ]
    
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col))
    
    if (missingColumns.length === 0) {
      console.log('✅ All required columns already exist!')
      return true
    }
    
    console.log('🚀 Missing columns found:', missingColumns)
    console.log('📦 Starting production migration...')
    
    // Add missing columns one by one with error handling
    for (const column of missingColumns) {
      try {
        console.log(`➕ Adding column: ${column}`)
        
        switch (column) {
          case 'supervisor_id':
            await prisma.$executeRaw`
              ALTER TABLE employees 
              ADD COLUMN supervisor_id TEXT REFERENCES employees(id);
            `
            await prisma.$executeRaw`
              CREATE INDEX IF NOT EXISTS idx_employees_supervisor_id ON employees(supervisor_id);
            `
            break
            
          case 'is_supervisor':
            await prisma.$executeRaw`
              ALTER TABLE employees 
              ADD COLUMN is_supervisor BOOLEAN NOT NULL DEFAULT false;
            `
            await prisma.$executeRaw`
              CREATE INDEX IF NOT EXISTS idx_employees_is_supervisor ON employees(is_supervisor);
            `
            break
            
          case 'is_reviewer':
            await prisma.$executeRaw`
              ALTER TABLE employees 
              ADD COLUMN is_reviewer BOOLEAN NOT NULL DEFAULT false;
            `
            break
            
          case 'medical_aid':
            await prisma.$executeRaw`
              ALTER TABLE employees 
              ADD COLUMN medical_aid BOOLEAN NOT NULL DEFAULT false;
            `
            break
            
          case 'funeral_cover':
            await prisma.$executeRaw`
              ALTER TABLE employees 
              ADD COLUMN funeral_cover BOOLEAN NOT NULL DEFAULT false;
            `
            break
            
          case 'vehicle_benefit':
            await prisma.$executeRaw`
              ALTER TABLE employees 
              ADD COLUMN vehicle_benefit BOOLEAN NOT NULL DEFAULT false;
            `
            break
            
          case 'fuel_allowance':
            await prisma.$executeRaw`
              ALTER TABLE employees 
              ADD COLUMN fuel_allowance BOOLEAN NOT NULL DEFAULT false;
            `
            break
            
          case 'airtime_allowance':
            await prisma.$executeRaw`
              ALTER TABLE employees 
              ADD COLUMN airtime_allowance BOOLEAN NOT NULL DEFAULT false;
            `
            break
            
          case 'other_benefits':
            await prisma.$executeRaw`
              ALTER TABLE employees 
              ADD COLUMN other_benefits TEXT[] DEFAULT '{}';
            `
            break
            
          case 'archived_at':
            await prisma.$executeRaw`
              ALTER TABLE employees 
              ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE;
            `
            break
            
          case 'archive_reason':
            await prisma.$executeRaw`
              ALTER TABLE employees 
              ADD COLUMN archive_reason TEXT;
            `
            break
            
          case 'access_revoked':
            await prisma.$executeRaw`
              ALTER TABLE employees 
              ADD COLUMN access_revoked BOOLEAN NOT NULL DEFAULT false;
            `
            break
        }
        
        console.log(`✅ Added column: ${column}`)
        
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Column ${column} already exists, skipping...`)
        } else {
          console.error(`❌ Error adding column ${column}:`, error.message)
          throw error
        }
      }
    }
    
    console.log('🎉 Production migration completed successfully!')
    
    // Verify the migration
    const newTableInfo = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'employees' 
      AND table_schema = 'public'
      ORDER BY column_name;
    `
    
    const newColumns = newTableInfo.map(row => row.column_name)
    const stillMissing = requiredColumns.filter(col => !newColumns.includes(col))
    
    if (stillMissing.length === 0) {
      console.log('✅ Migration verification passed!')
      console.log('📊 Total columns now:', newColumns.length)
      return true
    } else {
      console.error('❌ Migration verification failed. Still missing:', stillMissing)
      return false
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    return false
  }
}

// Function to verify API routes can query new fields
async function verifyAPICompatibility() {
  console.log('\n🧪 Testing API compatibility...')
  
  try {
    // Test reading employee with new fields
    const employee = await prisma.employee.findFirst({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        supervisorId: true,
        isSupervisor: true,
        isReviewer: true,
        medicalAid: true,
        funeralCover: true,
        vehicleBenefit: true,
        fuelAllowance: true,
        airtimeAllowance: true,
        otherBenefits: true,
        archivedAt: true,
        archiveReason: true,
        accessRevoked: true
      }
    })
    
    if (employee) {
      console.log('✅ API can read new fields successfully')
      console.log('📋 Available new fields:', Object.keys(employee).filter(key => 
        ['supervisorId', 'isSupervisor', 'isReviewer', 'medicalAid', 'funeralCover', 
         'vehicleBenefit', 'fuelAllowance', 'airtimeAllowance', 'otherBenefits', 
         'archivedAt', 'archiveReason', 'accessRevoked'].includes(key)
      ))
      return true
    } else {
      console.log('⚠️  No employees found for testing')
      return true
    }
    
  } catch (error) {
    console.error('❌ API compatibility test failed:', error.message)
    return false
  }
}

async function runProductionMigration() {
  console.log('🚀 Starting Production Database Migration\n')
  
  try {
    const migrationSuccess = await checkAndMigrateProduction()
    
    if (migrationSuccess) {
      const apiCompatible = await verifyAPICompatibility()
      
      if (apiCompatible) {
        console.log('\n🎉 Production migration completed successfully!')
        console.log('💡 Your enhanced employee management features are now available in production.')
      } else {
        console.log('\n⚠️  Migration completed but API compatibility issues detected.')
      }
    } else {
      console.log('\n❌ Migration failed. Please check the errors above.')
    }
    
  } catch (error) {
    console.error('\n💥 Critical migration error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Export for use in production deployment
module.exports = { runProductionMigration, checkAndMigrateProduction, verifyAPICompatibility }

// Run if called directly
if (require.main === module) {
  runProductionMigration()
}
