import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'comprehensive'
    const period = searchParams.get('period') || '12months'
    const department = searchParams.get('department') || 'all'

    // Generate CSV data based on type
    let csvData = ''
    let filename = ''

    switch (type) {
      case 'comprehensive':
        csvData = generateComprehensiveReport(period, department)
        filename = 'hr-comprehensive-analytics'
        break
      case 'departments':
        csvData = generateDepartmentReport()
        filename = 'hr-department-analytics'
        break
      case 'performance':
        csvData = generatePerformanceReport(department)
        filename = 'hr-performance-analytics'
        break
      case 'turnover':
        csvData = generateTurnoverReport(period)
        filename = 'hr-turnover-analytics'
        break
      case 'salary':
        csvData = generateSalaryReport(department)
        filename = 'hr-salary-analytics'
        break
      case 'attendance':
        csvData = generateAttendanceReport(period, department)
        filename = 'hr-attendance-analytics'
        break
      default:
        csvData = generateComprehensiveReport(period, department)
        filename = 'hr-analytics'
    }

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error) {
    console.error('Error exporting HR analytics:', error)
    return NextResponse.json(
      { error: 'Failed to export analytics data' },
      { status: 500 }
    )
  }
}

function generateComprehensiveReport(period: string, department: string): string {
  const header = 'Report Type,Metric,Value,Period,Department,Generated Date\n'
  const date = new Date().toISOString().split('T')[0]
  
  const data = [
    `Summary,Total Employees,305,${period},${department},${date}`,
    `Summary,Active Employees,298,${period},${department},${date}`,
    `Summary,New Hires,42,${period},${department},${date}`,
    `Summary,Turnover Rate,8.5%,${period},${department},${date}`,
    `Summary,Average Tenure,3.2 years,${period},${department},${date}`,
    `Summary,Average Salary,$65000,${period},${department},${date}`,
    `Summary,Attendance Rate,92.5%,${period},${department},${date}`,
    `Summary,Performance Score,4.2/5,${period},${department},${date}`,
    `Department,Technology,45 employees,${period},${department},${date}`,
    `Department,Programs,85 employees,${period},${department},${date}`,
    `Department,Call Centre,52 employees,${period},${department},${date}`,
    `Department,Analytics,35 employees,${period},${department},${date}`,
    `Performance,Excellent,28.3%,${period},${department},${date}`,
    `Performance,Satisfactory,47.3%,${period},${department},${date}`,
    `Performance,Needs Improvement,19.3%,${period},${department},${date}`,
    `Performance,Unsatisfactory,5.0%,${period},${department},${date}`
  ]
  
  return header + data.join('\n')
}

function generateDepartmentReport(): string {
  const header = 'Department,Employees,Average Salary,Turnover Rate,Performance Score,Satisfaction Score\n'
  
  const data = [
    'Technology,45,$78000,8.2%,4.3,4.1',
    'Human Resources,28,$62000,12.5%,4.1,4.0',
    'Programs,85,$55000,15.3%,4.0,3.9',
    'Call Centre,52,$42000,22.1%,3.8,3.7',
    'Analytics,35,$72000,9.8%,4.2,4.2',
    'Finance,22,$68000,7.5%,4.1,4.0',
    'Operations,38,$58000,18.7%,3.9,3.8'
  ]
  
  return header + data.join('\n')
}

function generatePerformanceReport(department: string): string {
  const header = 'Rating,Count,Percentage,Department\n'
  
  const data = [
    `Excellent,85,28.3%,${department}`,
    `Satisfactory,142,47.3%,${department}`,
    `Needs Improvement,58,19.3%,${department}`,
    `Unsatisfactory,15,5.0%,${department}`
  ]
  
  return header + data.join('\n')
}

function generateTurnoverReport(period: string): string {
  const header = 'Month,Departures,Hires,Net Change,Turnover Rate\n'
  
  const data = [
    'Jan 2024,8,12,4,2.8%',
    'Feb 2024,6,15,9,2.1%',
    'Mar 2024,12,8,-4,4.2%',
    'Apr 2024,5,18,13,1.7%',
    'May 2024,9,14,5,3.1%',
    'Jun 2024,7,16,9,2.4%',
    'Jul 2024,11,10,-1,3.8%',
    'Aug 2024,4,20,16,1.4%',
    'Sep 2024,8,13,5,2.7%',
    'Oct 2024,6,17,11,2.0%',
    'Nov 2024,10,9,-1,3.4%',
    'Dec 2024,3,22,19,1.0%'
  ]
  
  return header + data.join('\n')
}

function generateSalaryReport(department: string): string {
  const header = 'Salary Range,Count,Average Salary,Department\n'
  
  const data = [
    `$30k-40k,42,$35000,${department}`,
    `$40k-50k,68,$45000,${department}`,
    `$50k-60k,85,$55000,${department}`,
    `$60k-70k,52,$65000,${department}`,
    `$70k-80k,38,$75000,${department}`,
    `$80k-90k,25,$85000,${department}`,
    `$90k+,15,$105000,${department}`
  ]
  
  return header + data.join('\n')
}

function generateAttendanceReport(period: string, department: string): string {
  const header = 'Date,Present,Remote,Late,Absent,Department\n'
  
  const data = []
  const today = new Date()
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    const present = isWeekend ? 0 : Math.round(Math.random() * 40 + 240)
    const remote = Math.round(present * 0.35)
    const late = Math.round(present * 0.04)
    const absent = isWeekend ? 0 : Math.round(Math.random() * 15 + 5)
    
    data.push(`${dateStr},${present},${remote},${late},${absent},${department}`)
  }
  
  return header + data.join('\n')
}
