const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testTatendaJobDescription() {
  try {
    console.log('🔍 Testing job description fetch for tatenda@saywhat.org...\n')
    
    // Find user
    const user = await prisma.users.findUnique({
      where: { email: 'tatenda@saywhat.org' }
    })
    
    if (!user) {
      console.log('❌ User not found')
      return
    }
    
    console.log('✅ User found:', user.id, user.firstName, user.lastName)
    
    // Find employee
    const employee = await prisma.employees.findUnique({
      where: { userId: user.id },
      include: {
        departments: {
          select: {
            id: true,
            name: true
          }
        },
        employees: {
          select: { id: true, firstName: true, lastName: true }
        },
        reviewer: {
          select: { id: true, firstName: true, lastName: true }
        },
        job_descriptions: {
          where: { isActive: true }
        }
      }
    })
    
    if (!employee) {
      console.log('❌ Employee record not found')
      return
    }
    
    console.log('\n✅ Employee found:')
    console.log('  - ID:', employee.id)
    console.log('  - Employee ID:', employee.employeeId)
    console.log('  - Name:', employee.firstName, employee.lastName)
    console.log('  - Department:', employee.departments?.name || employee.department)
    console.log('  - Position:', employee.position)
    
    console.log('\n📋 Job Descriptions:')
    if (employee.job_descriptions && employee.job_descriptions.length > 0) {
      const sortedJDs = employee.job_descriptions.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      
      const latestJD = sortedJDs[0]
      console.log('  - Total job descriptions:', employee.job_descriptions.length)
      console.log('  - Latest job description ID:', latestJD.id)
      console.log('  - Job Title:', latestJD.jobTitle)
      console.log('  - Location:', latestJD.location)
      console.log('  - Created:', latestJD.createdAt)
      console.log('  - Is Active:', latestJD.isActive)
      
      console.log('\n📝 Key Responsibilities:')
      if (latestJD.keyResponsibilities) {
        const responsibilities = typeof latestJD.keyResponsibilities === 'string'
          ? JSON.parse(latestJD.keyResponsibilities)
          : latestJD.keyResponsibilities
        
        console.log('  - Type:', typeof latestJD.keyResponsibilities)
        console.log('  - Raw data:', JSON.stringify(latestJD.keyResponsibilities, null, 2))
        console.log('\n  - Parsed responsibilities:', JSON.stringify(responsibilities, null, 2))
        console.log('\n  - Count:', Array.isArray(responsibilities) ? responsibilities.length : 'Not an array')
        
        if (Array.isArray(responsibilities)) {
          responsibilities.forEach((resp, index) => {
            console.log(`\n  Responsibility ${index + 1}:`)
            console.log('    - Description:', resp.description)
            console.log('    - Tasks:', resp.tasks)
            console.log('    - Weight:', resp.weight)
            console.log('    - Success Indicators:', resp.successIndicators ? resp.successIndicators.length : 0)
            if (resp.successIndicators && resp.successIndicators.length > 0) {
              resp.successIndicators.forEach((si, siIndex) => {
                console.log(`      Indicator ${siIndex + 1}:`, si.indicator, '| Target:', si.target, '| Measurement:', si.measurement)
              })
            }
          })
        }
      } else {
        console.log('  ⚠️ No key responsibilities found')
      }
    } else {
      console.log('  ⚠️ No job descriptions found for this employee')
    }
    
    console.log('\n' + '='.repeat(80))
    console.log('Testing what the API would return...\n')
    
    const jobDescription = employee.job_descriptions && employee.job_descriptions.length > 0
      ? employee.job_descriptions.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0]
      : null
    
    const apiResponse = {
      id: employee.id,
      employeeId: employee.employeeId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      position: employee.position,
      department: employee.departments?.name || employee.department || 'Unassigned',
      supervisor: employee.employees
        ? { id: employee.employees.id, firstName: employee.employees.firstName, lastName: employee.employees.lastName }
        : null,
      reviewer: employee.reviewer
        ? { id: employee.reviewer.id, firstName: employee.reviewer.firstName, lastName: employee.reviewer.lastName }
        : null,
      jobDescription: jobDescription ? {
        id: jobDescription.id,
        jobTitle: jobDescription.jobTitle,
        location: jobDescription.location,
        jobSummary: jobDescription.jobSummary,
        keyResponsibilities: jobDescription.keyResponsibilities,
        essentialExperience: jobDescription.essentialExperience,
        essentialSkills: jobDescription.essentialSkills
      } : null
    }
    
    console.log('API Response structure:')
    console.log(JSON.stringify(apiResponse, null, 2))
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testTatendaJobDescription()

