import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schemas
const payrollPeriodSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)),
  payDate: z.string().transform(str => new Date(str)),
})

const payrollRecordSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  periodId: z.string().min(1, 'Period ID is required'),
  basicSalary: z.number().min(0, 'Basic salary must be positive'),
  overtimeHours: z.number().min(0, 'Overtime hours must be positive').optional(),
  overtimePay: z.number().min(0, 'Overtime pay must be positive').optional(),
  allowances: z.array(z.object({
    allowanceTypeId: z.string(),
    amount: z.number().min(0)
  })).optional(),
  deductions: z.array(z.object({
    deductionTypeId: z.string(),
    amount: z.number().min(0)
  })).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const action = url.searchParams.get('action')
    const periodId = url.searchParams.get('periodId')
    const employeeId = url.searchParams.get('employeeId')

    switch (action) {
      case 'periods':
        // TODO: PayrollPeriod model doesn't exist, need to get periods from PayrollRecord payPeriod field
        const periods = await prisma.payrollRecord.groupBy({
          by: ['payPeriod'],
          _count: {
            id: true
          },
          orderBy: {
            payPeriod: 'desc'
          }
        })
        return NextResponse.json({ periods })

      case 'records':
        if (!periodId) {
          return NextResponse.json({ error: 'Period ID is required' }, { status: 400 })
        }
        // TODO: Fix complex includes - simplified version for now
        const records = await prisma.payrollRecord.findMany({
          where: { payPeriod: periodId },
          include: {
            employee: {
              select: {
                id: true,
                employeeId: true,
                email: true,
                position: true,
                department: true
              }
            }
          }
        })
        return NextResponse.json({ records })

      default:
        // TODO: Comment out complex payroll operations that have schema mismatches
        return NextResponse.json({ message: 'Payroll operations temporarily disabled - schema updates needed' }, { status: 501 })
    }
  } catch (error) {
    console.error('Payroll API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Comment out complex payroll operations that have schema mismatches
    return NextResponse.json({ message: 'Payroll POST operations temporarily disabled - schema updates needed' }, { status: 501 })
    
  } catch (error) {
    console.error('Payroll API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

