import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const department = searchParams.get('department') || 'all'

    // Mock salary distribution data
    let salaryData = [
      { range: '$30k-40k', count: 42, avgSalary: 35000 },
      { range: '$40k-50k', count: 68, avgSalary: 45000 },
      { range: '$50k-60k', count: 85, avgSalary: 55000 },
      { range: '$60k-70k', count: 52, avgSalary: 65000 },
      { range: '$70k-80k', count: 38, avgSalary: 75000 },
      { range: '$80k-90k', count: 25, avgSalary: 85000 },
      { range: '$90k+', count: 15, avgSalary: 105000 }
    ]

    // If department filter is applied, adjust the data
    if (department !== 'all') {
      // Simulate department-specific salary distribution
      const departmentMultipliers: { [key: string]: number } = {
        'Technology': 1.3,
        'Analytics': 1.2,
        'Finance': 1.15,
        'Human Resources': 1.0,
        'Operations': 0.9,
        'Programs': 0.85,
        'Call Centre': 0.75
      }
      
      const multiplier = departmentMultipliers[department] || 1.0
      
      salaryData = salaryData.map(item => ({
        ...item,
        count: Math.round(item.count * 0.25), // Scale down for department
        avgSalary: Math.round(item.avgSalary * multiplier)
      }))
    }

    return NextResponse.json(salaryData)
  } catch (error) {
    console.error('Error fetching salary analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch salary analytics' },
      { status: 500 }
    )
  }
}
