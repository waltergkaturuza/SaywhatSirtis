import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Role mapping from old system to new system
const ROLE_MIGRATION_MAP = {
  "USER": "BASIC_USER_1",              // Basic users get BASIC_USER_1
  "PROJECT_MANAGER": "ADVANCE_USER_1", // Project managers get ADVANCE_USER_1
  "ADMIN": "SYSTEM_ADMINISTRATOR"      // Admins get SYSTEM_ADMINISTRATOR
}

async function migrateUserRoles() {
  try {
    console.log("=== USER ROLES MIGRATION ===\n")
    
    // Get all users with old roles
    const users = await prisma.users.findMany({
      where: {
        role: { in: ["USER", "PROJECT_MANAGER", "ADMIN"] }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        department: true
      }
    })
    
    console.log(`Found ${users.length} users with old roles to migrate:`)
    
    for (const user of users) {
      const oldRole = user.role
      const newRole = ROLE_MIGRATION_MAP[oldRole]
      
      if (newRole) {
        console.log(`  ${user.firstName} ${user.lastName} (${user.email})`)
        console.log(`    ${oldRole}  ${newRole}`)
        
        // Update the user role
        await prisma.users.update({
          where: { id: user.id },
          data: { role: newRole }
        })
        
        console.log(`     Updated successfully\n`)
      } else {
        console.log(`    No mapping found for role: ${oldRole}`)
      }
    }
    
    // Verify migration
    console.log("=== MIGRATION VERIFICATION ===")
    const updatedUsers = await prisma.users.findMany({
      select: {
        firstName: true,
        lastName: true,
        email: true,
        role: true
      },
      orderBy: { firstName: "asc" }
    })
    
    console.log("Updated user roles:")
    updatedUsers.forEach(user => {
      console.log(`  ${user.firstName} ${user.lastName}: ${user.role}`)
    })
    
    console.log(`\n Migration completed successfully!`)
    
  } catch (error) {
    console.error(" Migration failed:", error)
  } finally {
    await prisma.$disconnect()
  }
}

migrateUserRoles()
