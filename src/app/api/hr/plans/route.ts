import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
        supervisorId: true
      }
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found', success: false },
        { status: 404 }
      );
    }

    // Determine status and workflow status
    const status = isDraft ? 'draft' : 'submitted';
    const workflowStatus = isDraft ? 'draft' : 'supervisor_review';

    // Prepare plan data
    const planData = {
      employeeId: employee.id,
      planYear: formData.planYear || new Date().getFullYear().toString(),
      planTitle: formData.planTitle || `Performance Plan ${formData.planYear || new Date().getFullYear()}`,
      startDate: formData.reviewPeriod?.startDate ? new Date(formData.reviewPeriod.startDate) : new Date(),
      endDate: formData.reviewPeriod?.endDate ? new Date(formData.reviewPeriod.endDate) : new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      status,
      workflowStatus,
      supervisorId: formData.supervisorId || employee.supervisorId,
      reviewerId: formData.reviewerId || null,
      comments: formData.comments ? JSON.stringify([]) : null,
      createdBy: session.user.email || 'system',
      updatedBy: session.user.email || 'system'
    };

    console.log('💾 Saving plan to database:', planData);

    // Create the performance plan
    const plan = await prisma.performance_plans.create({
      data: planData
    });

    console.log('✅ Performance plan created:', plan.id);

    // Create performance responsibilities (key responsibilities)
    if (formData.keyResponsibilities && formData.keyResponsibilities.length > 0) {
      console.log(`📋 Creating ${formData.keyResponsibilities.length} key responsibilities`);
      
      for (const responsibility of formData.keyResponsibilities) {
        const respData = {
          planId: plan.id,
          description: responsibility.description || '',
          weight: responsibility.weight || 0,
          targetDate: responsibility.targetDate ? new Date(responsibility.targetDate) : null,
          status: responsibility.status || 'Not Started',
          progress: responsibility.progress || 0,
          comments: responsibility.comments || '',
          tasks: responsibility.tasks || '',
          successIndicators: responsibility.successIndicators ? JSON.stringify(responsibility.successIndicators) : null
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
        status: plan.status,
        workflowStatus: plan.workflowStatus
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
