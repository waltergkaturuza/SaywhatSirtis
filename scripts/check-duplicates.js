const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDuplicateEmails() {
  try {
    console.log('🔍 Checking for duplicate emails in the database...\n')

    // Check for duplicate emails in users table
    const duplicateUsers = await prisma.users.groupBy({
      by: ['email'],
      _count: {
        email: true
      },
      having: {
        email: {
          _count: {
            gt: 1
          }
        }
      }
    })

    if (duplicateUsers.length > 0) {
      console.log('❌ Duplicate emails found in users table:')
      for (const user of duplicateUsers) {
        console.log(`   - ${user.email} (${user._count.email} records)`)
        
        // Show the actual duplicate records
        const records = await prisma.users.findMany({
          where: { email: user.email },
          select: { id: true, email: true, firstName: true, lastName: true, createdAt: true }
        })
        
        records.forEach((record, index) => {
          console.log(`     ${index + 1}. ID: ${record.id}, Name: ${record.firstName} ${record.lastName}, Created: ${record.createdAt}`)
        })
        console.log('')
      }
    } else {
      console.log('✅ No duplicate emails found in users table')
    }

    // Check for duplicate emails in employees table
    const duplicateEmployees = await prisma.employees.groupBy({
      by: ['email'],
      _count: {
        email: true
      },
      having: {
        email: {
          _count: {
            gt: 1
          }
        }
      }
    })

    if (duplicateEmployees.length > 0) {
      console.log('❌ Duplicate emails found in employees table:')
      for (const emp of duplicateEmployees) {
        console.log(`   - ${emp.email} (${emp._count.email} records)`)
        
        // Show the actual duplicate records
        const records = await prisma.employees.findMany({
          where: { email: emp.email },
          select: { id: true, employeeId: true, email: true, firstName: true, lastName: true, status: true, createdAt: true }
        })
        
        records.forEach((record, index) => {
          console.log(`     ${index + 1}. ID: ${record.employeeId}, Name: ${record.firstName} ${record.lastName}, Status: ${record.status}, Created: ${record.createdAt}`)
        })
        console.log('')
      }
    } else {
      console.log('✅ No duplicate emails found in employees table')
    }

    // Check for duplicate employee IDs
    const duplicateEmpIds = await prisma.employees.groupBy({
      by: ['employeeId'],
      _count: {
        employeeId: true
      },
      having: {
        employeeId: {
          _count: {
            gt: 1
          }
        }
      }
    })

    if (duplicateEmpIds.length > 0) {
      console.log('❌ Duplicate employee IDs found:')
      for (const empId of duplicateEmpIds) {
        console.log(`   - ${empId.employeeId} (${empId._count.employeeId} records)`)
      }
    } else {
      console.log('✅ No duplicate employee IDs found')
    }

    console.log('\n📊 Database Statistics:')
    const userCount = await prisma.users.count()
    const employeeCount = await prisma.employees.count()
    const activeEmployeeCount = await prisma.employees.count({ where: { status: 'ACTIVE' } })
    
    console.log(`   - Total Users: ${userCount}`)
    console.log(`   - Total Employees: ${employeeCount}`)
    console.log(`   - Active Employees: ${activeEmployeeCount}`)

  } catch (error) {
    console.error('❌ Error checking duplicates:', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function cleanupDuplicates() {
  try {
    console.log('🧹 Starting duplicate cleanup...\n')
    
    // This is a more advanced cleanup - be careful!
    // For now, just log what would be cleaned
    console.log('⚠️  This is a dry run. To actually clean duplicates, modify this script.')
    console.log('⚠️  Always backup your database before running cleanup operations!')
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
  }
}

// Run the check
checkDuplicateEmails()
