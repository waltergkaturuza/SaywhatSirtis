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

    let departments: string[] = []
    
    try {
      // Get unique departments from employees table
      const employeeDepartments = await prisma.employees.groupBy({
        by: ['department'],
        where: {
          department: {
            not: null
          },
          status: 'ACTIVE'
        },
        _count: {
          department: true
        }
      })

      // Extract department names, filtering out null values
      departments = employeeDepartments
        .filter(dept => dept.department !== null)
        .map(dept => dept.department!)
        .sort()

    } catch (dbError: any) {
      console.error('Database connection failed for employee departments:', dbError?.message || 'Unknown error')
      departments = []
    }

    return NextResponse.json(departments)
  } catch (error) {
    console.error('Error fetching employee departments:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch employee departments',
        departments: []
      },
      { status: 500 }
    )
  }
}
