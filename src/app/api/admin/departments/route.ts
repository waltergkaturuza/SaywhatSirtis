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

    let departments: Array<{id: string, name: string, code?: string | null}> = []
    
    try {
      // Get departments from the HR departments table for user management
      const departmentsData = await prisma.departments.findMany({
        where: {
          status: 'ACTIVE'
        },
        select: {
          id: true,
          name: true,
          code: true
        },
        orderBy: {
          name: 'asc'
        }
      })

      // Transform to match our expected type for dropdowns
      departments = departmentsData.map(dept => ({
        id: dept.id,
        name: dept.name,
        code: dept.code
      }))
        
    } catch (dbError: any) {
      console.error('Database connection failed:', dbError?.message || 'Unknown error')
      throw new Error('Database connection failed')
    }

    // Return simple list for dropdowns - showing full name with code in parentheses
    const response = departments.map(dept => ({
      id: dept.id,
      name: dept.name,
      code: dept.code,
      displayName: dept.code ? `${dept.name} (${dept.code})` : dept.name
    }))

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching departments for admin:', error)
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    )
  }
}
