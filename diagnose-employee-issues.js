// Diagnostic script to check employee database issues
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: ['query', 'error', 'info', 'warn'],
})

async function diagnoseEmployeeIssues() {
  console.log('🔍 EMPLOYEE DATABASE DIAGNOSTIC')
  console.log('=' .repeat(50))
  
  try {
    // Test 1: Basic database connection
    console.log('\n📊 Test 1: Database Connection')
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Test 2: Check if employees table exists and get count
    console.log('\n📊 Test 2: Employees Table Status')
    const totalEmployees = await prisma.employees.count()
    console.log(`✅ Found ${totalEmployees} employees in database`)
    
    // Test 3: Look for the specific missing employee ID
    console.log('\n📊 Test 3: Missing Employee ID Check')
    const missingId = 'cmfft5t770000vc8o37ras3qa'
    const specificEmployee = await prisma.employees.findUnique({
      where: { id: missingId }
    })
    
    if (specificEmployee) {
      console.log('✅ Employee found:', specificEmployee.firstName, specificEmployee.lastName)
    } else {
      console.log('❌ Employee NOT found with ID:', missingId)
      
      // Check if there are any employees with similar patterns
      const similarEmployees = await prisma.employees.findMany({
        where: {
          OR: [
            { firstName: 'System' },
            { lastName: 'Administrator' },
            { email: 'admin@saywhat.org' },
            { employeeId: 'EMP675890' }
          ]
        },
        select: {
          id: true,
          employeeId: true,
          firstName: true,
          lastName: true,
          email: true,
          status: true
        }
      })
      
      if (similarEmployees.length > 0) {
        console.log('\n🔍 Found similar employees:')
        similarEmployees.forEach(emp => {
          console.log(`  - ${emp.firstName} ${emp.lastName} (${emp.id}) - ${emp.email} - ${emp.status}`)
        })
      }
    }
    
    // Test 4: Check supervisors
    console.log('\n📊 Test 4: Supervisors Check')
    const supervisors = await prisma.employees.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { is_supervisor: true },
          { is_reviewer: true }
        ]
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        is_supervisor: true,
        is_reviewer: true
      }
    })
    
    console.log(`✅ Found ${supervisors.length} supervisors/reviewers`)
    if (supervisors.length > 0) {
      supervisors.forEach(sup => {
        console.log(`  - ${sup.firstName} ${sup.lastName} (Supervisor: ${sup.is_supervisor}, Reviewer: ${sup.is_reviewer})`)
      })
    }
    
    // Test 5: Check departments connectivity
    console.log('\n📊 Test 5: Departments Check')
    const departments = await prisma.departments.count()
    console.log(`✅ Found ${departments} departments`)
    
    console.log('\n🎯 DIAGNOSIS RESULTS:')
    if (totalEmployees === 0) {
      console.log('❌ No employees found - database might need seeding')
    } else {
      console.log('✅ Employee records exist')
    }
    
    if (!specificEmployee) {
      console.log('❌ Specific employee ID not found - frontend might have stale data')
      console.log('💡 Solution: Refresh employee list or check for deleted records')
    }
    
  } catch (error) {
    console.error('❌ Database diagnostic failed:', error.message)
    
    if (error.message.includes("Can't reach database server")) {
      console.log('\n🔧 CONNECTIVITY ISSUE DETECTED:')
      console.log('- Supabase database is unreachable')
      console.log('- Check internet connection')
      console.log('- Verify Supabase project status') 
      console.log('- Check environment variables (.env.local)')
    }
  } finally {
    await prisma.$disconnect()
  }
}

diagnoseEmployeeIssues()
