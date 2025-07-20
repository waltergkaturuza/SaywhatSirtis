import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const periodId = searchParams.get('periodId')

    let whereClause: any = {}
    
    if (employeeId) {
      whereClause.employeeId = employeeId
    }
    
    if (periodId) {
      whereClause.periodId = periodId
    }

    const payslips = await prisma.payrollRecord.findMany({
      where: whereClause,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            employeeId: true
          }
        },
        period: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            payDate: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(payslips)
  } catch (error) {
    console.error('Error fetching payslips:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    const payslip = await prisma.payrollRecord.create({
      data: {
        employeeId: data.employeeId,
        periodId: data.periodId,
        basicSalary: data.basicSalary,
        overtimeHours: data.overtimeHours || 0,
        overtimePay: data.overtimePay || 0,
        totalAllowances: data.totalAllowances || 0,
        totalDeductions: data.totalDeductions || 0,
        grossPay: data.grossPay,
        taxableIncome: data.taxableIncome,
        incomeTax: data.incomeTax || 0,
        pensionDeduction: data.pensionDeduction || 0,
        nhisDeduction: data.nhisDeduction || 0,
        nsitfDeduction: data.nsitfDeduction || 0,
        netPay: data.netPay,
        status: data.status || 'DRAFT'
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            employeeId: true
          }
        },
        period: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            payDate: true
          }
        }
      }
    })

    return NextResponse.json(payslip, { status: 201 })
  } catch (error) {
    console.error('Error creating payslip:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
