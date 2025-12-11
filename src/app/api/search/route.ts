import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createErrorResponse } from '@/lib/error-handler'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ 
        success: true, 
        results: [],
        message: 'Query too short'
      })
    }

    const searchTerm = query.toLowerCase()
    const results: Array<{
      id: string;
      title: string;
      description: string;
      type: string;
      url: string;
    }> = []

    // Search users
    const users = await prisma.users.findMany({
      where: {
        OR: [
          { firstName: { contains: searchTerm, mode: 'insensitive' } },
          { lastName: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      take: 10,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        department: true,
        position: true
      }
    })

    users.forEach(user => {
      results.push({
        id: `user-${user.id}`,
        title: `${user.firstName} ${user.lastName}`,
        description: `${user.position || 'Staff'} - ${user.department || 'No Department'}`,
        type: 'user',
        url: `/admin/users/${user.id}`
      })
    })

    // Search employees
    const employees = await prisma.employees.findMany({
      where: {
        OR: [
          { firstName: { contains: searchTerm, mode: 'insensitive' } },
          { lastName: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
          { position: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      take: 10,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        position: true,
        departments: {
          select: { name: true }
        }
      }
    })

    employees.forEach(employee => {
      results.push({
        id: `employee-${employee.id}`,
        title: `${employee.firstName} ${employee.lastName}`,
        description: `${employee.position || 'Employee'} - ${employee.departments?.name || 'No Department'}`,
        type: 'employee',
        url: `/hr/employees/${employee.id}`
      })
    })

    // Search departments
    const departments = await prisma.departments.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { code: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      take: 5,
      select: {
        id: true,
        name: true,
        code: true,
        description: true
      }
    })

    departments.forEach(dept => {
      results.push({
        id: `department-${dept.id}`,
        title: dept.name,
        description: dept.description || `Department Code: ${dept.code}`,
        type: 'department',
        url: `/hr/departments/${dept.id}`
      })
    })

    // Add common pages/features that match the query
    const commonPages = [
      { title: 'Dashboard', description: 'Main dashboard with analytics and overview', url: '/dashboard' },
      { title: 'User Management', description: 'Manage system users and permissions', url: '/admin/users' },
      { title: 'Employee Management', description: 'Manage employee records and information', url: '/hr/employees' },
      { title: 'Department Management', description: 'Manage organizational departments', url: '/hr/departments' },
      { title: 'Performance Plans', description: 'Employee performance planning and tracking', url: '/hr/performance' },
      { title: 'Audit Logs', description: 'System audit and activity logs', url: '/admin/audit' },
      { title: 'Programs', description: 'Project and program management', url: '/programs' },
      { title: 'Inventory', description: 'Asset and inventory management', url: '/inventory' },
      { title: 'Call Centre', description: 'Call center operations and management', url: '/call-centre' },
      { title: 'Training', description: 'Employee training and development', url: '/hr/training' },
      { title: 'System Settings', description: 'Configure system preferences', url: '/admin/settings' }
    ]

    commonPages.forEach(page => {
      if (page.title.toLowerCase().includes(searchTerm) || 
          page.description.toLowerCase().includes(searchTerm)) {
        results.push({
          id: `page-${page.url.replace(/\//g, '-')}`,
          title: page.title,
          description: page.description,
          type: 'page',
          url: page.url
        })
      }
    })

    return NextResponse.json({
      success: true,
      results: results.slice(0, 20), // Limit to 20 results
      total: results.length
    })

  } catch (error) {
    console.error('Search error:', error)
    return createErrorResponse(error, request.url)
  }
}