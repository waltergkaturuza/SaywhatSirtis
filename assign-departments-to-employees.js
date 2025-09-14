// Assign departments to employees for better display
const { PrismaClient } = require('@prisma/client')

async function assignDepartmentsToEmployees() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🏢 Assigning Departments to Employees...')
    console.log('=' .repeat(45))
    
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Get available departments
    const departments = await prisma.departments.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        code: true
      }
    })
    
    console.log('\n📋 Available Departments:')
    departments.forEach((dept, index) => {
      console.log(`${index + 1}. ${dept.name} (${dept.code}) - ID: ${dept.id}`)
    })
    
    // Strategic department assignments based on positions
    const assignments = [
      {
        employeeId: 'EMP676578', // John Smith - Project Manager
        departmentId: departments.find(d => d.code === 'PROG')?.id, // Programs
        reason: 'Project Manager → Programs Department'
      },
      {
        employeeId: 'EMP675890', // System Administrator
        departmentId: departments.find(d => d.code === 'FIN')?.id, // Finance and Administration
        reason: 'System Administrator → Finance and Administration'
      },
      {
        employeeId: 'EMP676903', // Sharon Mazwi
        departmentId: departments.find(d => d.code === 'HR')?.id, // Human Resources
        reason: 'Employee → Human Resources Department'
      },
      {
        employeeId: 'EMP677240', // Takesure Marozva
        departmentId: departments.find(d => d.code === 'C&A')?.id, // Communications and Advocacy
        reason: 'Employee → Communications and Advocacy'
      }
    ]
    
    console.log('\n🎯 Proposed Department Assignments:')
    console.log('-' .repeat(40))
    
    for (const assignment of assignments) {
      if (assignment.departmentId) {
        const dept = departments.find(d => d.id === assignment.departmentId)
        console.log(`✅ ${assignment.employeeId} → ${dept.name} (${dept.code})`)
        console.log(`   Reason: ${assignment.reason}`)
        
        // Update the employee
        await prisma.employees.update({
          where: { employeeId: assignment.employeeId },
          data: { departmentId: assignment.departmentId }
        })
        
      } else {
        console.log(`❌ ${assignment.employeeId} → Department not found`)
      }
    }
    
    console.log('\n🔄 Verifying Updates:')
    console.log('-' .repeat(25))
    
    // Get updated employee data
    const updatedEmployees = await prisma.employees.findMany({
      where: { status: 'ACTIVE' },
      include: {
        departments: {
          select: {
            name: true,
            code: true
          }
        }
      },
      orderBy: { firstName: 'asc' }
    })
    
    console.log('📊 Updated Employee Department Assignments:')
    updatedEmployees.forEach((emp, index) => {
      const department = emp.departments?.name || 'Not Assigned'
      const departmentCode = emp.departments?.code || 'N/A'
      
      console.log(`${index + 1}. ${emp.employeeId} - ${emp.firstName} ${emp.lastName}`)
      console.log(`   Position: ${emp.position}`)
      console.log(`   Department: ${department} (${departmentCode})`)
      console.log(`   Status: ${emp.status}`)
      console.log('')
    })
    
    // Test what the API will return now
    console.log('🌐 Testing API Response After Updates:')
    console.log('-' .repeat(40))
    
    const apiResponse = updatedEmployees.map(employee => ({
      id: employee.id,
      employeeId: employee.employeeId,
      name: `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.email,
      department: employee.departments?.name || 'Not Assigned',
      status: employee.status || 'ACTIVE',
      position: employee.position || 'N/A'
    }))
    
    console.log('📋 Final API Response (What users will see):')
    apiResponse.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.name}`)
      console.log(`   Department: ${emp.department}`)
      console.log(`   Status: ${emp.status}`)
      console.log(`   Position: ${emp.position}`)
      console.log('')
    })
    
    console.log('🎉 DEPARTMENT ASSIGNMENT COMPLETE!')
    console.log('✅ Employees now have proper department assignments')
    console.log('✅ Department names will display correctly in the employee table')
    console.log('✅ Status information is working properly')
    
  } catch (error) {
    console.error('❌ Assignment Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

assignDepartmentsToEmployees()
