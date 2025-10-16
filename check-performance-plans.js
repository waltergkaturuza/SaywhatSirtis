const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPlans() {
  try {
    // Get all performance plans
    const plans = await prisma.performance_plans.findMany({
      include: {
        employees: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            employeeId: true,
            departments: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    console.log('\n📊 Total Performance Plans:', plans.length);
    console.log('\n' + '='.repeat(80));
    
    if (plans.length === 0) {
      console.log('❌ No performance plans found in the database');
    } else {
      plans.forEach((plan, index) => {
        console.log(`\n${index + 1}. Plan ID: ${plan.id}`);
        console.log(`   Employee: ${plan.employees?.firstName} ${plan.employees?.lastName} (${plan.employees?.email})`);
        console.log(`   Employee ID: ${plan.employees?.employeeId}`);
        console.log(`   Department: ${plan.employees?.departments?.name || 'N/A'}`);
        console.log(`   Title: ${plan.planTitle || 'N/A'}`);
        console.log(`   Year: ${plan.planYear || 'N/A'}`);
        console.log(`   Status: ${plan.status || 'N/A'}`);
        console.log(`   Workflow Status: ${plan.workflowStatus || 'N/A'}`);
        console.log(`   Created: ${plan.createdAt}`);
        console.log(`   Updated: ${plan.updatedAt}`);
      });
    }

    // Check for Tatenda's plans specifically
    console.log('\n' + '='.repeat(80));
    const tatendaPlans = await prisma.performance_plans.findMany({
      where: {
        employees: {
          email: 'tatenda@saywhat.org'
        }
      },
      include: {
        employees: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            employeeId: true
          }
        }
      }
    });

    console.log(`\n🔍 Tatenda's Performance Plans: ${tatendaPlans.length}`);
    tatendaPlans.forEach((plan, index) => {
      console.log(`\n${index + 1}. ID: ${plan.id}`);
      console.log(`   Title: ${plan.planTitle}`);
      console.log(`   Year: ${plan.planYear}`);
      console.log(`   Status: ${plan.status}`);
      console.log(`   Created: ${plan.createdAt}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPlans();

