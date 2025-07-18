import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '12months'
    const department = searchParams.get('department') || 'all'

    // Generate mock attendance data for the last 30 days
    const attendanceData = []
    const today = new Date()
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      // Generate realistic attendance patterns
      const isWeekend = date.getDay() === 0 || date.getDay() === 6
      const baseAttendance = isWeekend ? 0 : 280
      
      // Add some variation
      const variation = Math.random() * 40 - 20 // ±20
      const present = Math.max(0, Math.round(baseAttendance + variation))
      const remote = Math.round(present * 0.35) // 35% remote work
      const actualPresent = present - remote
      const late = Math.round(present * 0.04) // 4% late arrivals
      const absent = isWeekend ? 0 : Math.round(Math.random() * 15 + 5) // 5-20 absent
      
      attendanceData.push({
        date: date.toISOString().split('T')[0],
        present: actualPresent,
        absent,
        late,
        remote
      })
    }

    // Filter data based on period
    let filteredData = attendanceData
    if (period === '3months') {
      filteredData = attendanceData.slice(-90) // Last 90 days
    } else if (period === '6months') {
      filteredData = attendanceData.slice(-180) // Last 180 days
    }

    // If department filter is applied, scale the data
    if (department !== 'all') {
      const departmentSizes: { [key: string]: number } = {
        'Technology': 0.15,
        'Human Resources': 0.09,
        'Programs': 0.28,
        'Call Centre': 0.17,
        'Analytics': 0.12,
        'Finance': 0.07,
        'Operations': 0.12
      }
      
      const scale = departmentSizes[department] || 0.1
      
      filteredData = filteredData.map(item => ({
        ...item,
        present: Math.round(item.present * scale),
        absent: Math.round(item.absent * scale),
        late: Math.round(item.late * scale),
        remote: Math.round(item.remote * scale)
      }))
    }

    return NextResponse.json(filteredData)
  } catch (error) {
    console.error('Error fetching attendance analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attendance analytics' },
      { status: 500 }
    )
  }
}
