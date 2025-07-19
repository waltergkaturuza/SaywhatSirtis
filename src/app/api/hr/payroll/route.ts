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
        const periods = await prisma.payrollPeriod.findMany({
          orderBy: { startDate: 'desc' },
          include: {
            _count: {
              select: {
                payrollRecords: true,
                payslips: true
              }
            }
          }
        })
        return NextResponse.json({ periods })

      case 'records':
        if (!periodId) {
          return NextResponse.json({ error: 'Period ID is required' }, { status: 400 })
        }

        const records = await prisma.payrollRecord.findMany({
          where: { periodId },
          include: {
            employee: {
              select: {
                id: true,
                employeeId: true,
                firstName: true,
                lastName: true,
                position: true,
                department: {
                  select: {
                    name: true
                  }
                }
              }
            },
            allowances: {
              include: {
                allowanceType: {
                  select: {
                    name: true
                  }
                }
              }
            },
            deductions: {
              include: {
                deductionType: {
                  select: {
                    name: true
                  }
                }
              }
            }
          },
          orderBy: [
            { employee: { lastName: 'asc' } },
            { employee: { firstName: 'asc' } }
          ]
        })
        return NextResponse.json({ records })

      case 'employee-records':
        if (!employeeId) {
          return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 })
        }

        const employeeRecords = await prisma.payrollRecord.findMany({
          where: { employeeId },
          include: {
            period: {
              select: {
                name: true,
                startDate: true,
                endDate: true,
                payDate: true
              }
            },
            allowances: {
              include: {
                allowanceType: {
                  select: {
                    name: true
                  }
                }
              }
            },
            deductions: {
              include: {
                deductionType: {
                  select: {
                    name: true
                  }
                }
              }
            }
          },
          orderBy: { period: { startDate: 'desc' } }
        })
        return NextResponse.json({ records: employeeRecords })

      case 'dashboard':
        const currentPeriod = await prisma.payrollPeriod.findFirst({
          where: {
            startDate: { lte: new Date() },
            endDate: { gte: new Date() }
          },
          include: {
            _count: {
              select: {
                payrollRecords: true
              }
            }
          }
        })

        const totalEmployees = await prisma.employee.count({
          where: { status: 'ACTIVE' }
        })

        const payrollStats = currentPeriod ? await prisma.payrollRecord.aggregate({
          where: { periodId: currentPeriod.id },
          _sum: {
            grossPay: true,
            netPay: true,
            totalDeductions: true,
            incomeTax: true
          }
        }) : null

        const statusCounts = currentPeriod ? await prisma.payrollRecord.groupBy({
          by: ['status'],
          where: { periodId: currentPeriod.id },
          _count: true
        }) : []

        return NextResponse.json({
          currentPeriod,
          totalEmployees,
          payrollStats,
          statusCounts
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
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

    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'create-period':
        const validatedPeriod = payrollPeriodSchema.parse(body)
        
        const newPeriod = await prisma.payrollPeriod.create({
          data: {
            name: validatedPeriod.name,
            startDate: validatedPeriod.startDate,
            endDate: validatedPeriod.endDate,
            payDate: validatedPeriod.payDate,
            status: 'DRAFT'
          }
        })
        
        return NextResponse.json({ 
          message: 'Payroll period created successfully', 
          period: newPeriod 
        })

      case 'calculate-payroll':
        const { periodId } = body
        
        if (!periodId) {
          return NextResponse.json({ error: 'Period ID is required' }, { status: 400 })
        }

        // Get all active employees
        const employees = await prisma.employee.findMany({
          where: { status: 'ACTIVE' },
          include: {
            allowances: {
              where: { isActive: true },
              include: {
                allowanceType: true
              }
            },
            deductions: {
              where: { isActive: true },
              include: {
                deductionType: true
              }
            }
          }
        })

        const payrollRecords = []

        for (const employee of employees) {
          // Calculate allowances
          let totalAllowances = 0
          const allowanceData = []
          
          for (const allowance of employee.allowances) {
            let amount = 0
            
            switch (allowance.allowanceType.calculation) {
              case 'FIXED':
                amount = Number(allowance.amount)
                break
              case 'PERCENTAGE_OF_BASIC':
                amount = Number(employee.basicSalary) * (Number(allowance.amount) / 100)
                break
              case 'PERCENTAGE_OF_GROSS':
                amount = Number(employee.basicSalary) * (Number(allowance.amount) / 100)
                break
            }
            
            totalAllowances += amount
            allowanceData.push({
              allowanceTypeId: allowance.allowanceTypeId,
              amount: amount
            })
          }

          // Calculate deductions
          let totalDeductions = 0
          const deductionData = []
          
          for (const deduction of employee.deductions) {
            let amount = 0
            
            switch (deduction.deductionType.calculation) {
              case 'FIXED':
                amount = Number(deduction.amount)
                break
              case 'PERCENTAGE_OF_BASIC':
                amount = Number(employee.basicSalary) * (Number(deduction.amount) / 100)
                break
              case 'PERCENTAGE_OF_GROSS':
                amount = (Number(employee.basicSalary) + totalAllowances) * (Number(deduction.amount) / 100)
                break
            }
            
            totalDeductions += amount
            deductionData.push({
              deductionTypeId: deduction.deductionTypeId,
              amount: amount
            })
          }

          const grossPay = Number(employee.basicSalary) + totalAllowances
          const taxableIncome = grossPay - (totalDeductions * 0.1) // Simple calculation
          const incomeTax = calculateIncomeTax(taxableIncome)
          const pensionDeduction = Math.min(grossPay * 0.035, 35) // 3.5% NSSA pension, max $35
          const nhisDeduction = 15 // Fixed health insurance amount
          
          const statutoryDeductions = incomeTax + pensionDeduction + nhisDeduction
          const netPay = grossPay - totalDeductions - statutoryDeductions

          // Create payroll record
          const payrollRecord = await prisma.payrollRecord.create({
            data: {
              employeeId: employee.id,
              periodId: periodId,
              basicSalary: employee.basicSalary,
              overtimeHours: 0,
              overtimePay: 0,
              totalAllowances: totalAllowances,
              totalDeductions: totalDeductions + statutoryDeductions,
              grossPay: grossPay,
              taxableIncome: taxableIncome,
              incomeTax: incomeTax,
              pensionDeduction: pensionDeduction,
              nhisDeduction: nhisDeduction,
              netPay: netPay,
              status: 'CALCULATED',
              calculatedAt: new Date()
            }
          })

          // Create allowance records
          for (const allowance of allowanceData) {
            await prisma.payrollAllowance.create({
              data: {
                payrollRecordId: payrollRecord.id,
                allowanceTypeId: allowance.allowanceTypeId,
                amount: allowance.amount
              }
            })
          }

          // Create deduction records
          for (const deduction of deductionData) {
            await prisma.payrollDeduction.create({
              data: {
                payrollRecordId: payrollRecord.id,
                deductionTypeId: deduction.deductionTypeId,
                amount: deduction.amount
              }
            })
          }

          payrollRecords.push(payrollRecord)
        }

        // Update period totals
        const periodTotals = await prisma.payrollRecord.aggregate({
          where: { periodId },
          _sum: {
            grossPay: true,
            netPay: true,
            totalDeductions: true
          },
          _count: true
        })

        await prisma.payrollPeriod.update({
          where: { id: periodId },
          data: {
            totalEmployees: periodTotals._count,
            totalGrossPay: periodTotals._sum.grossPay || 0,
            totalNetPay: periodTotals._sum.netPay || 0,
            totalDeductions: periodTotals._sum.totalDeductions || 0,
            status: 'CALCULATED',
            processedAt: new Date()
          }
        })

        return NextResponse.json({ 
          message: 'Payroll calculated successfully', 
          recordsCreated: payrollRecords.length 
        })

      case 'approve-payroll':
        const { periodId: approvePeriodId } = body
        
        await prisma.payrollPeriod.update({
          where: { id: approvePeriodId },
          data: {
            status: 'APPROVED',
            approvedAt: new Date()
          }
        })

        await prisma.payrollRecord.updateMany({
          where: { periodId: approvePeriodId },
          data: {
            status: 'APPROVED',
            approvedAt: new Date()
          }
        })

        return NextResponse.json({ message: 'Payroll approved successfully' })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Payroll API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Zimbabwe income tax calculation - PAYE tax brackets
function calculateIncomeTax(taxableIncome: number): number {
  if (taxableIncome <= 300) return 0 // Tax-free threshold
  if (taxableIncome <= 900) return (taxableIncome - 300) * 0.15 // 15% for $300-$900
  if (taxableIncome <= 1500) return 90 + (taxableIncome - 900) * 0.25 // 25% for $900-$1500
  return 240 + (taxableIncome - 1500) * 0.35 // 35% for income above $1500
}
