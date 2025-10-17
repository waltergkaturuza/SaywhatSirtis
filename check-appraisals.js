const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkAppraisals() {
  try {
    console.log('🔍 Checking appraisals in database...\n')
    
    const appraisals = await prisma.performance_appraisals.findMany({
      include: {
        employees: {
          select: {
            employeeId: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`📊 Total appraisals: ${appraisals.length}\n`)
    
    if (appraisals.length > 0) {
      appraisals.forEach((appraisal, index) => {
        console.log(`\nAppraisal #${index + 1}:`)
        console.log(`  ID: ${appraisal.id}`)
        console.log(`  Employee: ${appraisal.employees?.firstName} ${appraisal.employees?.lastName}`)
        console.log(`  Email: ${appraisal.employees?.email}`)
        console.log(`  Status: ${appraisal.status}`)
        console.log(`  Type: ${appraisal.appraisalType}`)
        console.log(`  Created: ${appraisal.createdAt}`)
      })
    } else {
      console.log('❌ No appraisals found in database')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAppraisals()

