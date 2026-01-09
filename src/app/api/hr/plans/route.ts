import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get all performance plans
    const plans = await prisma.performance_plans.findMany({
      include: {
        employees: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true,
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
      }
    });

    return NextResponse.json({ plans, success: true });
  } catch (error) {
    console.error("Error fetching performance plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch performance plans", success: false },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { formData, isDraft } = body;

    console.log('📝 Creating performance plan:', {
      employee: formData.employee,
      isDraft,
      planYear: formData.planYear
    });

    // Validate required fields
    if (!formData.employee?.id) {
      return NextResponse.json(
        { error: 'Employee ID is required', success: false },
        { status: 400 }
      );
    }

    // Get employee record to get the database ID
    const employee = await prisma.employees.findFirst({
      where: {
        OR: [
          { employeeId: formData.employee.id },
          { id: formData.employee.id }
        ]
      },
      select: {
        id: true,
        employeeId: true,
        supervisor_id: true,
        reviewer_id: true
      }
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found', success: false },
        { status: 404 }
      );
    }

    // Determine status
    const status = isDraft ? 'draft' : 'submitted';

    // Get supervisor user ID (performance_plans.supervisorId is a foreign key to users table)
    // supervisor_id is an employee ID, so we need to get the employee first, then their userId
    let supervisorUserId = null;
    if (employee.supervisor_id) {
      const supervisorEmployee = await prisma.employees.findUnique({
        where: { id: employee.supervisor_id },
        select: { userId: true }
      });
      if (supervisorEmployee?.userId) {
        supervisorUserId = supervisorEmployee.userId;
      }
    }

    if (!supervisorUserId) {
      return NextResponse.json(
        { error: 'Employee must have a supervisor with a user account to create a performance plan', success: false },
        { status: 400 }
      );
    }

    // Prepare plan data matching the actual schema
    const currentYear = new Date().getFullYear();
    const planYear = formData.planYear ? parseInt(formData.planYear) : currentYear;
    
    // Handle planPeriod - it might come as an object with startDate/endDate or as a string
    let planPeriod: string;
    if (typeof formData.planPeriod === 'string') {
      planPeriod = formData.planPeriod;
    } else if (formData.planPeriod && typeof formData.planPeriod === 'object') {
      // If it's an object, convert to string format
      const startDate = formData.planPeriod.startDate || '';
      const endDate = formData.planPeriod.endDate || '';
      if (startDate && endDate) {
        planPeriod = `${startDate} - ${endDate}`;
      } else {
        planPeriod = `January ${planYear} - December ${planYear}`;
      }
    } else {
      planPeriod = `January ${planYear} - December ${planYear}`;
    }
    
    console.log('📝 Plan period resolved:', planPeriod);
    
    // Check for existing draft plan for this employee and period
    const existingDraft = await prisma.performance_plans.findFirst({
      where: {
        employeeId: employee.id,
        planYear: planYear,
        planPeriod: planPeriod,
        status: 'draft'
      },
      include: {
        performance_responsibilities: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    let plan;
    
    // If draft exists and we're saving as draft, update it instead of creating new
    if (existingDraft && isDraft) {
      console.log('📝 Found existing draft plan, updating:', existingDraft.id);
      
      // Update existing draft
      plan = await prisma.performance_plans.update({
        where: { id: existingDraft.id },
        data: {
          status: 'draft',
          updatedAt: new Date()
        },
        include: {
          performance_responsibilities: true
        }
      });

      // Update or create responsibilities
      if (formData.keyResponsibilities && formData.keyResponsibilities.length > 0) {
        // Delete existing responsibilities
        await prisma.performance_responsibilities.deleteMany({
          where: { planId: plan.id }
        });

        // Create new responsibilities
        for (const responsibility of formData.keyResponsibilities) {
          const respData = {
            id: crypto.randomUUID(),
            planId: plan.id,
            title: responsibility.description?.substring(0, 100) || 'Responsibility',
            description: responsibility.description || '',
            weight: responsibility.weight || 0,
            updatedAt: new Date()
          };

          await prisma.performance_responsibilities.create({
            data: respData
          });
        }
      }

      console.log('✅ Performance plan draft updated:', plan.id);
    } else {
      // Check if there's a submitted plan for the same period (unless we're updating a draft)
      if (!existingDraft) {
        const existingSubmitted = await prisma.performance_plans.findFirst({
          where: {
            employeeId: employee.id,
            planYear: planYear,
            planPeriod: planPeriod,
            status: { in: ['submitted', 'active', 'approved'] }
          }
        });

        if (existingSubmitted) {
          return NextResponse.json({
            success: false,
            error: 'A plan for this period already exists and has been submitted. Please edit the existing plan instead.',
            existingPlanId: existingSubmitted.id
          }, { status: 400 });
        }
      }

      // Get reviewer user ID if employee has a reviewer
      let reviewerUserId = null;
      if (employee.reviewer_id) {
        const reviewerEmployee = await prisma.employees.findUnique({
          where: { id: employee.reviewer_id },
          select: { userId: true }
        });
        if (reviewerEmployee?.userId) {
          reviewerUserId = reviewerEmployee.userId;
        }
      }

      const planData = {
        id: crypto.randomUUID(),
        employeeId: employee.id,
        supervisorId: supervisorUserId, // This must be a user ID, not an employee ID
        planYear: planYear,
        planPeriod: planPeriod,
        status,
        updatedAt: new Date(),
        reviewerId: reviewerUserId, // This must be a user ID, not an employee ID
        comments: JSON.stringify([])
      };

      console.log('💾 Saving plan to database:', planData);

      // Create the performance plan
      plan = await prisma.performance_plans.create({
        data: planData
      });

      console.log('✅ Performance plan created:', plan.id);
    }

    console.log('✅ Performance plan created:', plan.id);

    // Create performance responsibilities (key responsibilities)
    if (formData.keyResponsibilities && formData.keyResponsibilities.length > 0) {
      console.log(`📋 Creating ${formData.keyResponsibilities.length} key responsibilities`);
      
      for (const responsibility of formData.keyResponsibilities) {
        const respData = {
          id: crypto.randomUUID(),
          planId: plan.id,
          title: responsibility.description?.substring(0, 100) || 'Responsibility',
          description: responsibility.description || '',
          weight: responsibility.weight || 0,
          updatedAt: new Date()
        };

        await prisma.performance_responsibilities.create({
          data: respData
        });
      }
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: isDraft ? 'Performance plan saved as draft' : 'Performance plan submitted successfully',
      planId: plan.id,
      plan: {
        id: plan.id,
        planYear: plan.planYear,
        status: plan.status
      }
    });

  } catch (error) {
    console.error("❌ Error creating performance plan:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to create performance plan",
        success: false 
      },
      { status: 500 }
    );
  }
}
