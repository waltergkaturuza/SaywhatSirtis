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

    // Get employee salary summary from Employee model
    const employees = await prisma.users.findMany({
      where: { status: "ACTIVE" },
      select: {
        department: true,
        salary: true
      }
    })

    const totalEmployees = employees.length
    const totalSalaryBudget = employees.reduce((sum, emp) => sum + (emp.salary || 0), 0)
    
    // Group by department
    const departmentBreakdown = employees.reduce((acc: any, emp) => {
      const dept = emp.department || "Unassigned"
      if (!acc[dept]) {
        acc[dept] = { count: 0, totalSalary: 0 }
      }
      acc[dept].count++
      acc[dept].totalSalary += emp.salary || 0
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      data: {
        totalEmployees,
        totalSalaryBudget,
        departmentBreakdown,
        message: "Full payroll reporting not yet implemented - showing salary overview"
      }
    })
  } catch (error) {
    console.error("Error generating payroll reports:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
