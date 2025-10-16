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
        supervisorId: true
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
    const supervisorEmployee = await prisma.employees.findUnique({
      where: { id: employee.supervisor_id || '' },
      select: { userId: true }
    });

    // Prepare plan data matching the actual schema
    const currentYear = new Date().getFullYear();
    const planYear = formData.planYear ? parseInt(formData.planYear) : currentYear;
    
    const planData = {
      id: crypto.randomUUID(),
      employeeId: employee.id,
      supervisorId: supervisorEmployee?.userId || employee.supervisor_id,
      planYear: planYear,
      planPeriod: `January ${planYear} - December ${planYear}`,
      status,
      updatedAt: new Date(),
      reviewerId: null, // Set to null unless formData provides a valid user ID
      comments: JSON.stringify([])
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
