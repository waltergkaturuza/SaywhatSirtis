import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const employeeSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  middleName: z.string().optional(),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional().transform(str => str ? new Date(str) : undefined),
  hireDate: z.string().transform(str => new Date(str)),
  departmentId: z.string().min(1, 'Department is required'),
  position: z.string().min(1, 'Position is required'),
  level: z.enum(['INTERN', 'JUNIOR', 'SENIOR', 'LEAD', 'MANAGER', 'DIRECTOR', 'EXECUTIVE']),
  basicSalary: z.number().min(0, 'Basic salary must be positive'),
  currency: z.string().default('NGN'),
  payFrequency: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY']).default('MONTHLY'),
  payrollType: z.enum(['SALARY', 'HOURLY', 'CONTRACT', 'COMMISSION']).default('SALARY'),
  overtimeRate: z.number().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default('Nigeria'),
  maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED']).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'NA']).optional(),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankAccountName: z.string().optional(),
  bankCode: z.string().optional(),
  taxId: z.string().optional(),
  taxExemption: z.boolean().default(false),
  taxRate: z.number().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const employeeId = url.searchParams.get('employeeId')
    const departmentId = url.searchParams.get('departmentId')
    const status = url.searchParams.get('status')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    if (employeeId) {
      const employee = await prisma.employee.findUnique({
        where: { id: employeeId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true
            }
          },
          _count: {
            select: {
              payrollRecords: true
            }
          }
        }
      })

      if (!employee) {
        return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
      }

      return NextResponse.json({ employee })
    }

    const whereClause: any = {}
    if (departmentId) whereClause.departmentId = departmentId
    if (status) whereClause.status = status

    const employees = await prisma.employee.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true
          }
        },
        _count: {
          select: {
            payrollRecords: true
          }
        }
      },
      orderBy: [
        { email: 'asc' }
      ],
      skip,
      take: limit
    })

    const total = await prisma.employee.count({ where: whereClause })

    return NextResponse.json({
      employees,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Employee API error:', error)
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
      case 'create':
        const validatedData = employeeSchema.parse(body)
        
        // Check if employee ID already exists
        const existingEmployee = await prisma.employee.findUnique({
          where: { employeeId: validatedData.employeeId }
        })
        
        if (existingEmployee) {
          return NextResponse.json({ error: 'Employee ID already exists' }, { status: 400 })
        }

        // Check if email already exists
        const existingEmailEmployee = await prisma.employee.findUnique({
          where: { email: validatedData.email }
        })
        
        if (existingEmailEmployee) {
          return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
        }

        // TODO: Fix Employee creation with proper User relation and field mapping
        return NextResponse.json({
          error: 'Employee creation not implemented yet - schema mismatch needs fixing'
        }, { status: 501 })

      case 'update':
        const { employeeId, ...updateData } = body
        
        if (!employeeId) {
          return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 })
        }

        const updatedEmployee = await prisma.employee.update({
          where: { id: employeeId },
          data: updateData
        })

        return NextResponse.json({
          message: 'Employee updated successfully',
          employee: updatedEmployee
        })

      case 'deactivate':
        const { employeeId: deactivateId } = body
        
        if (!deactivateId) {
          return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 })
        }

        const deactivatedEmployee = await prisma.employee.update({
          where: { id: deactivateId },
          data: { 
            status: 'INACTIVE',
            endDate: new Date()
          }
        })

        return NextResponse.json({
          message: 'Employee deactivated successfully',
          employee: deactivatedEmployee
        })

      case 'bulk-update':
        const { employeeIds, updates } = body
        
        if (!employeeIds || employeeIds.length === 0) {
          return NextResponse.json({ error: 'No employees selected' }, { status: 400 })
        }

        const bulkUpdateResult = await prisma.employee.updateMany({
          where: { id: { in: employeeIds } },
          data: updates
        })

        return NextResponse.json({
          message: 'Employees updated successfully',
          count: bulkUpdateResult.count
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Employee API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const employeeId = url.searchParams.get('employeeId')

    if (!employeeId) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 })
    }

    // Check if employee has payroll records
    const payrollRecordCount = await prisma.payrollRecord.count({
      where: { employeeId }
    })

    if (payrollRecordCount > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete employee with payroll records. Please deactivate instead.' 
      }, { status: 400 })
    }

    await prisma.employee.delete({
      where: { id: employeeId }
    })

    return NextResponse.json({ message: 'Employee deleted successfully' })

  } catch (error) {
    console.error('Employee API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
