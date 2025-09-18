import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/hr/notifications/supervisors - Get supervisor hierarchy mapping
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = session.user?.permissions?.includes('hr.view') ||
                         session.user?.permissions?.includes('hr.full_access') ||
                         session.user?.roles?.some(role => ['SUPERUSER', 'ADMIN', 'HR_MANAGER', 'HR_SPECIALIST'].includes(role))

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const secretariat = searchParams.get('secretariat')

    // Build where clause for employees
    let whereClause: any = {
      status: 'ACTIVE',
      archived_at: null
    }

    if (secretariat) {
      whereClause.department = secretariat
    }

    // Get employees with their supervisors
    const employees = await prisma.employees.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        position: true,
        department: true,
        supervisor_id: true,
        departments: {
          select: {
            name: true
          }
        },
        employees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true
          }
        },
        other_employees: {
          where: {
            status: 'ACTIVE',
            archived_at: null
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true
          }
        }
      },
      orderBy: [
        { department: 'asc' },
        { position: 'asc' },
        { firstName: 'asc' }
      ]
    })

    // Group by secretariat/department
    const supervisorMapping = employees.reduce((acc: any, employee) => {
      const dept = employee.departments?.name || employee.department || 'Unassigned'
      
      if (!acc[dept]) {
        acc[dept] = {
          secretariat: dept,
          employees: [],
          supervisors: [],
          structure: []
        }
      }

      const employeeData = {
        id: employee.id,
        name: `${employee.firstName} ${employee.lastName}`,
        email: employee.email,
        position: employee.position,
        manager: employee.employees ? {
          id: employee.employees.id,
          name: `${employee.employees.firstName} ${employee.employees.lastName}`,
          email: employee.employees.email,
          position: employee.employees.position
        } : null,
        directReports: employee.other_employees?.length || 0
      }

      acc[dept].employees.push(employeeData)

      // Track supervisors (those with direct reports or specific positions)
      if (employee.other_employees?.length > 0 || 
          employee.position?.toLowerCase().includes('manager') ||
          employee.position?.toLowerCase().includes('supervisor') ||
          employee.position?.toLowerCase().includes('director') ||
          employee.position?.toLowerCase().includes('head')) {
        acc[dept].supervisors.push(employeeData)
      }

      return acc
    }, {})

    // Calculate hierarchy structure for each department
    Object.keys(supervisorMapping).forEach(dept => {
      const deptData = supervisorMapping[dept]
      
      // Build hierarchy tree
      const hierarchy = buildHierarchy(deptData.employees)
      deptData.structure = hierarchy
      
      // Calculate statistics
      deptData.statistics = {
        totalEmployees: deptData.employees.length,
        totalSupervisors: deptData.supervisors.length,
        averageSpanOfControl: deptData.supervisors.length > 0 ? 
          Math.round(deptData.employees.length / deptData.supervisors.length) : 0,
        hierarchyLevels: calculateHierarchyDepth(hierarchy)
      }
    })

    return NextResponse.json({
      success: true,
      data: supervisorMapping
    })

  } catch (error) {
    console.error('Error fetching supervisor hierarchy:', error)
    return NextResponse.json(
      { error: 'Failed to fetch supervisor hierarchy' },
      { status: 500 }
    )
  }
}

// Helper function to build hierarchy tree
function buildHierarchy(employees: any[]) {
  const employeeMap = new Map()
  const roots: any[] = []

  // Create map of all employees
  employees.forEach(emp => {
    employeeMap.set(emp.id, { ...emp, children: [] })
  })

  // Build parent-child relationships
  employees.forEach(emp => {
    const employee = employeeMap.get(emp.id)
    if (emp.manager && employeeMap.has(emp.manager.id)) {
      const manager = employeeMap.get(emp.manager.id)
      manager.children.push(employee)
    } else {
      roots.push(employee)
    }
  })

  return roots
}

// Helper function to calculate hierarchy depth
function calculateHierarchyDepth(hierarchy: any[]): number {
  if (!hierarchy || hierarchy.length === 0) return 0
  
  let maxDepth = 1
  
  hierarchy.forEach(node => {
    if (node.children && node.children.length > 0) {
      const childDepth = calculateHierarchyDepth(node.children)
      maxDepth = Math.max(maxDepth, 1 + childDepth)
    }
  })
  
  return maxDepth
}