const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testTatendaAppraisal() {
  try {
    console.log('🧪 Testing Tatenda Moyo\'s Appraisal Saving...\n')

    // Step 1: Get Tatenda's employee data
    const tatenda = await prisma.employees.findFirst({
      where: { email: 'tatenda@saywhat.org' },
      include: {
        employees: { select: { id: true, firstName: true, lastName: true } }, // supervisor
        reviewer: { select: { id: true, firstName: true, lastName: true } },
        job_descriptions: true,
        users: { select: { id: true } }
      }
    })

    if (!tatenda) {
      console.log('❌ Tatenda not found in the database')
      return
    }

    console.log('✅ Employee found:')
    console.log(`   Name: ${tatenda.firstName} ${tatenda.lastName}`)
    console.log(`   Position: ${tatenda.position}`)
    console.log(`   Employee ID: ${tatenda.id}`)
    console.log(`   User ID: ${tatenda.users?.id || 'N/A'}`)
    console.log(`   Supervisor: ${tatenda.employees ? `${tatenda.employees.firstName} ${tatenda.employees.lastName}` : 'Not assigned'}`)
    console.log(`   Reviewer: ${tatenda.reviewer ? `${tatenda.reviewer.firstName} ${tatenda.reviewer.lastName}` : 'Not assigned'}`)
    console.log(`   Has Job Description: ${tatenda.job_descriptions ? 'Yes' : 'No'}`)

    // Step 2: Check existing appraisals
    const existingAppraisals = await prisma.performance_appraisals.findMany({
      where: { employeeId: tatenda.id },
      orderBy: { createdAt: 'desc' },
      take: 3
    })

    console.log(`\n📋 Existing Appraisals: ${existingAppraisals.length}`)
    if (existingAppraisals.length > 0) {
      existingAppraisals.forEach((appraisal, idx) => {
        console.log(`\n   Appraisal ${idx + 1}:`)
        console.log(`      ID: ${appraisal.id}`)
        console.log(`      Type: ${appraisal.appraisalType}`)
        console.log(`      Status: ${appraisal.status}`)
        console.log(`      Created: ${appraisal.createdAt.toISOString().split('T')[0]}`)
      })
    }

    // Step 3: Create a test appraisal
    console.log('\n\n🔄 Creating test appraisal...')
    
    const testAppraisal = {
      id: `test-${Date.now()}`,
      employeeId: tatenda.id,
      appraisalType: 'annual',
      reviewPeriodStart: new Date('2025-01-01'),
      reviewPeriodEnd: new Date('2025-12-31'),
      status: 'draft',
      overallRating: 4,
      employeeComments: 'Test self-assessment comments',
      supervisorComments: null,
      reviewerComments: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const createdAppraisal = await prisma.performance_appraisals.create({
      data: testAppraisal
    })

    console.log('✅ Test appraisal created successfully!')
    console.log(`   ID: ${createdAppraisal.id}`)
    console.log(`   Status: ${createdAppraisal.status}`)
    console.log(`   Type: ${createdAppraisal.appraisalType}`)

    // Step 4: Verify it can be retrieved
    const retrievedAppraisal = await prisma.performance_appraisals.findUnique({
      where: { id: createdAppraisal.id },
      include: {
        employees: {
          select: { firstName: true, lastName: true, position: true }
        }
      }
    })

    if (retrievedAppraisal) {
      console.log('\n✅ Appraisal retrieved successfully!')
      console.log(`   Employee: ${retrievedAppraisal.employees.firstName} ${retrievedAppraisal.employees.lastName}`)
      console.log(`   Position: ${retrievedAppraisal.employees.position}`)
      console.log(`   Rating: ${retrievedAppraisal.overallRating}/5`)
    }

    // Step 5: Test update
    console.log('\n🔄 Testing update...')
    const updatedAppraisal = await prisma.performance_appraisals.update({
      where: { id: createdAppraisal.id },
      data: {
        status: 'submitted',
        overallRating: 5,
        employeeComments: 'Updated test comments'
      }
    })

    console.log('✅ Appraisal updated successfully!')
    console.log(`   New Status: ${updatedAppraisal.status}`)
    console.log(`   New Rating: ${updatedAppraisal.overallRating}/5`)

    // Step 6: Clean up test data
    console.log('\n🧹 Cleaning up test data...')
    await prisma.performance_appraisals.delete({
      where: { id: createdAppraisal.id }
    })
    console.log('✅ Test appraisal deleted')

    console.log('\n\n✅✅✅ All tests passed! Tatenda\'s appraisal saving works correctly!')
    console.log('\n📝 Summary:')
    console.log('   ✓ Employee data retrieved')
    console.log('   ✓ Appraisal created')
    console.log('   ✓ Appraisal retrieved')
    console.log('   ✓ Appraisal updated')
    console.log('   ✓ Appraisal deleted')

  } catch (error) {
    console.error('\n❌ Error during testing:', error.message)
    console.error('\nFull error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testTatendaAppraisal()

