import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '12months'

    // Calculate the number of months to look back
    let monthsBack: number
    switch (period) {
      case '3months':
        monthsBack = 3
        break
      case '6months':
        monthsBack = 6
        break
      case '24months':
        monthsBack = 24
        break
      default: // 12months
        monthsBack = 12
    }

    const now = new Date()
    const turnoverData = []

    // Generate data for each month in the period
    for (let i = monthsBack - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      
      // Get hires (employees who joined in this month)
      const hires = await prisma.employees.count({
        where: {
          hireDate: {
            gte: monthStart,
            lte: monthEnd
          }
        }
      })

      // Get departures (employees who were archived in this month)
      const departures = await prisma.employees.count({
        where: {
          status: 'ARCHIVED',
          updatedAt: {
            gte: monthStart,
            lte: monthEnd
          }
        }
      })

      // Get total employees at the beginning of the month for turnover rate calculation
      const totalEmployeesAtStart = await prisma.employees.count({
        where: {
          hireDate: { lte: monthStart },
          OR: [
            { status: 'ACTIVE' },
            { 
              status: 'ARCHIVED',
              updatedAt: { gte: monthStart }
            }
          ]
        }
      })

      const netChange = hires - departures
      const turnoverRate = totalEmployeesAtStart > 0 ? (departures / totalEmployeesAtStart) * 100 : 0

      // Format month name
      const monthName = monthStart.toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      })

      turnoverData.push({
        month: monthName,
        departures,
        hires,
        netChange,
        turnoverRate: Math.round(turnoverRate * 10) / 10
      })
    }

    return NextResponse.json(turnoverData)
  } catch (error) {
    console.error('Error fetching turnover analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch turnover analytics' },
      { status: 500 }
    )
  }
}
