// Fix user-employee ID confusion and update admin department
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixUserEmployeeConfusion() {
  console.log('🔧 FIXING USER-EMPLOYEE ID CONFUSION')
  console.log('=' .repeat(50))
  
  try {
    // Step 1: Update admin user department from IT to HR
    console.log('\n🔄 Step 1: Update Admin User Department')
    const updateUser = await prisma.users.update({
      where: { email: 'admin@saywhat.org' },
      data: { department: 'HR' }
    })
    console.log('✅ Updated admin user department from IT to HR')
    
    // Step 2: Get current user-employee mapping
    console.log('\n📊 Step 2: Current User-Employee Mapping')
    const userEmployeeMap = await prisma.users.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        employee: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })
    
    console.log('User → Employee Mapping:')
    userEmployeeMap.forEach(user => {
      if (user.employee) {
        console.log(`✅ ${user.firstName} ${user.lastName} (${user.email})`)
        console.log(`   User ID: ${user.id}`)
        console.log(`   Employee ID: ${user.employee.id}`)
        console.log(`   Employee Number: ${user.employee.employeeId}`)
      } else {
        console.log(`❌ ${user.firstName || 'Unknown'} ${user.lastName || 'User'} (${user.email}) - NO EMPLOYEE RECORD`)
        console.log(`   User ID: ${user.id}`)
      }
      console.log('')
    })
    
    // Step 3: Create API helper for ID conversion
    console.log('\n💡 Step 3: Solution Required')
    console.log('The system needs to handle both User IDs and Employee IDs:')
    console.log('')
    console.log('Frontend currently sends: User ID (cmfft5t770000vc8o37ras3qa)')
    console.log('Employee API expects: Employee ID (emp-1757860675891-0)')
    console.log('')
    console.log('📋 Recommended Solutions:')
    console.log('1. Update Employee API to accept User IDs and convert internally')
    console.log('2. OR update frontend to use Employee IDs instead of User IDs')
    console.log('3. OR create a unified endpoint that handles both ID types')
    
    // Step 4: Show the specific mapping for admin
    const adminMapping = userEmployeeMap.find(user => user.email === 'admin@saywhat.org')
    if (adminMapping) {
      console.log('\n🎯 ADMIN USER MAPPING:')
      console.log(`Frontend should use: ${adminMapping.employee?.id} (Employee ID)`)
      console.log(`Instead of: ${adminMapping.id} (User ID)`)
      console.log('')
      console.log('OR Employee API should accept User ID and convert it')
    }
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

fixUserEmployeeConfusion()
