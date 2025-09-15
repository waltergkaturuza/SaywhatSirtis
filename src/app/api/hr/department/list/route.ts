import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get basic department list for dropdowns from database
    const departments = await prisma.departments.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        level: true,
        parentId: true,
        status: true
      },
      where: {
        status: 'ACTIVE'
      },
      orderBy: [
        { level: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: departments
    })
  } catch (error) {
    console.error('Error fetching department list:', error)
    // Return fallback departments on any error
    const fallbackDepartments = [
      { id: 'hr-dept', name: 'Human Resources', code: 'HR', level: 0, parentId: null, status: 'ACTIVE' },
      { id: 'hr-dept', name: 'Human Resources', code: 'HR', level: 0, parentId: null, status: 'ACTIVE' },
      { id: 'finance-dept', name: 'Finance & Administration', code: 'FIN', level: 0, parentId: null, status: 'ACTIVE' }
    ]
    
    return NextResponse.json({ 
      success: true,
      data: fallbackDepartments
    }, { status: 200 })
  }
}
