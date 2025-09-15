const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAndCreateActivities() {
  try {
    console.log('🔍 Checking Performance Plan Activities in Database...\n');
    
    // First, get all performance plans
    const performancePlans = await prisma.performancePlan.findMany({
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            department: { select: { name: true } }
          }
        }
      }
    });
    
    console.log(`📊 Found ${performancePlans.length} performance plans`);
    
    // Check existing activities
    const existingActivities = await prisma.performancePlanActivity.findMany({
      include: {
        performancePlan: {
          include: {
            employee: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });
    
    console.log(`🎯 Found ${existingActivities.length} existing activities`);
    
    if (existingActivities.length > 0) {
      console.log('\n📋 Existing Activities:');
      existingActivities.forEach(activity => {
        console.log(`  - ${activity.keyDeliverable} (${activity.performancePlan.employee.firstName} ${activity.performancePlan.employee.lastName})`);
      });
    }
    
    // If no activities exist and we have performance plans, create some sample activities
    if (existingActivities.length === 0 && performancePlans.length > 0) {
      console.log('\n🚀 Creating sample activities for testing...');
      
      const sampleActivities = [
        {
          keyDeliverable: "Digital Transformation Initiative",
          activity: "Lead the implementation of new digital systems across the organization to improve efficiency and reduce manual processes",
          timeline: "Q1-Q2 2025",
          supportDepartment: "HR",
          successIndicator: "Successfully implement at least 3 digital solutions with 25% efficiency improvement",
          progress: 35,
          status: "in-progress"
        },
        {
          keyDeliverable: "Team Performance Enhancement",
          activity: "Develop and execute training programs to improve team productivity and collaboration",
          timeline: "Q1 2025",
          supportDepartment: "HR Department",
          successIndicator: "Achieve 90% team satisfaction score and 15% productivity increase",
          progress: 60,
          status: "in-progress"
        },
        {
          keyDeliverable: "Customer Service Excellence",
          activity: "Implement customer service improvements to enhance customer satisfaction and retention",
          timeline: "Q2 2025",
          supportDepartment: "Customer Service",
          successIndicator: "Increase customer satisfaction score to 4.5/5.0 and reduce complaints by 30%",
          progress: 0,
          status: "not-started"
        }
      ];
      
      // Create activities for the first few performance plans
      const plansToUpdate = performancePlans.slice(0, Math.min(3, performancePlans.length));
      
      for (let i = 0; i < plansToUpdate.length; i++) {
        const plan = plansToUpdate[i];
        const activityData = sampleActivities[i % sampleActivities.length];
        
        const newActivity = await prisma.performancePlanActivity.create({
          data: {
            performancePlanId: plan.id,
            keyDeliverable: activityData.keyDeliverable,
            activity: activityData.activity,
            timeline: activityData.timeline,
            supportDepartment: activityData.supportDepartment,
            successIndicator: activityData.successIndicator,
            progress: activityData.progress,
            status: activityData.status,
            createdBy: plan.employeeId
          }
        });
        
        console.log(`  ✅ Created activity: ${activityData.keyDeliverable} for ${plan.employee.firstName} ${plan.employee.lastName}`);
      }
    }
    
    // Final count
    const finalActivities = await prisma.performancePlanActivity.findMany();
    console.log(`\n🎉 Total activities in database: ${finalActivities.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndCreateActivities();
