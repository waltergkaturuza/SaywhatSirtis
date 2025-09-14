// Test the updated employees API with department relationship
const { PrismaClient } = require('@prisma/client')

async function testUpdatedEmployeeAPI() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 Testing Updated Employee API with Department Relations...')
    console.log('=' .repeat(60))
    
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // First, check what departments exist
    console.log('\n🏢 Available Departments:')
    console.log('-' .repeat(25))
    
    const departments = await prisma.departments.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        status: true
      }
    })
    
    console.log(`Found ${departments.length} departments:`)
    departments.forEach((dept, index) => {
      console.log(`${index + 1}. ${dept.id} - ${dept.name} (${dept.code}) - Status: ${dept.status}`)
    })
    
    // Test the updated query (same as API)
    console.log('\n🔄 Testing Updated Employee Query:')
    console.log('-' .repeat(40))
    
    const employees = await prisma.employees.findMany({
      where: { 
        status: 'ACTIVE'
      },
      include: {
        employees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        departments: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: { firstName: 'asc' }
    })
    
    console.log('📋 Employee Data with Department Relations:')
    console.log('-' .repeat(45))
    
    employees.forEach((emp, index) => {
      const transformedDepartment = emp.departments?.name || emp.department || 'Not Assigned'
      
      console.log(`${index + 1}. ${emp.employeeId} - ${emp.firstName} ${emp.lastName}`)
      console.log(`   Email: ${emp.email}`)
      console.log(`   Department Field: "${emp.department}"`)
      console.log(`   Department ID: "${emp.departmentId}"`)
      console.log(`   Department Relation: ${emp.departments ? emp.departments.name + ' (' + emp.departments.code + ')' : 'NULL'}`)
      console.log(`   Transformed Department: "${transformedDepartment}"`)
      console.log(`   Status: "${emp.status}"`)
      console.log(`   Position: "${emp.position}"`)
      console.log('')
    })
    
    // Test the transformation logic
    console.log('🎯 API Transformation Result:')
    console.log('-' .repeat(35))
    
    const transformedEmployees = employees.map((employee) => {
      return {
        id: employee.id,
        name: `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.email,
        email: employee.email,
        department: employee.departments?.name || employee.department || 'Not Assigned',
        position: employee.position || 'N/A',
        status: employee.status || 'ACTIVE',
        employeeId: employee.employeeId,
        departmentCode: employee.departments?.code || null
      }
    })
    
    console.log('📊 What the API will return:')
    transformedEmployees.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.employeeId} - ${emp.name}`)
      console.log(`   Department: "${emp.department}"`)
      console.log(`   Status: "${emp.status}"`)
      console.log(`   Position: "${emp.position}"`)
      console.log('')
    })
    
    // Check if we need to assign departments to employees
    const employeesWithoutDept = employees.filter(emp => !emp.departmentId && !emp.department)
    
    if (employeesWithoutDept.length > 0) {
      console.log('⚠️  Employees without department assignments:')
      employeesWithoutDept.forEach(emp => {
        console.log(`   - ${emp.employeeId}: ${emp.firstName} ${emp.lastName}`)
      })
      
      if (departments.length > 0) {
        console.log('\n💡 Suggestion: Assign employees to departments for proper display')
        console.log('   You can edit employees and select a department from the dropdown')
      }
    }
    
  } catch (error) {
    console.error('❌ Test Error:', error)
    console.log('Error details:', {
      code: error.code,
      message: error.message
    })
  } finally {
    await prisma.$disconnect()
  }
}

testUpdatedEmployeeAPI()
