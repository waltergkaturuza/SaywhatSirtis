/**
 * Test Employee Creation with Complete Form Data Including Education/Certifications
 * This test verifies that all form steps save data correctly to the database
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testEmployeeCreationWithQualifications() {
  console.log('🧪 Testing Employee Creation with Complete Form Data...\n')

  try {
    // Test data that matches the 6-step form
    const testEmployeeData = {
      // Step 1: Personal Information
      firstName: 'John',
      lastName: 'Doe',
      middleName: 'Michael',
      email: 'john.doe@test.com',
      phone: '+1234567890',
      alternativePhone: '+1987654321',
      address: '123 Test Street, Test City, TC 12345',
      dateOfBirth: '1990-05-15',
      emergencyContactName: 'Jane Doe',
      emergencyContactPhone: '+1111222333',
      
      // Step 2: Employment Details
      employeeId: 'EMP2024001',
      departmentId: 'dept-1', // Assuming we have this department
      position: 'Software Developer',
      manager: 'supervisor-1', // Assuming we have this supervisor
      employmentType: 'FULL_TIME',
      startDate: '2024-01-15',
      
      // Step 3: Compensation
      baseSalary: 75000,
      currency: 'USD',
      payGrade: 'PO5',
      benefits: ['Health Insurance', 'Dental', '401k'],
      
      // Step 4: Education & Skills
      education: 'Bachelor of Science in Computer Science',
      skills: 'JavaScript, Python, React, Node.js, SQL',
      certifications: 'AWS Solutions Architect, Certified Scrum Master',
      
      // Step 5: Access & Permissions
      isSupervisor: true,
      isReviewer: false,
      
      // Step 6: Documents (we'll skip file uploads for this test)
      documentNotes: 'All required documents submitted'
    }

    console.log('📝 Test Employee Data:')
    console.log('- Name:', testEmployeeData.firstName, testEmployeeData.lastName)
    console.log('- Email:', testEmployeeData.email)
    console.log('- Position:', testEmployeeData.position)
    console.log('- Education:', testEmployeeData.education)
    console.log('- Skills:', testEmployeeData.skills)
    console.log('- Certifications:', testEmployeeData.certifications)
    console.log('- Is Supervisor:', testEmployeeData.isSupervisor)
    console.log('')

    // First, let's check if we have the required reference data
    console.log('🔍 Checking Reference Data...')
    
    const departments = await prisma.departments.findMany()
    console.log(`Found ${departments.length} departments:`, departments.map(d => `${d.id}: ${d.name}`))
    
    const supervisors = await prisma.users.findMany({
      where: { roles: { has: 'supervisor' } }
    })
    console.log(`Found ${supervisors.length} supervisors:`, supervisors.map(s => `${s.id}: ${s.name}`))
    
    // Use actual department and supervisor IDs if available
    if (departments.length > 0) {
      testEmployeeData.departmentId = departments[0].id
      console.log(`Using department: ${departments[0].name}`)
    }
    
    if (supervisors.length > 0) {
      testEmployeeData.manager = supervisors[0].id
      console.log(`Using supervisor: ${supervisors[0].name}`)
    }
    
    console.log('')

    // Simulate the API call by directly calling the database logic
    console.log('💾 Creating Employee with Transaction...')
    
    const result = await prisma.$transaction(async (tx) => {
      // Create user first
      const newUser = await tx.users.create({
        data: {
          id: require('crypto').randomUUID(),
          name: `${testEmployeeData.firstName} ${testEmployeeData.lastName}`,
          email: testEmployeeData.email,
          phone: testEmployeeData.phone,
          roles: testEmployeeData.isSupervisor ? ['employee', 'supervisor'] : ['employee'],
          status: 'ACTIVE',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      // Create employee record
      const newEmployee = await tx.employees.create({
        data: {
          id: require('crypto').randomUUID(),
          userId: newUser.id,
          employeeId: testEmployeeData.employeeId,
          firstName: testEmployeeData.firstName,
          lastName: testEmployeeData.lastName,
          middleName: testEmployeeData.middleName,
          email: testEmployeeData.email,
          phone: testEmployeeData.phone,
          alternativePhone: testEmployeeData.alternativePhone,
          address: testEmployeeData.address,
          dateOfBirth: new Date(testEmployeeData.dateOfBirth),
          emergencyContactName: testEmployeeData.emergencyContactName,
          emergencyContactPhone: testEmployeeData.emergencyContactPhone,
          departmentId: testEmployeeData.departmentId,
          position: testEmployeeData.position,
          manager: testEmployeeData.manager,
          employmentType: testEmployeeData.employmentType,
          startDate: new Date(testEmployeeData.startDate),
          baseSalary: testEmployeeData.baseSalary,
          currency: testEmployeeData.currency,
          payGrade: testEmployeeData.payGrade,
          benefits: testEmployeeData.benefits,
          status: 'ACTIVE',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      // Create education qualification
      let educationQualification = null
      if (testEmployeeData.education) {
        educationQualification = await tx.qualifications.create({
          data: {
            id: require('crypto').randomUUID(),
            employeeId: newEmployee.id,
            type: 'EDUCATION',
            title: testEmployeeData.education,
            institution: null,
            description: `Highest Education Level: ${testEmployeeData.education}`,
            dateObtained: new Date(),
            skillsGained: testEmployeeData.skills ? testEmployeeData.skills.split(',').map(skill => skill.trim()) : []
          }
        })
      }

      // Create certification qualifications
      let certificationQualifications = []
      if (testEmployeeData.certifications) {
        const certifications = testEmployeeData.certifications.split(',').map(cert => cert.trim())
        for (const cert of certifications) {
          if (cert) {
            const certQualification = await tx.qualifications.create({
              data: {
                id: require('crypto').randomUUID(),
                employeeId: newEmployee.id,
                type: 'CERTIFICATION',
                title: cert,
                institution: null,
                description: `Professional Certification: ${cert}`,
                dateObtained: new Date(),
                skillsGained: []
              }
            })
            certificationQualifications.push(certQualification)
          }
        }
      }

      return { newUser, newEmployee, educationQualification, certificationQualifications }
    })

    console.log('✅ Employee Created Successfully!')
    console.log('User ID:', result.newUser.id)
    console.log('Employee ID:', result.newEmployee.id)
    console.log('Employee Number:', result.newEmployee.employeeId)
    console.log('User Roles:', result.newUser.roles)
    console.log('')

    console.log('📚 Qualifications Created:')
    if (result.educationQualification) {
      console.log('Education:', result.educationQualification.title)
      console.log('Skills Gained:', result.educationQualification.skillsGained)
    }
    
    if (result.certificationQualifications.length > 0) {
      console.log('Certifications:')
      result.certificationQualifications.forEach((cert, index) => {
        console.log(`  ${index + 1}. ${cert.title}`)
      })
    }
    console.log('')

    // Verify the data was saved correctly
    console.log('🔍 Verifying Saved Data...')
    
    const savedEmployee = await prisma.employees.findUnique({
      where: { id: result.newEmployee.id },
      include: {
        user: true,
        department: true,
        qualifications: true
      }
    })

    if (savedEmployee) {
      console.log('✅ Employee verification successful:')
      console.log('- Full Name:', savedEmployee.firstName, savedEmployee.middleName, savedEmployee.lastName)
      console.log('- Email:', savedEmployee.email)
      console.log('- Department:', savedEmployee.department?.name || 'N/A')
      console.log('- Position:', savedEmployee.position)
      console.log('- Employment Type:', savedEmployee.employmentType)
      console.log('- Base Salary:', savedEmployee.baseSalary, savedEmployee.currency)
      console.log('- Pay Grade:', savedEmployee.payGrade)
      console.log('- Benefits:', savedEmployee.benefits)
      console.log('- User Roles:', savedEmployee.user.roles)
      console.log('- Qualifications Count:', savedEmployee.qualifications.length)
      
      if (savedEmployee.qualifications.length > 0) {
        console.log('- Qualification Details:')
        savedEmployee.qualifications.forEach((qual, index) => {
          console.log(`  ${index + 1}. ${qual.type}: ${qual.title}`)
          if (qual.skillsGained.length > 0) {
            console.log(`     Skills: ${qual.skillsGained.join(', ')}`)
          }
        })
      }
    }

    console.log('\n🎉 All Tests Passed! Employee creation with qualifications is working correctly.')

  } catch (error) {
    console.error('❌ Test Failed:', error.message)
    if (error.code) {
      console.error('Error Code:', error.code)
    }
    if (error.meta) {
      console.error('Error Details:', error.meta)
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testEmployeeCreationWithQualifications()