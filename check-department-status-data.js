// Check department and status data in employees table
const { PrismaClient } = require('@prisma/client')

async function checkEmployeeData() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 Checking Employee Department and Status Data...')
    console.log('=' .repeat(55))
    
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Get all employees with their raw data
    const employees = await prisma.employees.findMany({
      select: {
        id: true,
        employeeId: true,
        firstName: true,
        lastName: true,
        email: true,
        department: true,
        status: true,
        departmentId: true,
        position: true,
        employmentType: true,
        createdAt: true
      },
      orderBy: { firstName: 'asc' }
    })
    
    console.log('\n📋 Raw Employee Data from Database:')
    console.log('-' .repeat(45))
    
    employees.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.employeeId} - ${emp.firstName} ${emp.lastName}`)
      console.log(`   Email: ${emp.email}`)
      console.log(`   Department (field): "${emp.department}" (${typeof emp.department})`)
      console.log(`   Department ID: "${emp.departmentId}" (${typeof emp.departmentId})`)
      console.log(`   Status: "${emp.status}" (${typeof emp.status})`)
      console.log(`   Position: "${emp.position}" (${typeof emp.position})`)
      console.log(`   Employment Type: "${emp.employmentType}" (${typeof emp.employmentType})`)
      console.log(`   Created: ${emp.createdAt}`)
      console.log('')
    })
    
    // Check if departments table has data
    console.log('🏢 Checking Departments Table:')
    console.log('-' .repeat(30))
    
    try {
      const departments = await prisma.departments.findMany({
        select: {
          id: true,
          name: true,
          code: true,
          isActive: true
        }
      })
      
      console.log(`Found ${departments.length} departments:`)
      departments.forEach((dept, index) => {
        console.log(`${index + 1}. ${dept.id} - ${dept.name} (${dept.code}) - Active: ${dept.isActive}`)
      })
      
    } catch (deptError) {
      console.log('❌ Error fetching departments:', deptError.message)
    }
    
    // Test the API transformation logic
    console.log('\n🔄 Testing API Transformation:')
    console.log('-' .repeat(35))
    
    const transformedEmployees = employees.map((employee) => {
      return {
        id: employee.id,
        name: `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.email,
        email: employee.email,
        department: employee.department || 'N/A',
        position: employee.position || 'N/A',
        status: employee.status || 'ACTIVE',
        employeeId: employee.employeeId,
        employmentType: employee.employmentType || 'FULL_TIME'
      }
    })
    
    console.log('📊 Transformed Data (What API Returns):')
    transformedEmployees.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.employeeId} - ${emp.name}`)
      console.log(`   Department: "${emp.department}"`)
      console.log(`   Status: "${emp.status}"`)
      console.log(`   Position: "${emp.position}"`)
      console.log('')
    })
    
    // Check for specific issues
    console.log('🔍 Issue Analysis:')
    console.log('-' .repeat(20))
    
    const nullDepartments = employees.filter(emp => !emp.department || emp.department === null)
    const nullStatuses = employees.filter(emp => !emp.status || emp.status === null)
    
    console.log(`Employees with null/empty department: ${nullDepartments.length}`)
    console.log(`Employees with null/empty status: ${nullStatuses.length}`)
    
    if (nullDepartments.length > 0) {
      console.log('\n❌ Employees with missing department:')
      nullDepartments.forEach(emp => {
        console.log(`   - ${emp.employeeId}: ${emp.firstName} ${emp.lastName}`)
      })
    }
    
    if (nullStatuses.length > 0) {
      console.log('\n❌ Employees with missing status:')
      nullStatuses.forEach(emp => {
        console.log(`   - ${emp.employeeId}: ${emp.firstName} ${emp.lastName}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Database Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkEmployeeData()
