import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

// Role mapping from old system to new system
const ROLE_MIGRATION_MAP: Record<string, UserRole> = {
  "USER": "BASIC_USER_1",
  "PROJECT_MANAGER": "ADVANCE_USER_1", 
  "ADMIN": "SYSTEM_ADMINISTRATOR"
}

export async function POST(request: Request) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Admin permission check
    const currentUser = await prisma.users.findUnique({
      where: { email: session.user.email }
    })

    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { action } = body

    if (action === 'migrate_roles') {
      // Get all users with old roles
      const usersToMigrate = await prisma.users.findMany({
        where: {
          role: { in: ["USER", "PROJECT_MANAGER", "ADMIN"] }
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true
        }
      })

      const migrationResults = []

      for (const user of usersToMigrate) {
        const oldRole = user.role
        const newRole = ROLE_MIGRATION_MAP[oldRole]

        if (newRole) {
          // Update the user role
          await prisma.users.update({
            where: { id: user.id },
            data: { role: newRole as UserRole }
          })

          migrationResults.push({
            user: `${user.firstName} ${user.lastName} (${user.email})`,
            oldRole,
            newRole,
            status: 'success'
          })
        } else {
          migrationResults.push({
            user: `${user.firstName} ${user.lastName} (${user.email})`,
            oldRole,
            newRole: null,
            status: 'no_mapping'
          })
        }
      }

      return NextResponse.json({
        success: true,
        message: `Migrated ${migrationResults.filter(r => r.status === 'success').length} users`,
        results: migrationResults
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Role migration error:', error)
    return NextResponse.json(
      { error: 'Migration failed' },
      { status: 500 }
    )
  }
}