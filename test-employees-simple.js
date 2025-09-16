import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function testEmployeesData() {
  try {
    console.log("=== EMPLOYEES TABLE ===")
    const employees = await prisma.employees.findMany({
      take: 5,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })
    console.log(`Found ${employees.length} employees`)
    
    console.log("\n=== EMPLOYEES vs USERS ANALYSIS ===")
    const totalEmployees = await prisma.employees.count()
    const totalUsers = await prisma.users.count()
    
    console.log(`Total employees: ${totalEmployees}`)
    console.log(`Total users: ${totalUsers}`)
    
  } catch (error) {
    console.error("Error:", error)
  } finally {
    await prisma.$disconnect()
  }
}

testEmployeesData()
