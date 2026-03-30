import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { executeQuery } from "@/lib/prisma"

/**
 * GET ?email= — same uniqueness rules as POST /api/hr/employees (employee row or user row).
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const raw = request.nextUrl.searchParams.get("email")?.trim().toLowerCase() ?? ""
    if (!raw || !raw.includes("@")) {
      return NextResponse.json(
        { error: "A valid email query parameter is required", available: false },
        { status: 400 }
      )
    }

    const [existingEmployee, existingUser] = await Promise.all([
      executeQuery((prisma) =>
        prisma.employees.findUnique({
          where: { email: raw },
          select: {
            id: true,
            status: true,
            firstName: true,
            lastName: true,
            employeeId: true,
          },
        })
      ),
      executeQuery((prisma) =>
        prisma.users.findUnique({
          where: { email: raw },
          select: { id: true, firstName: true, lastName: true },
        })
      ),
    ])

    let employeeLinkedToUser = null as null | { id: string; email: string; employeeId: string }
    if (existingUser) {
      employeeLinkedToUser = await executeQuery((prisma) =>
        prisma.employees.findUnique({
          where: { userId: existingUser.id },
          select: { id: true, email: true, employeeId: true },
        })
      )
    }

    /** HR can create: new email, or existing user with no employee row yet (admin created user first). */
    const linkExistingUser =
      !!existingUser && !existingEmployee && !employeeLinkedToUser
    const available = !existingEmployee && (!existingUser || linkExistingUser)

    let message: string | null = null
    if (existingEmployee) {
      const name = `${existingEmployee.firstName ?? ""} ${existingEmployee.lastName ?? ""}`.trim() || "Existing employee"
      message = `This work email is already used by ${name} (${existingEmployee.employeeId ?? existingEmployee.id}, status: ${existingEmployee.status}). Use a different email or update that employee.`
    } else if (existingUser && employeeLinkedToUser) {
      message =
        "This email already has both a user login and an employee record. Open that employee to edit instead of creating a new one."
    } else if (linkExistingUser) {
      const uName = `${existingUser!.firstName ?? ""} ${existingUser!.lastName ?? ""}`.trim()
      message = uName
        ? `A user account already exists for ${uName}. Creating this employee will link the HR record to that login (same password and access).`
        : "A user account already exists for this email with no employee profile yet. Creating this employee will link the HR record to that login."
    }

    return NextResponse.json({
      available,
      message,
      employee: existingEmployee,
      hasUserAccount: !!existingUser,
      linkExistingUser,
      employeeLinkedToUser: !!employeeLinkedToUser,
    })
  } catch (error) {
    console.error("check-email error:", error)
    return NextResponse.json(
      { error: "Failed to verify email", available: false },
      { status: 500 }
    )
  }
}
