import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type')
    const reportId = searchParams.get('id')

    if (!reportType) {
      return NextResponse.json(
        { error: 'Report type is required' },
        { status: 400 }
      )
    }

    // Generate PDF content based on report type
    let pdfContent = ''
    
    switch (reportType) {
      case 'payroll-summary':
        pdfContent = `
          SAYWHAT SIRTIS PAYROLL SYSTEM
          PAYROLL SUMMARY REPORT
          Generated: ${new Date().toLocaleDateString()}
          
          Total Employees: 25
          Total Gross Pay: $125,000.00
          Total Deductions: $32,500.00
          Total Net Pay: $92,500.00
          
          Tax Summary:
          - Total Tax: $18,750.00
          - NSSA Contributions: $8,125.00
          - Other Deductions: $5,625.00
          
          Employee Breakdown:
          EMP001 - John Doe: $5,000.00 (Gross) → $3,700.00 (Net)
          EMP002 - Jane Smith: $4,500.00 (Gross) → $3,330.00 (Net)
          
          Report ID: ${reportId}
        `
        break

      case 'tax-summary':
        pdfContent = `
          SAYWHAT SIRTIS PAYROLL SYSTEM
          TAX SUMMARY REPORT
          Generated: ${new Date().toLocaleDateString()}
          
          Total Taxable Income: $125,000.00
          Total Tax Deducted: $18,750.00
          Average Tax Rate: 15.0%
          
          Tax Bracket Distribution:
          $0 - $3,000 (0%): 0 employees - $0.00
          $3,001 - $10,000 (15%): 8 employees - $6,750.00
          $10,001 - $25,000 (25%): 12 employees - $9,000.00
          $25,001+ (35%): 5 employees - $3,000.00
          
          Report ID: ${reportId}
        `
        break

      case 'nssa-summary':
        pdfContent = `
          SAYWHAT SIRTIS PAYROLL SYSTEM
          NSSA CONTRIBUTION REPORT
          Generated: ${new Date().toLocaleDateString()}
          
          Total Contributions: $8,125.00
          Employee Contributions: $4,062.50
          Employer Contributions: $4,062.50
          Contribution Rate: 6.5%
          
          Employee Details:
          EMP001 - John Doe: $5,000.00 salary → $325.00 contribution
          EMP002 - Jane Smith: $4,500.00 salary → $292.50 contribution
          
          Report ID: ${reportId}
        `
        break

      case 'employee-detail':
        pdfContent = `
          SAYWHAT SIRTIS PAYROLL SYSTEM
          EMPLOYEE DETAIL REPORT
          Generated: ${new Date().toLocaleDateString()}
          
          Employee: John Doe (EMP001)
          Department: Engineering
          Position: Senior Developer
          
          Earnings:
          - Basic Salary: $4,000.00
          - Overtime: $500.00
          - Allowances: $500.00
          - Gross Pay: $5,000.00
          
          Deductions:
          - Tax: $750.00
          - NSSA: $325.00
          - Other: $225.00
          - Total Deductions: $1,300.00
          
          Net Pay: $3,700.00
          Payslip Number: PS001-2024-07
          
          Report ID: ${reportId}
        `
        break

      case 'payroll-register':
        pdfContent = `
          SAYWHAT SIRTIS PAYROLL SYSTEM
          PAYROLL REGISTER
          Generated: ${new Date().toLocaleDateString()}
          
          Payroll Run PR001 - 2024-07-15
          Type: Regular
          Status: Processed
          Employees: 25
          Total Gross: $125,000.00
          Total Net: $92,500.00
          
          Payroll Run PR002 - 2024-07-30
          Type: Bonus
          Status: Processed
          Employees: 20
          Total Gross: $50,000.00
          Total Net: $37,500.00
          
          Report ID: ${reportId}
        `
        break

      default:
        pdfContent = `
          SAYWHAT SIRTIS PAYROLL SYSTEM
          REPORT NOT FOUND
          Generated: ${new Date().toLocaleDateString()}
          
          The requested report type "${reportType}" is not available.
          
          Report ID: ${reportId}
        `
    }

    // Return PDF as plain text for now (in a real implementation, you'd use a PDF library)
    return new NextResponse(pdfContent, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${reportType}-${new Date().toISOString().split('T')[0]}.pdf"`
      }
    })

  } catch (error) {
    console.error('Error generating PDF report:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF report' },
      { status: 500 }
    )
  }
}
