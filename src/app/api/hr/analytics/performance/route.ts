import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '12months'
    const department = searchParams.get('department') || 'all'

    // Mock performance distribution data
    const performanceData = [
      { rating: 'Excellent', count: 85, percentage: 28.3 },
      { rating: 'Satisfactory', count: 142, percentage: 47.3 },
      { rating: 'Needs Improvement', count: 58, percentage: 19.3 },
      { rating: 'Unsatisfactory', count: 15, percentage: 5.0 }
    ]

    // If department filter is applied, adjust the data
    if (department !== 'all') {
      // Simulate department-specific performance distribution
      const departmentFactors: { [key: string]: number } = {
        'Technology': 1.2,
        'Analytics': 1.1,
        'Finance': 1.05,
        'Human Resources': 1.0,
        'Operations': 0.95,
        'Programs': 0.9,
        'Call Centre': 0.85
      }
      
      const factor = departmentFactors[department] || 1.0
      
      return NextResponse.json(performanceData.map(item => ({
        ...item,
        count: Math.round(item.count * factor * 0.3), // Scale down for department
        percentage: item.percentage // Keep percentages similar
      })))
    }

    return NextResponse.json(performanceData)
  } catch (error) {
    console.error('Error fetching performance analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch performance analytics' },
      { status: 500 }
    )
  }
}
