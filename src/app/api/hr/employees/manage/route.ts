import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has HR permissions
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! }
    })

    if (!user || !['HR', 'ADMIN'].includes(user.department || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get all employees
    const employees = await prisma.employee.findMany({
      orderBy: {
        lastName: 'asc'
      }
    })

    const employeesWithManagementInfo = employees.map(employee => ({
      id: employee.id,
      name: `${employee.firstName} ${employee.lastName}`,
      email: employee.email || `${employee.firstName.toLowerCase()}.${employee.lastName.toLowerCase()}@saywhat.org`,
      phone: employee.phoneNumber || '+234-XXX-XXX-XXXX',
      staffId: `SW${employee.id.toString().padStart(3, '0')}`,
      position: employee.position || 'Employee',
      secretariat: employee.department || 'Unassigned',
      supervisor: 'To be determined', // Placeholder - would need supervisor relationship
      accessLevel: employee.department === 'HR' ? 'HR Administrator' : 
                   employee.department === 'ADMIN' ? 'System Administrator' :
                   employee.position?.includes('Manager') ? 'Department Admin' : 'Standard User',
      permissions: employee.department === 'HR' ? ['hr.full_access', 'users.manage', 'reports.generate'] :
                   employee.department === 'ADMIN' ? ['*'] :
                   employee.position?.includes('Manager') ? ['department.manage', 'hr.view', 'team.manage'] :
                   [`${(employee.department || 'general').toLowerCase()}.view`],
      status: employee.status || 'active',
      joinDate: employee.startDate?.toISOString().split('T')[0] || employee.createdAt.toISOString().split('T')[0],
      lastLogin: 'To be implemented', // Would need to track login times
      performanceRating: Math.floor(Math.random() * 20 + 30) / 10, // Placeholder - would need performance data
      profileImage: "/api/placeholder/32/32"
    }))

    return NextResponse.json(employeesWithManagementInfo)
  } catch (error) {
    console.error('Error fetching employees for management:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
