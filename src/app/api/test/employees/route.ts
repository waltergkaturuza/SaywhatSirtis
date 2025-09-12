import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const employeeCount = await prisma.user.count()
    const employees = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        department: true,
        position: true,
        status: true
      },
      take: 5
    })

    return NextResponse.json({
      success: true,
      count: employeeCount,
      employees
    })
  } catch (error) {
    console.error('Employee test error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employees', details: error },
      { status: 500 }
    )
  }
}
