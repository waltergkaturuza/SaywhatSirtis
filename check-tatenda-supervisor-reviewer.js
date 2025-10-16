const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkTatendaData() {
  try {
    console.log('Checking tatenda@saywhat.org employee data...\n')
    
    const employee = await prisma.employees.findFirst({
      where: { 
        email: 'tatenda@saywhat.org' 
      },
      include: {
        employees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true
          }
        },
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true
          }
        },
        departments: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!employee) {
      console.log('❌ Employee not found!')
      return
    }

    console.log('✅ Employee Found:')
    console.log('═══════════════════════════════════════════════════════')
    console.log(`ID: ${employee.id}`)
    console.log(`Employee ID: ${employee.employeeId || 'Not set'}`)
    console.log(`Name: ${employee.firstName} ${employee.lastName}`)
    console.log(`Email: ${employee.email}`)
    console.log(`Position: ${employee.position || 'Not set'}`)
    console.log(`Department: ${employee.departments?.name || 'Not assigned'}`)
    console.log('\n👤 Supervisor Information:')
    console.log('───────────────────────────────────────────────────────')
    console.log(`Supervisor ID: ${employee.supervisor_id || '❌ Not set'}`)
    if (employee.employees) {
      console.log(`✅ Supervisor: ${employee.employees.firstName} ${employee.employees.lastName}`)
      console.log(`   Email: ${employee.employees.email}`)
      console.log(`   Position: ${employee.employees.position || 'Not set'}`)
    } else {
      console.log('❌ No supervisor assigned')
    }

    console.log('\n📋 Reviewer Information:')
    console.log('───────────────────────────────────────────────────────')
    console.log(`Reviewer ID: ${employee.reviewer_id || '❌ Not set'}`)
    if (employee.reviewer) {
      console.log(`✅ Reviewer: ${employee.reviewer.firstName} ${employee.reviewer.lastName}`)
      console.log(`   Email: ${employee.reviewer.email}`)
      console.log(`   Position: ${employee.reviewer.position || 'Not set'}`)
    } else {
      console.log('❌ No reviewer assigned')
    }

    console.log('\n═══════════════════════════════════════════════════════')

    // Check if there are any supervisors available
    console.log('\n📊 Available Supervisors in System:')
    const supervisors = await prisma.employees.findMany({
      where: {
        is_supervisor: true,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        position: true
      },
      take: 5
    })
    
    if (supervisors.length > 0) {
      supervisors.forEach(sup => {
        console.log(`  • ${sup.firstName} ${sup.lastName} (${sup.email}) - ${sup.position || 'No position'}`)
      })
    } else {
      console.log('  ❌ No supervisors found in system')
    }

    // Check if there are any reviewers available
    console.log('\n📊 Available Reviewers in System:')
    const reviewers = await prisma.employees.findMany({
      where: {
        is_reviewer: true,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        position: true
      },
      take: 5
    })
    
    if (reviewers.length > 0) {
      reviewers.forEach(rev => {
        console.log(`  • ${rev.firstName} ${rev.lastName} (${rev.email}) - ${rev.position || 'No position'}`)
      })
    } else {
      console.log('  ❌ No reviewers found in system')
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkTatendaData()

