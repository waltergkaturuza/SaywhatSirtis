const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testTatendaPerformancePlan() {
  try {
    console.log('🔍 Testing performance plan for tatenda@saywhat.org...\n')
    
    // Find employee
    const employee = await prisma.employees.findUnique({
      where: { email: 'tatenda@saywhat.org' }
    })
    
    if (!employee) {
      console.log('❌ Employee not found')
      return
    }
    
    console.log('✅ Employee found:', employee.id, employee.firstName, employee.lastName)
    
    // Find performance plans for current year
    const currentYear = new Date().getFullYear()
    const plans = await prisma.performance_plans.findMany({
      where: {
        employeeId: employee.id,
        planYear: currentYear
      },
      include: {
        performance_responsibilities: {
          include: {
            performance_activities: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`\n📊 Performance Plans for ${currentYear}:`)
    console.log('  - Count:', plans.length)
    
    if (plans.length > 0) {
      const latestPlan = plans[0]
      console.log('\n  Latest Plan:')
      console.log('    - ID:', latestPlan.id)
      console.log('    - Year:', latestPlan.planYear)
      console.log('    - Status:', latestPlan.status)
      console.log('    - Period:', latestPlan.planPeriod)
      console.log('    - Responsibilities:', latestPlan.performance_responsibilities.length)
      
      if (latestPlan.performance_responsibilities.length > 0) {
        console.log('\n  📝 Responsibilities:')
        latestPlan.performance_responsibilities.forEach((resp, index) => {
          console.log(`\n    Responsibility ${index + 1}:`)
          console.log('      - ID:', resp.id)
          console.log('      - Title:', resp.title)
          console.log('      - Description:', resp.description)
          console.log('      - Weight:', resp.weight)
          console.log('      - Activities:', resp.performance_activities.length)
          
          if (resp.performance_activities.length > 0) {
            resp.performance_activities.forEach((act, actIndex) => {
              console.log(`        Activity ${actIndex + 1}:`, act.title, '| Status:', act.status)
            })
          }
        })
      }
    } else {
      console.log('  ⚠️ No performance plans found for', currentYear)
      
      // Check all years
      const allPlans = await prisma.performance_plans.findMany({
        where: { employeeId: employee.id },
        orderBy: { planYear: 'desc' }
      })
      
      if (allPlans.length > 0) {
        console.log('\n  📅 Plans from other years:')
        allPlans.forEach(plan => {
          console.log(`    - Year ${plan.planYear}: ${plan.status}`)
        })
      } else {
        console.log('\n  ⚠️ No performance plans found at all for this employee')
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testTatendaPerformancePlan()

