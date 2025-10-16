const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testReviewerSave() {
  try {
    console.log('Testing Reviewer Save Functionality...\n')
    
    // Get Tatenda's current data
    const tatenda = await prisma.employees.findFirst({
      where: { email: 'tatenda@saywhat.org' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        reviewer_id: true
      }
    })
    
    console.log('Current Tatenda Data:')
    console.log(`  Name: ${tatenda.firstName} ${tatenda.lastName}`)
    console.log(`  Reviewer ID: ${tatenda.reviewer_id || 'NOT SET'}\n`)
    
    // Get first available reviewer
    const reviewer = await prisma.employees.findFirst({
      where: {
        is_reviewer: true,
        status: 'ACTIVE',
        id: { not: tatenda.id }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true
      }
    })
    
    if (!reviewer) {
      console.log('❌ No reviewers found to test with')
      return
    }
    
    console.log('Selected Reviewer for Test:')
    console.log(`  Name: ${reviewer.firstName} ${reviewer.lastName}`)
    console.log(`  Email: ${reviewer.email}`)
    console.log(`  ID: ${reviewer.id}\n`)
    
    // Update Tatenda with reviewer
    console.log('Updating Tatenda with reviewer...')
    const updated = await prisma.employees.update({
      where: { id: tatenda.id },
      data: {
        reviewer_id: reviewer.id
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        reviewer_id: true,
        reviewer: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })
    
    console.log('\n✅ Update Successful!')
    console.log('═══════════════════════════════════════════════════════')
    console.log(`Employee: ${updated.firstName} ${updated.lastName}`)
    console.log(`Reviewer ID in DB: ${updated.reviewer_id}`)
    if (updated.reviewer) {
      console.log(`Reviewer Name: ${updated.reviewer.firstName} ${updated.reviewer.lastName}`)
      console.log(`Reviewer Email: ${updated.reviewer.email}`)
    }
    console.log('═══════════════════════════════════════════════════════\n')
    
    // Verify by fetching again
    const verify = await prisma.employees.findFirst({
      where: { id: tatenda.id },
      include: {
        reviewer: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })
    
    console.log('Verification - Data Retrieved:')
    console.log(`  Reviewer ID: ${verify.reviewer_id}`)
    if (verify.reviewer) {
      console.log(`  ✅ Reviewer: ${verify.reviewer.firstName} ${verify.reviewer.lastName}`)
    } else {
      console.log(`  ❌ Reviewer relation not found`)
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testReviewerSave()

