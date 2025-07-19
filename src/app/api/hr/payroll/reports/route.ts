import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { reportType, format, periodId, startDate, endDate, employeeIds } = body

    // Validate required fields
    if (!reportType || !format) {
      return NextResponse.json(
        { error: 'Report type and format are required' },
        { status: 400 }
      )
    }

    // Generate sample report data based on report type
    let reportData: any = {}
    
    switch (reportType) {
      case 'payroll-summary':
        reportData = {
          title: 'Payroll Summary Report',
          period: periodId ? `Period ${periodId}` : `${startDate} to ${endDate}`,
          totalEmployees: employeeIds?.length || 25,
          totalGrossPay: 125000.00,
          totalDeductions: 32500.00,
          totalNetPay: 92500.00,
          totalTax: 18750.00,
          totalNSSA: 8125.00,
          breakdown: {
            salaries: 95000.00,
            overtime: 15000.00,
            allowances: 15000.00,
            deductions: {
              tax: 18750.00,
              nssa: 8125.00,
              other: 5625.00
            }
          },
          employees: [
            {
              id: 'EMP001',
              name: 'John Doe',
              grossPay: 5000.00,
              deductions: 1300.00,
              netPay: 3700.00
            },
            {
              id: 'EMP002', 
              name: 'Jane Smith',
              grossPay: 4500.00,
              deductions: 1170.00,
              netPay: 3330.00
            }
          ]
        }
        break

      case 'tax-summary':
        reportData = {
          title: 'Tax Summary Report',
          period: periodId ? `Period ${periodId}` : `${startDate} to ${endDate}`,
          totalTaxableIncome: 125000.00,
          totalTaxDeducted: 18750.00,
          averageTaxRate: 15.0,
          taxBrackets: [
            { range: '$0 - $3,000', rate: '0%', employees: 0, amount: 0 },
            { range: '$3,001 - $10,000', rate: '15%', employees: 8, amount: 6750.00 },
            { range: '$10,001 - $25,000', rate: '25%', employees: 12, amount: 9000.00 },
            { range: '$25,001+', rate: '35%', employees: 5, amount: 3000.00 }
          ]
        }
        break

      case 'nssa-summary':
        reportData = {
          title: 'NSSA Contribution Report',
          period: periodId ? `Period ${periodId}` : `${startDate} to ${endDate}`,
          totalContributions: 8125.00,
          employeeContributions: 4062.50,
          employerContributions: 4062.50,
          contributionRate: 6.5,
          employees: [
            {
              id: 'EMP001',
              name: 'John Doe',
              salary: 5000.00,
              contribution: 325.00
            },
            {
              id: 'EMP002',
              name: 'Jane Smith', 
              salary: 4500.00,
              contribution: 292.50
            }
          ]
        }
        break

      case 'employee-detail':
        reportData = {
          title: 'Employee Detail Report',
          period: periodId ? `Period ${periodId}` : `${startDate} to ${endDate}`,
          employees: [
            {
              id: 'EMP001',
              name: 'John Doe',
              department: 'Engineering',
              position: 'Senior Developer',
              basicSalary: 4000.00,
              overtime: 500.00,
              allowances: 500.00,
              grossPay: 5000.00,
              tax: 750.00,
              nssa: 325.00,
              otherDeductions: 225.00,
              totalDeductions: 1300.00,
              netPay: 3700.00,
              payslipNumber: 'PS001-2024-07'
            },
            {
              id: 'EMP002',
              name: 'Jane Smith',
              department: 'Marketing',
              position: 'Marketing Manager',
              basicSalary: 3500.00,
              overtime: 400.00,
              allowances: 600.00,
              grossPay: 4500.00,
              tax: 675.00,
              nssa: 292.50,
              otherDeductions: 202.50,
              totalDeductions: 1170.00,
              netPay: 3330.00,
              payslipNumber: 'PS002-2024-07'
            }
          ]
        }
        break

      case 'payroll-register':
        reportData = {
          title: 'Payroll Register',
          period: periodId ? `Period ${periodId}` : `${startDate} to ${endDate}`,
          payrollRuns: [
            {
              runId: 'PR001',
              date: '2024-07-15',
              type: 'Regular',
              status: 'Processed',
              employees: 25,
              totalGross: 125000.00,
              totalNet: 92500.00
            },
            {
              runId: 'PR002',
              date: '2024-07-30',
              type: 'Bonus',
              status: 'Processed',
              employees: 20,
              totalGross: 50000.00,
              totalNet: 37500.00
            }
          ]
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid report type' },
          { status: 400 }
        )
    }

    // Add metadata
    reportData.metadata = {
      generatedAt: new Date().toISOString(),
      generatedBy: session.user?.email || 'System',
      format: format,
      parameters: {
        reportType,
        periodId,
        startDate,
        endDate,
        employeeIds
      }
    }

    // Handle different response formats
    switch (format) {
      case 'json':
        return NextResponse.json({
          success: true,
          data: reportData
        })

      case 'csv':
        // Generate CSV content based on report type
        let csvContent = ''
        if (reportType === 'payroll-summary' && reportData.employees) {
          csvContent = 'Employee ID,Name,Gross Pay,Deductions,Net Pay\n'
          reportData.employees.forEach((emp: any) => {
            csvContent += `${emp.id},${emp.name},${emp.grossPay},${emp.deductions},${emp.netPay}\n`
          })
        } else if (reportType === 'employee-detail' && reportData.employees) {
          csvContent = 'Employee ID,Name,Department,Position,Basic Salary,Overtime,Allowances,Gross Pay,Tax,NSSA,Other Deductions,Net Pay\n'
          reportData.employees.forEach((emp: any) => {
            csvContent += `${emp.id},${emp.name},${emp.department},${emp.position},${emp.basicSalary},${emp.overtime},${emp.allowances},${emp.grossPay},${emp.tax},${emp.nssa},${emp.otherDeductions},${emp.netPay}\n`
          })
        } else {
          csvContent = 'Report Type,Generated At,Total Employees,Total Gross Pay,Total Net Pay\n'
          csvContent += `${reportType},${reportData.metadata.generatedAt},${reportData.totalEmployees || 0},${reportData.totalGrossPay || 0},${reportData.totalNetPay || 0}\n`
        }

        return new NextResponse(csvContent, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="${reportType}-${new Date().toISOString().split('T')[0]}.csv"`
          }
        })

      case 'pdf':
        // For PDF, return JSON with PDF generation instructions
        return NextResponse.json({
          success: true,
          data: reportData,
          pdfUrl: `/api/hr/payroll/reports/pdf?type=${reportType}&id=${Date.now()}`
        })

      default:
        return NextResponse.json(
          { error: 'Unsupported format. Use json, csv, or pdf' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Error generating payroll report:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type')

    // Return available report types if no specific type requested
    if (!reportType) {
      return NextResponse.json({
        success: true,
        data: {
          availableReports: [
            {
              type: 'payroll-summary',
              name: 'Payroll Summary',
              description: 'Overview of total payroll for a period'
            },
            {
              type: 'tax-summary',
              name: 'Tax Summary',
              description: 'Summary of tax deductions and brackets'
            },
            {
              type: 'nssa-summary',
              name: 'NSSA Contribution Report',
              description: 'Employee and employer NSSA contributions'
            },
            {
              type: 'employee-detail',
              name: 'Employee Detail Report',
              description: 'Detailed breakdown per employee'
            },
            {
              type: 'payroll-register',
              name: 'Payroll Register',
              description: 'Log of all payroll runs'
            }
          ],
          supportedFormats: ['json', 'csv', 'pdf']
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        reportType,
        description: 'Report type information',
        requiredParameters: ['format'],
        optionalParameters: ['periodId', 'startDate', 'endDate', 'employeeIds']
      }
    })

  } catch (error) {
    console.error('Error fetching report information:', error)
    return NextResponse.json(
      { error: 'Failed to fetch report information' },
      { status: 500 }
    )
  }
}
