import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

// Performance Appraisal Creation
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

    const body = await request.json();
    const { 
      planId, 
      reviewerId, 
      appraisalType, 
      selfAssessments, 
      valueGoalsAssessments,
      electronicSignature 
    } = body;

    // Get performance plan with key responsibilities
    const performancePlan = await prisma.performance_plans.findFirst({
      where: { 
        id: planId,
        employeeId: employee.id 
      },
      include: {
        performance_responsibilities: {
          include: {
            performance_activities: true
          }
        }
      }
    });

    if (!performancePlan) {
      return NextResponse.json(
        { error: 'Performance plan not found' }, 
        { status: 404 }
      );
    }

    // Check for existing draft appraisal for this employee, plan, and type
    const existingDraft = await prisma.performance_appraisals.findFirst({
      where: {
        employeeId: employee.id,
        planId: planId,
        appraisalType: appraisalType,
        status: 'draft'
      },
      include: {
        performance_plans: {
          select: {
            planYear: true,
            planPeriod: true
          }
        }
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
        message: 'Existing draft found. Continuing from saved draft.',
        appraisal: {
          id: existingDraft.id,
          employeeId: existingDraft.employeeId,
          planId: existingDraft.planId,
          supervisorId: existingDraft.supervisorId,
          appraisalType: existingDraft.appraisalType,
          status: existingDraft.status,
          selfAssessments: existingDraft.selfAssessments,
          valueGoalsAssessments: existingDraft.valueGoalsAssessments,
          createdAt: existingDraft.createdAt,
          updatedAt: existingDraft.updatedAt
        }
      });
    }

    // Check if there's a submitted appraisal for the same period (prevent duplicates)
    const existingSubmitted = await prisma.performance_appraisals.findFirst({
      where: {
        employeeId: employee.id,
        planId: planId,
        appraisalType: appraisalType,
        status: { in: ['submitted', 'approved', 'supervisor_approved', 'reviewer_approved'] }
      }
    });

    if (existingSubmitted) {
      return NextResponse.json({
        success: false,
        error: 'An appraisal for this period already exists and has been submitted. Please edit the existing appraisal instead.',
        existingAppraisalId: existingSubmitted.id
      }, { status: 400 });
    }

    // Standard Values for all employees
    const standardValues = [
      'Teamwork',
      'Responsiveness and effectiveness',
      'Accountability',
      'Professionalism and Integrity',
      'Innovation'
    ];

    // Get supervisor user ID
    const supervisorEmployee = employee.supervisor_id 
      ? await prisma.employees.findUnique({
          where: { id: employee.supervisor_id },
          select: { userId: true }
        })
      : null;

    const supervisorUserId = supervisorEmployee?.userId || reviewerId || employee.supervisor_id;

    // Create performance appraisal only if no draft exists
    const appraisal = await prisma.performance_appraisals.create({
      data: {
        id: randomUUID(),
        employeeId: employee.id,
        planId: planId,
        supervisorId: supervisorUserId,
        appraisalType: appraisalType, // annual, quarterly, probation
        status: 'draft',
        selfAssessments: selfAssessments || {},
        valueGoalsAssessments: valueGoalsAssessments || {},
        electronicSignature: electronicSignature,
        updatedAt: new Date()
      }
    });

    // Create audit trail
    await prisma.audit_logs.create({
      data: {
        id: randomUUID(),
        userId: employee.id,
        action: 'CREATE',
        details: `Created performance appraisal for ${appraisalType}`,
        resource: 'PerformanceAppraisal',
        resourceId: appraisal.id,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    // Return the created appraisal
    return NextResponse.json({
      success: true,
      appraisal: {
        id: appraisal.id,
        employeeId: appraisal.employeeId,
        planId: appraisal.planId,
        supervisorId: appraisal.supervisorId,
        appraisalType: appraisal.appraisalType,
        status: appraisal.status,
        selfAssessments: appraisal.selfAssessments,
        valueGoalsAssessments: appraisal.valueGoalsAssessments,
        createdAt: appraisal.createdAt,
        updatedAt: appraisal.updatedAt
      }
    });

  } catch (error) {
    console.error('Error creating performance appraisal:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// Helper function to get points based on rating
function getSelfRatingPoints(rating: string): number {
  const ratingPoints: { [key: string]: number } = {
    'A1': 50, // Outstanding performance. High levels of expertise
    'A2': 40, // Consistently exceeds requirements
    'B1': 30, // Meets requirements. Occasionally exceeds them
    'B2': 25, // Meets requirements
    'C1': 15, // Partially meets requirements. Improvement required
    'C2': 10  // Unacceptable. Well below standard required
  };
  return ratingPoints[rating] || 25;
}

// GET: Fetch performance appraisals
export async function GET() {
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

    // Fetch appraisals where employee is the subject, supervisor, or reviewer
    const appraisals = await prisma.performance_appraisals.findMany({
      where: {
        OR: [
          { employeeId: employee.id },
          { supervisorId: employee.id },
          { reviewerId: employee.id }
        ]
      },
      include: {
        performance_responsibility_assessments: true,
        performance_value_assessments: true,
        employees: {
          select: {
            firstName: true,
            lastName: true,
            employeeId: true,
            position: true
          }
        },
        users_performance_appraisals_supervisorIdTousers: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        users_performance_appraisals_reviewerIdTousers: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        performance_plans: {
          select: {
            planYear: true,
            performance_responsibilities: {
              include: {
                performance_activities: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Helper function to calculate overall rating from categories
    const calculateOverallRatingFromCategories = (comments: any): number | null => {
      if (!comments) return null;
      
      try {
        let parsedComments = comments;
        if (typeof comments === 'string') {
          parsedComments = JSON.parse(comments);
        }
        
        // Check if categories are in ratings.categories or performance.categories
        const categories = parsedComments?.ratings?.categories || parsedComments?.performance?.categories;
        
        if (!Array.isArray(categories) || categories.length === 0) {
          return null;
        }
        
        // Calculate weighted average: sum((rating * weight)) / sum(weights)
        const totalWeight = categories.reduce((sum: number, cat: any) => sum + (cat.weight || 0), 0);
        const weightedScore = categories.reduce((sum: number, cat: any) => sum + ((cat.rating || 0) * (cat.weight || 0)), 0);
        
        if (totalWeight > 0) {
          return parseFloat((weightedScore / totalWeight).toFixed(2));
        }
      } catch (error) {
        console.error('Error calculating overall rating from categories:', error);
      }
      
      return null;
    };

    // Transform appraisals to include approval status fields (like plans)
    const transformedAppraisals = appraisals.map((appraisal) => {
      // Calculate overall rating from categories if overallRating is 0, null, or missing
      let calculatedOverallRating = appraisal.overallRating;
      if (!calculatedOverallRating || calculatedOverallRating === 0) {
        const categoryRating = calculateOverallRatingFromCategories(appraisal.comments);
        if (categoryRating !== null) {
          calculatedOverallRating = categoryRating;
        }
      }
      
      return {
        ...appraisal,
        overallRating: calculatedOverallRating, // Use calculated rating if available
        supervisorApproval: appraisal.supervisorApprovedAt ? 'approved' : 'pending',
        reviewerApproval: appraisal.reviewerApprovedAt ? 'approved' : 'pending',
        // Ensure submittedAt is included
        submittedAt: appraisal.submittedAt,
        supervisorApprovedAt: appraisal.supervisorApprovedAt,
        reviewerApprovedAt: appraisal.reviewerApprovedAt
      };
    });

    // Next.js automatically serializes Date objects to ISO strings in JSON responses
    return NextResponse.json(transformedAppraisals);

  } catch (error) {
    console.error('Error fetching performance appraisals:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
