const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

async function testCreatePerformancePlan() {
  try {
    console.log('🔍 Finding Tatenda\'s employee record...\n');
    
    // Get Tatenda's employee record
    const employee = await prisma.employees.findUnique({
      where: { email: 'tatenda@saywhat.org' },
      include: {
        departments: { select: { name: true } },
        employees: { 
          select: { 
            firstName: true, 
            lastName: true,
            id: true 
          } 
        },
        reviewer: {
          select: {
            firstName: true,
            lastName: true,
            id: true
          }
        },
        job_descriptions: {
          where: { isActive: true }
        }
      }
    });
    
    // Sort job descriptions in code
    if (employee && employee.job_descriptions && Array.isArray(employee.job_descriptions)) {
      employee.job_descriptions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    if (!employee) {
      console.log('❌ Employee not found');
      return;
    }

    console.log('✅ Found employee:', {
      id: employee.id,
      employeeId: employee.employeeId,
      name: `${employee.firstName} ${employee.lastName}`,
      email: employee.email,
      department: employee.departments?.name,
      supervisorId: employee.supervisor_id,
      supervisor: employee.employees ? `${employee.employees.firstName} ${employee.employees.lastName}` : 'Not assigned',
      reviewer: employee.reviewer ? `${employee.reviewer.firstName} ${employee.reviewer.lastName}` : 'Not assigned',
      hasJobDescription: employee.job_descriptions.length > 0
    });

    // Extract key responsibilities from job description
    let keyResponsibilities = [];
    if (employee.job_descriptions.length > 0 && employee.job_descriptions[0].keyResponsibilities) {
      const jdKeyResp = employee.job_descriptions[0].keyResponsibilities;
      if (Array.isArray(jdKeyResp)) {
        keyResponsibilities = jdKeyResp.map((resp, index) => ({
          description: resp.description || '',
          tasks: resp.tasks || '',
          weight: resp.weight || 0,
          targetDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString(),
          status: 'Not Started',
          progress: 0,
          comments: '',
          successIndicators: (resp.successIndicators || []).map(ind => ({
            indicator: ind.indicator || '',
            target: ind.target || '',
            measurement: ind.measurement || ''
          }))
        }));
      }
    }

    console.log(`\n📋 Found ${keyResponsibilities.length} key responsibilities from job description`);

    // Create performance plan
    console.log('\n💾 Creating performance plan...\n');
    
    const currentYear = new Date().getFullYear();
    const planId = crypto.randomUUID();
    
    // Check if supervisor exists
    if (!employee.supervisor_id) {
      console.log('\n⚠️  Warning: Employee has no supervisor assigned. Cannot create performance plan.');
      console.log('Please assign a supervisor to this employee first.\n');
      return;
    }
    
    // Get supervisor's user ID (foreign key constraint)
    const supervisor = await prisma.employees.findUnique({
      where: { id: employee.supervisor_id },
      select: { userId: true }
    });
    
    const plan = await prisma.performance_plans.create({
      data: {
        id: planId,
        employeeId: employee.id,
        supervisorId: supervisor?.userId || employee.supervisor_id,
        planYear: currentYear,
        planPeriod: `January ${currentYear} - December ${currentYear}`,
        status: 'draft',
        updatedAt: new Date(),
        reviewerId: null, // Set to null for now
        comments: JSON.stringify([])
      }
    });

    console.log('✅ Performance plan created:', {
      id: plan.id,
      planTitle: plan.planTitle,
      planYear: plan.planYear,
      status: plan.status,
      workflowStatus: plan.workflowStatus
    });

    // Create performance responsibilities
    if (keyResponsibilities.length > 0) {
      console.log(`\n📝 Creating ${keyResponsibilities.length} performance responsibilities...\n`);
      
      for (let i = 0; i < keyResponsibilities.length; i++) {
        const resp = keyResponsibilities[i];
        const created = await prisma.performance_responsibilities.create({
          data: {
            id: crypto.randomUUID(),
            planId: plan.id,
            description: resp.description,
            weight: resp.weight,
            targetDate: new Date(resp.targetDate),
            status: resp.status,
            progress: resp.progress,
            comments: resp.comments,
            tasks: resp.tasks,
            successIndicators: JSON.stringify(resp.successIndicators)
          }
        });
        
        console.log(`  ${i + 1}. Created responsibility: ${resp.description.substring(0, 50)}...`);
      }
    }

    // Verify the created plan
    console.log('\n🔍 Verifying created plan...\n');
    
    const verifyPlan = await prisma.performance_plans.findUnique({
      where: { id: plan.id },
      include: {
        employees: {
          select: {
            firstName: true,
            lastName: true,
            employeeId: true,
            email: true
          }
        },
        performance_responsibilities: {
          select: {
            id: true,
            description: true,
            weight: true,
            status: true,
            tasks: true
          }
        }
      }
    });

    console.log('✅ Plan verification:', {
      planId: verifyPlan.id,
      employee: `${verifyPlan.employees.firstName} ${verifyPlan.employees.lastName}`,
      employeeId: verifyPlan.employees.employeeId,
      responsibilitiesCount: verifyPlan.performance_responsibilities.length,
      totalWeight: verifyPlan.performance_responsibilities.reduce((sum, r) => sum + r.weight, 0)
    });

    console.log('\n✨ SUCCESS! Performance plan created and saved to database.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testCreatePerformancePlan();

