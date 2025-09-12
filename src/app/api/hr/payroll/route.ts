import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get employees with salary information
    const employees = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        department: true,
        position: true,
        salary: true,
        currency: true
      }
    })

    return NextResponse.json({
      success: true,
      data: employees,
      message: "Full payroll module not yet implemented - showing employee salary data"
    })
  } catch (error) {
    console.error("Error fetching payroll records:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { employeeId, basicSalary, allowances, deductions, payPeriod } = await request.json()

    if (!employeeId || !basicSalary || !payPeriod) {
      return NextResponse.json(
        { error: "Employee ID, basic salary, and pay period are required" },
        { status: 400 }
      )
    }

    // Update employee salary
    const updatedEmployee = await prisma.user.update({
      where: { id: employeeId },
      data: { salary: basicSalary }
    })

    const grossSalary = basicSalary + (allowances || 0)
    const netSalary = grossSalary - (deductions || 0)

    return NextResponse.json({
      success: true,
      message: "Employee salary updated (full payroll module not implemented)",
      data: {
        employeeId,
        basicSalary,
        grossSalary,
        netSalary,
        payPeriod
      }
    })
  } catch (error) {
    console.error("Error processing payroll:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}