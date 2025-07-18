import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '12months'

    // Generate mock turnover data for the last 12 months
    const turnoverData = [
      { month: 'Jan 2024', departures: 8, hires: 12, netChange: 4, turnoverRate: 2.8 },
      { month: 'Feb 2024', departures: 6, hires: 15, netChange: 9, turnoverRate: 2.1 },
      { month: 'Mar 2024', departures: 12, hires: 8, netChange: -4, turnoverRate: 4.2 },
      { month: 'Apr 2024', departures: 5, hires: 18, netChange: 13, turnoverRate: 1.7 },
      { month: 'May 2024', departures: 9, hires: 14, netChange: 5, turnoverRate: 3.1 },
      { month: 'Jun 2024', departures: 7, hires: 16, netChange: 9, turnoverRate: 2.4 },
      { month: 'Jul 2024', departures: 11, hires: 10, netChange: -1, turnoverRate: 3.8 },
      { month: 'Aug 2024', departures: 4, hires: 20, netChange: 16, turnoverRate: 1.4 },
      { month: 'Sep 2024', departures: 8, hires: 13, netChange: 5, turnoverRate: 2.7 },
      { month: 'Oct 2024', departures: 6, hires: 17, netChange: 11, turnoverRate: 2.0 },
      { month: 'Nov 2024', departures: 10, hires: 9, netChange: -1, turnoverRate: 3.4 },
      { month: 'Dec 2024', departures: 3, hires: 22, netChange: 19, turnoverRate: 1.0 }
    ]

    // Filter data based on period
    let filteredData = turnoverData
    if (period === '3months') {
      filteredData = turnoverData.slice(-3)
    } else if (period === '6months') {
      filteredData = turnoverData.slice(-6)
    } else if (period === '24months') {
      // Extend with additional data for 24 months
      const extendedData = [
        { month: 'Jan 2023', departures: 14, hires: 8, netChange: -6, turnoverRate: 4.9 },
        { month: 'Feb 2023', departures: 9, hires: 12, netChange: 3, turnoverRate: 3.2 },
        { month: 'Mar 2023', departures: 7, hires: 15, netChange: 8, turnoverRate: 2.5 },
        { month: 'Apr 2023', departures: 11, hires: 10, netChange: -1, turnoverRate: 3.9 },
        { month: 'May 2023', departures: 6, hires: 18, netChange: 12, turnoverRate: 2.1 },
        { month: 'Jun 2023', departures: 13, hires: 7, netChange: -6, turnoverRate: 4.6 },
        { month: 'Jul 2023', departures: 8, hires: 14, netChange: 6, turnoverRate: 2.8 },
        { month: 'Aug 2023', departures: 5, hires: 19, netChange: 14, turnoverRate: 1.8 },
        { month: 'Sep 2023', departures: 12, hires: 9, netChange: -3, turnoverRate: 4.2 },
        { month: 'Oct 2023', departures: 7, hires: 16, netChange: 9, turnoverRate: 2.5 },
        { month: 'Nov 2023', departures: 9, hires: 11, netChange: 2, turnoverRate: 3.2 },
        { month: 'Dec 2023', departures: 4, hires: 21, netChange: 17, turnoverRate: 1.4 },
        ...turnoverData
      ]
      filteredData = extendedData
    }

    return NextResponse.json(filteredData)
  } catch (error) {
    console.error('Error fetching turnover analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch turnover analytics' },
      { status: 500 }
    )
  }
}
