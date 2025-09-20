import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    let departments: Array<{id: string, name: string, code: string | null, employees: any[]}> = []
    
    try {
      // Get all departments with hierarchical structure
      const departmentsData = await prisma.departments.findMany({
        where: {
          isActive: true
        },
        select: {
          id: true,
          name: true,
          code: true,
          parentId: true,
          description: true,
          departments: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          other_departments: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          employees: {
            where: {
              status: 'ACTIVE'
            },
            select: {
              id: true,
              performance_plans: {
                where: {
                  status: 'ACTIVE',
                  planYear: new Date().getFullYear()
                },
                select: {
                  id: true,
                  status: true
                }
              }
            }
          }
        },
        orderBy: [
          { parentId: 'asc' },
          { name: 'asc' }
        ]
      })

      // Transform to match performance plans sidebar expectations with hierarchy info
      departments = departmentsData.map(dept => {
        const totalEmployees = dept.employees.length
        const employeesWithPlans = dept.employees.filter(emp => emp.performance_plans.length > 0).length
        const avgCompletionRate = totalEmployees > 0 
          ? dept.employees
              .filter(emp => emp.performance_plans.length > 0)
              .reduce((acc, emp) => {
                const latestPlan = emp.performance_plans[0]
                const isCompleted = latestPlan?.status === 'completed' ? 100 : 0
                return acc + isCompleted
              }, 0) / Math.max(employeesWithPlans, 1)
          : 0

        // Determine department type and display name
        const isSubunit = !!dept.parentId
        const displayName = isSubunit && dept.departments
          ? `${dept.departments.name} → ${dept.name}`
          : dept.name

        return {
          id: dept.id,
          name: dept.name,
          code: dept.code,
          displayName: displayName,
          type: isSubunit ? 'subunit' : 'main_department',
          parentDepartment: dept.departments,
          subDepartments: dept.other_departments,
          employees: dept.employees,
          totalEmployees,
          employeesWithPlans,
          completionRate: Math.round(avgCompletionRate)
        }
      })
        
    } catch (dbError: any) {
      console.error('Database connection failed:', dbError?.message || 'Unknown error')
      
      // Return empty departments array when database is unavailable
      departments = []
    }

    // Transform departments data with actual performance statistics
    const departmentCounts = departments.map(dept => {
      const totalEmployees = dept.employees?.length || 0
      const employeesWithPlans = dept.employees?.filter(emp => emp.performance_plans?.length > 0).length || 0
      
      // Calculate completion rate based on completed performance plans
      const avgCompletionRate = employeesWithPlans > 0 
        ? Math.round(dept.employees
            .filter(emp => emp.performance_plans?.length > 0)
            .reduce((acc, emp) => {
              const latestPlan = emp.performance_plans?.[0]
              const isCompleted = latestPlan?.status === 'completed' ? 100 : 0
              return acc + isCompleted
            }, 0) / employeesWithPlans)
        : 0
      
      return {
        id: dept.id,
        name: dept.name,
        code: dept.code,
        employeeCount: totalEmployees,
        completionRate: avgCompletionRate,
        totalPlans: employeesWithPlans,
        completedPlans: Math.floor(employeesWithPlans * avgCompletionRate / 100)
      }
    })

    // Sort by completion rate descending
    departmentCounts.sort((a, b) => b.completionRate - a.completionRate)

    return NextResponse.json({
      success: true,
      departments: departmentCounts,
      message: 'Departments retrieved successfully'
    })

  } catch (error) {
    console.error('Error fetching departments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    )
  }
}
