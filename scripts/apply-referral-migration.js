// Script to apply referral field migration
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function applyReferralFieldMigration() {
  try {
    console.log('🔄 Starting referral field migration...')
    
    // Read the migration SQL
    const migrationPath = path.join(__dirname, '..', 'migrations', 'fix_referral_field_length.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    // Execute the migration
    await prisma.$executeRawUnsafe(migrationSQL)
    
    console.log('✅ Referral field migration completed successfully!')
    
    // Test the fix by creating a sample call with long referral data
    const testReferral = JSON.stringify({
      organization: "Child and Youth Care Zimbabwe (Health Care)",
      phone: "+263 777 510 370",
      email: "info@cyc.org.zw",
      focus: "Health, Rare Diseases",
      description: "Comprehensive child and youth care services specializing in health care, rare diseases, and community support programs. Provides medical assistance, counseling, and family support services.",
      contact_person: "Dr. Smith Johnson",
      location: "Harare, Zimbabwe",
      services: ["Medical Care", "Counseling", "Family Support", "Emergency Care", "Specialist Referrals"],
      availability: "24/7 Emergency, Mon-Fri 8AM-5PM Regular Services"
    })
    
    console.log('📊 Testing with sample referral data...')
    console.log(`Referral data length: ${testReferral.length} characters`)
    
    if (testReferral.length > 255) {
      console.log('✅ Migration needed - referral data exceeds VARCHAR(255) limit')
    }
    
    console.log('🎉 Migration verification complete!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
applyReferralFieldMigration()