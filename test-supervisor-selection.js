// Test supervisor API with is_supervisor and is_reviewer flags
const { PrismaClient } = require('@prisma/client')

async function testSupervisorAPI() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 Testing Supervisor Selection Logic...')
    console.log('=' .repeat(50))
    
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // First, let's mark some employees as supervisors and reviewers
    console.log('\n📝 Setting up test data - marking employees as supervisors/reviewers')
    
    // Mark Jimmy as a supervisor (already senior developer)
    await prisma.employees.update({
      where: { employeeId: 'EMP1001' },
      data: { 
        is_supervisor: true,
        is_reviewer: true 
      }
    })
    console.log('✅ Updated Jimmy as supervisor and reviewer')
    
    // Mark John Smith as a supervisor (project manager)
    await prisma.employees.update({
      where: { employeeId: 'EMP676578' },
      data: { 
        is_supervisor: true,
        position: 'Project Manager'
      }
    })
    console.log('✅ Updated John Smith as supervisor and Project Manager')
    
    // Mark System Administrator as a reviewer
    await prisma.employees.update({
      where: { employeeId: 'EMP675890' },
      data: { 
        is_reviewer: true,
        position: 'System Administrator'
      }
    })
    console.log('✅ Updated System Administrator as reviewer')
    
    // Now test the supervisor selection logic
    console.log('\n🎯 Testing Supervisor Selection Logic')
    console.log('-' .repeat(40))
    
    // Test 1: Get employees marked as supervisors
    const supervisorEmployees = await prisma.employees.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { is_supervisor: true },
          { is_reviewer: true }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            isActive: true
          }
        }
      },
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' }
      ]
    })
    
    console.log(`\n📋 Employees marked as Supervisors/Reviewers: ${supervisorEmployees.length}`)
    supervisorEmployees.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.employeeId} - ${emp.firstName} ${emp.lastName}`)
      console.log(`   Position: ${emp.position}`)
      console.log(`   Email: ${emp.email}`)
      console.log(`   Is Supervisor: ${emp.is_supervisor}`)
      console.log(`   Is Reviewer: ${emp.is_reviewer}`)
      console.log(`   User Active: ${emp.user?.isActive}`)
      console.log('')
    })
    
    // Test 2: Position-based supervisors (managers)
    const positionBasedSupervisors = await prisma.employees.findMany({
      where: {
        status: 'ACTIVE',
        position: {
          contains: 'manager',
          mode: 'insensitive'
        }
      }
    })
    
    console.log(`📋 Position-based Supervisors (containing 'manager'): ${positionBasedSupervisors.length}`)
    positionBasedSupervisors.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.employeeId} - ${emp.firstName} ${emp.lastName} (${emp.position})`)
    })
    
    // Test 3: Combined supervisor list (as the API would return)
    const allSupervisors = [...supervisorEmployees, ...positionBasedSupervisors]
    const uniqueSupervisors = allSupervisors.filter((supervisor, index, self) => 
      index === self.findIndex(s => s.id === supervisor.id)
    )
    
    console.log(`\n🎯 Final Supervisor List for Dropdown: ${uniqueSupervisors.length}`)
    console.log('-' .repeat(40))
    
    const supervisors = uniqueSupervisors
      .filter(emp => emp.user && emp.user.isActive)
      .map(emp => ({
        id: emp.user.id,
        employeeId: emp.employeeId,
        firstName: emp.firstName,
        lastName: emp.lastName,
        position: emp.position,
        department: emp.department,
        email: emp.email,
        isSupervisor: emp.is_supervisor || false,
        isReviewer: emp.is_reviewer || false
      }))
    
    supervisors.forEach((sup, index) => {
      console.log(`${index + 1}. ${sup.employeeId} - ${sup.firstName} ${sup.lastName}`)
      console.log(`   Position: ${sup.position}`)
      console.log(`   Department: ${sup.department || 'Not assigned'}`)
      console.log(`   Email: ${sup.email}`)
      console.log(`   Flags: Supervisor=${sup.isSupervisor}, Reviewer=${sup.isReviewer}`)
      console.log('')
    })
    
    // Test the actual API call
    console.log('\n🌐 Testing API Call Simulation')
    console.log('-' .repeat(30))
    
    try {
      // This simulates what the API would return
      console.log('✅ API would return the following supervisors for dropdown:')
      supervisors.forEach((sup, index) => {
        console.log(`   ${index + 1}. ${sup.firstName} ${sup.lastName} (${sup.position})`)
      })
      
      console.log(`\n📊 Summary:`)
      console.log(`   Total available supervisors: ${supervisors.length}`)
      console.log(`   Marked as supervisors: ${supervisors.filter(s => s.isSupervisor).length}`)
      console.log(`   Marked as reviewers: ${supervisors.filter(s => s.isReviewer).length}`)
      console.log(`   Position-based: ${supervisors.filter(s => s.position.toLowerCase().includes('manager')).length}`)
      
    } catch (apiError) {
      console.error('❌ API simulation error:', apiError)
    }
    
  } catch (error) {
    console.error('❌ Test Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testSupervisorAPI()
