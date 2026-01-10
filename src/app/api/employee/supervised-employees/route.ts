import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: Fetch employees supervised/reviewed by the current user with their plans and appraisals
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' }, 
        { status: 401 }
      );
    }

    // Find the user
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      include: {
        employees: {
          select: {
            id: true,
            is_supervisor: true,
            is_reviewer: true
          }
        }
      }
    });

    if (!user || !user.employees) {
      return NextResponse.json(
        { error: 'Employee profile not found' }, 
        { status: 404 }
      );
    }

    const employee = user.employees;
    const isSupervisor = employee.is_supervisor || false;
    const isReviewer = employee.is_reviewer || false;

    if (!isSupervisor && !isReviewer) {
      return NextResponse.json({
        isSupervisor: false,
        isReviewer: false,
        employees: []
      });
    }

    // Fetch employees supervised by this user
    let supervisedEmployees: any[] = [];
    let reviewedEmployees: any[] = [];

    if (isSupervisor) {
      supervisedEmployees = await prisma.employees.findMany({
        where: {
          supervisor_id: employee.id
        },
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
          },
          performance_plans: {
            select: {
              id: true,
              planTitle: true,
              planYear: true,
              planPeriod: true,
              status: true,
              workflowStatus: true,
              submittedAt: true,
              supervisorApprovedAt: true,
              reviewerApprovedAt: true,
              createdAt: true,
              updatedAt: true
            },
            orderBy: [
              { submittedAt: 'desc' },
              { createdAt: 'desc' }
            ]
          },
          performance_appraisals: {
            select: {
              id: true,
              appraisalType: true,
              status: true,
              overallRating: true,
              submittedAt: true,
              supervisorApprovedAt: true,
              reviewerApprovedAt: true,
              createdAt: true,
              updatedAt: true,
              performance_plans: {
                select: {
                  planTitle: true,
                  planYear: true,
                  planPeriod: true
                }
              }
            },
            orderBy: [
              { submittedAt: 'desc' },
              { createdAt: 'desc' }
            ]
          }
        }
      });
    }

    if (isReviewer) {
      reviewedEmployees = await prisma.employees.findMany({
        where: {
          reviewer_id: employee.id
        },
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
          },
          performance_plans: {
            select: {
              id: true,
              planTitle: true,
              planYear: true,
              planPeriod: true,
              status: true,
              workflowStatus: true,
              submittedAt: true,
              supervisorApprovedAt: true,
              reviewerApprovedAt: true,
              createdAt: true,
              updatedAt: true
            },
            orderBy: [
              { submittedAt: 'desc' },
              { createdAt: 'desc' }
            ]
          },
          performance_appraisals: {
            select: {
              id: true,
              appraisalType: true,
              status: true,
              overallRating: true,
              submittedAt: true,
              supervisorApprovedAt: true,
              reviewerApprovedAt: true,
              createdAt: true,
              updatedAt: true,
              performance_plans: {
                select: {
                  planTitle: true,
                  planYear: true,
                  planPeriod: true
                }
              }
            },
            orderBy: [
              { submittedAt: 'desc' },
              { createdAt: 'desc' }
            ]
          }
        }
      });
    }

    // Combine and deduplicate employees (in case someone is both supervised and reviewed)
    const allEmployeesMap = new Map();
    
    supervisedEmployees.forEach(emp => {
      allEmployeesMap.set(emp.id, {
        ...emp,
        relationship: 'supervised'
      });
    });

    reviewedEmployees.forEach(emp => {
      if (allEmployeesMap.has(emp.id)) {
        // Employee is both supervised and reviewed
        const existing = allEmployeesMap.get(emp.id);
        const existingPlanIds = new Set((existing.performance_plans || []).map((p: any) => p.id));
        const existingAppraisalIds = new Set((existing.performance_appraisals || []).map((a: any) => a.id));
        
        // Merge plans and appraisals, deduplicating by ID
        const mergedPlans = [
          ...(existing.performance_plans || []),
          ...(emp.performance_plans || []).filter((p: any) => !existingPlanIds.has(p.id))
        ];
        const mergedAppraisals = [
          ...(existing.performance_appraisals || []),
          ...(emp.performance_appraisals || []).filter((a: any) => !existingAppraisalIds.has(a.id))
        ];
        
        allEmployeesMap.set(emp.id, {
          ...existing,
          relationship: 'both',
          performance_plans: mergedPlans,
          performance_appraisals: mergedAppraisals
        });
      } else {
        allEmployeesMap.set(emp.id, {
          ...emp,
          relationship: 'reviewed'
        });
      }
    });

    const employees = Array.from(allEmployeesMap.values()).map(emp => ({
      id: emp.id,
      employeeId: emp.employeeId,
      name: `${emp.firstName} ${emp.lastName}`,
      email: emp.email,
      position: emp.position,
      department: emp.departments?.name || 'Unassigned',
      relationship: emp.relationship,
      plans: emp.performance_plans || [],
      appraisals: emp.performance_appraisals || [],
      plansCount: (emp.performance_plans || []).length,
      appraisalsCount: (emp.performance_appraisals || []).length,
      pendingPlans: (emp.performance_plans || []).filter((p: any) => 
        p.status === 'submitted' || p.workflowStatus === 'pending_supervisor_approval' || p.workflowStatus === 'pending_reviewer_approval'
      ).length,
      pendingAppraisals: (emp.performance_appraisals || []).filter((a: any) => 
        a.status === 'submitted' || a.status === 'pending_supervisor_approval' || a.status === 'pending_reviewer_approval'
      ).length
    }));

    return NextResponse.json({
      isSupervisor,
      isReviewer,
      employees
    });

  } catch (error) {
    console.error('Error fetching supervised employees:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
