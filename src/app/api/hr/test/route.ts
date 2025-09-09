import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing simple HR stats...')
    
    // Simple count queries without complex permissions
    const employeeCount = await prisma.employee.count()
    const departmentCount = await prisma.department.count()
    const eventCount = await prisma.event.count()
    
    console.log('Simple counts:', { employeeCount, departmentCount, eventCount })
    
    return NextResponse.json({
      success: true,
      data: {
        employeeCount,
        departmentCount,
        eventCount,
        message: 'Simple HR test working'
      }
    })

  } catch (error) {
    console.error('Error in simple HR test:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch simple stats',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
