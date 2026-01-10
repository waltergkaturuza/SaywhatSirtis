import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

// Performance Plan Creation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' }, 
        { status: 401 }
      );
    }

    // First find the user by email
    const user = await prisma.users.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      );
    }

    // Then find the employee record
    const employee = await prisma.employees.findUnique({
      where: { userId: user.id }
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee profile not found' }, 
        { status: 404 }
      );
    }

    // Check if employee has a supervisor
    if (!employee.supervisor_id) {
      return NextResponse.json(
        { error: 'Employee must have a supervisor assigned for performance planning' }, 
        { status: 400 }
      );
    }

    // Find the supervisor's user ID
    const supervisorEmployee = await prisma.employees.findUnique({
      where: { id: employee.supervisor_id },
      include: { users: true }
    });

    if (!supervisorEmployee || !supervisorEmployee.users) {
      return NextResponse.json(
        { error: 'Supervisor user account not found' }, 
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.planYear) {
      return NextResponse.json(
        { error: 'Plan year is required' }, 
        { status: 400 }
      );
    }

    // Check for existing draft plan for this employee and period
    const planYear = parseInt(body.planYear);
    const planPeriod = body.planPeriod || 'Annual';
    
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

    // If draft exists, return it instead of creating a new one
    if (existingDraft) {
      return NextResponse.json({
        success: true,
        existing: true,
        message: 'Existing draft plan found. Continuing from saved draft.',
        plan: existingDraft
      });
    }

    // Check if there's a submitted plan for the same period
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

    // Generate key responsibilities based on position
    const defaultResponsibilities = getDefaultResponsibilities(employee.position || 'General Employee');
    
    // Create performance plan only if no draft exists
    const performancePlan = await prisma.performance_plans.create({
      data: {
        id: randomUUID(),
        employeeId: employee.id,
        supervisorId: supervisorEmployee.users.id,
        planYear: planYear,
        planPeriod: planPeriod,
        status: 'draft',
        updatedAt: new Date(),
        performance_responsibilities: {
          create: defaultResponsibilities.map((resp, index) => ({
            id: randomUUID(),
            title: `Key Responsibility ${index + 1}`,
            description: resp.description,
            weight: resp.weight,
            updatedAt: new Date()
          }))
        }
      },
      include: {
        performance_responsibilities: true,
        employees: true,
        users_performance_plans_supervisorIdTousers: true
      }
    });

    // Create audit trail
    await prisma.audit_logs.create({
      data: {
        id: randomUUID(),
        userId: employee.id,
        action: 'CREATE',
        resource: 'PerformancePlan',
        resourceId: performancePlan.id,
        details: {
          module: 'Performance Management',
          planYear: body.planYear,
          responsibilitiesCount: defaultResponsibilities.length
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    return NextResponse.json(performancePlan);

  } catch (error) {
    console.error('Error creating performance plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// GET: Fetch employee's performance plans
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' }, 
        { status: 401 }
      );
    }

    // First find the user by email
    const user = await prisma.users.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      );
    }

    // Then find the employee record
    const employee = await prisma.employees.findUnique({
      where: { userId: user.id }
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee profile not found' }, 
        { status: 404 }
      );
    }

    // Optional year filter
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');
    const yearFilter = yearParam ? parseInt(yearParam) : undefined;

    // Fetch performance plans (include responsibilities and activities)
    const performancePlans = await prisma.performance_plans.findMany({
      where: {
        employeeId: employee.id,
        ...(yearFilter ? { planYear: yearFilter } : {})
      },
      include: {
        performance_responsibilities: {
          include: {
            performance_activities: true
          }
        },
        employees: true,
        users_performance_plans_supervisorIdTousers: true
      },
      orderBy: { planYear: 'desc' }
    });

    // Next.js automatically serializes Date objects to ISO strings in JSON responses
    // Return the plans as-is - dates will be serialized correctly
    return NextResponse.json(performancePlans);

  } catch (error) {
    console.error('Error fetching performance plans:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// Helper function to get default responsibilities based on position
function getDefaultResponsibilities(position: string): Array<{description: string, weight: number}> {
  const commonResponsibilities = [
    { description: 'Deliver high-quality work outputs within agreed timelines', weight: 25 },
    { description: 'Collaborate effectively with team members and stakeholders', weight: 20 },
    { description: 'Maintain professional standards and organizational values', weight: 15 },
    { description: 'Continuously develop skills and knowledge relevant to role', weight: 15 },
    { description: 'Support organizational objectives and initiatives', weight: 25 }
  ];

  // Customize based on position type
  if (position?.toLowerCase().includes('manager') || position?.toLowerCase().includes('supervisor')) {
    return [
      { description: 'Lead and develop team members effectively', weight: 30 },
      { description: 'Achieve departmental goals and objectives', weight: 25 },
      { description: 'Manage resources efficiently and effectively', weight: 20 },
      { description: 'Foster positive team culture and collaboration', weight: 15 },
      { description: 'Drive continuous improvement initiatives', weight: 10 }
    ];
  }
  
  if (position?.toLowerCase().includes('senior')) {
    return [
      { description: 'Deliver complex technical/professional solutions', weight: 30 },
      { description: 'Mentor junior staff and share knowledge', weight: 20 },
      { description: 'Lead project initiatives and deliverables', weight: 25 },
      { description: 'Maintain expert-level competency in field', weight: 15 },
      { description: 'Support strategic decision-making processes', weight: 10 }
    ];
  }
  
  return commonResponsibilities;
}
