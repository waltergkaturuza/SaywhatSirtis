import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = session.user?.permissions?.includes('hr.view') ||
                         session.user?.permissions?.includes('hr.full_access') ||
                         session.user?.roles?.includes('admin') ||
                         session.user?.roles?.includes('hr_manager') ||
                         session.user?.roles?.includes('hr_staff')

    if (!hasPermission) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 })
    }

    console.log('Fetching potential supervisors...')
    
    // Simple query first - get all active users
    const allUsers = await prisma.users.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        position: true,
        department: true,
        email: true
      },
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' }
      ]
    })

    console.log('Found', allUsers.length, 'total users')
    
    // Filter for potential supervisors (those with supervisory positions)
    const potentialSupervisors = allUsers.filter(user => {
      if (!user.position) return false
      const position = user.position.toLowerCase()
      return position.includes('manager') || 
             position.includes('supervisor') || 
             position.includes('director') ||
             position.includes('lead') ||
             position.includes('head') ||
             position.includes('admin')
    })

    console.log('Found', potentialSupervisors.length, 'potential supervisors')
    
    // Get corresponding employee records to check supervisor status
    console.log('Fetching employee records...')
    let employeeRecords = []
    
    if (potentialSupervisors.length > 0) {
      try {
        employeeRecords = await prisma.employees.findMany({
          where: {
            userId: { in: potentialSupervisors.map(u => u.id) }
          },
          select: {
            userId: true,
            is_supervisor: true,
            is_reviewer: true
          }
        })
      } catch (empError) {
        console.error('Error fetching employee records:', empError)
        // Continue without employee records
      }
    }

    console.log('Found', employeeRecords.length, 'employee records')
    
    const employeeMap = new Map(employeeRecords.map(emp => [emp.userId, emp]))

    // Merge the data
    const supervisors = potentialSupervisors.map(user => ({
      id: user.id,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      position: user.position || '',
      department: user.department || '',
      email: user.email || '',
      isSupervisor: employeeMap.get(user.id)?.is_supervisor || false,
      isReviewer: employeeMap.get(user.id)?.is_reviewer || false
    }))

    console.log('Returning', supervisors.length, 'supervisors')

    return NextResponse.json({
      success: true,
      data: supervisors
    })

  } catch (error) {
    console.error('Error in supervisors API:', error)
    return NextResponse.json(
      { success: false, error: `Internal server error: ${error.message}` },
      { status: 500 }
    )
  }
}
