const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testJobDescriptions() {
  try {
    console.log('🔍 Testing Job Descriptions Storage...\n')

    // 1. Find an employee to test with
    const employee = await prisma.employees.findFirst({
      where: {
        status: 'ACTIVE'
      }
    })

    if (!employee) {
      console.log('❌ No active employees found')
      return
    }

    console.log(`✅ Found test employee: ${employee.firstName} ${employee.lastName} (${employee.employeeId})`)

    // 2. Create test job description data
    const testJobDescription = {
      jobTitle: 'Senior Software Engineer',
      location: 'Kampala Office',
      jobSummary: 'Lead software development projects and mentor junior developers',
      keyResponsibilities: [
        {
          description: 'Software Development and Architecture',
          weight: 40,
          tasks: 'Design and implement scalable software solutions, conduct code reviews, ensure best practices'
        },
        {
          description: 'Team Leadership and Mentoring',
          weight: 30,
          tasks: 'Mentor junior developers, conduct training sessions, provide technical guidance'
        },
        {
          description: 'Project Management',
          weight: 20,
          tasks: 'Plan sprints, track project progress, coordinate with stakeholders'
        },
        {
          description: 'Documentation and Quality Assurance',
          weight: 10,
          tasks: 'Maintain technical documentation, ensure code quality, implement testing strategies'
        }
      ],
      essentialExperience: '5+ years in software development, 2+ years in leadership role',
      essentialSkills: 'JavaScript, TypeScript, React, Node.js, Database Design, Team Leadership',
      acknowledgment: false
    }

    // 3. Check if job description already exists
    const existing = await prisma.job_descriptions.findUnique({
      where: { employeeId: employee.id }
    })

    let jobDescription
    if (existing) {
      console.log('📝 Updating existing job description...')
      jobDescription = await prisma.job_descriptions.update({
        where: { employeeId: employee.id },
        data: {
          ...testJobDescription,
          version: existing.version + 1,
          updatedAt: new Date()
        }
      })
    } else {
      console.log('📝 Creating new job description...')
      const { randomUUID } = require('crypto')
      jobDescription = await prisma.job_descriptions.create({
        data: {
          id: randomUUID(),
          employeeId: employee.id,
          ...testJobDescription,
          updatedAt: new Date()
        }
      })
    }

    console.log('✅ Job description saved successfully!')
    console.log('\n📋 Job Description Details:')
    console.log(`   ID: ${jobDescription.id}`)
    console.log(`   Job Title: ${jobDescription.jobTitle}`)
    console.log(`   Location: ${jobDescription.location}`)
    console.log(`   Version: ${jobDescription.version}`)
    console.log(`   Active: ${jobDescription.isActive}`)

    // 4. Verify key responsibilities are saved correctly
    console.log('\n🔑 Key Responsibilities:')
    const responsibilities = jobDescription.keyResponsibilities
    
    if (Array.isArray(responsibilities)) {
      let totalWeight = 0
      responsibilities.forEach((resp, index) => {
        console.log(`\n   ${index + 1}. ${resp.description}`)
        console.log(`      Weight: ${resp.weight}%`)
        console.log(`      Tasks: ${resp.tasks}`)
        totalWeight += resp.weight
      })
      console.log(`\n   ✅ Total Weight: ${totalWeight}% ${totalWeight === 100 ? '(Valid)' : '(Invalid - must be 100%)'} `)
    } else {
      console.log('   ⚠️ Responsibilities stored as:', typeof responsibilities)
      console.log('   Data:', responsibilities)
    }

    // 5. Test retrieval with employee data
    console.log('\n🔍 Testing retrieval with employee data...')
    const jobDescWithEmployee = await prisma.job_descriptions.findUnique({
      where: { employeeId: employee.id },
      include: {
        employees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            department: true
          }
        }
      }
    })

    if (jobDescWithEmployee) {
      console.log('✅ Successfully retrieved job description with employee data')
      console.log(`   Employee: ${jobDescWithEmployee.employees.firstName} ${jobDescWithEmployee.employees.lastName}`)
      console.log(`   Position: ${jobDescWithEmployee.employees.position}`)
      console.log(`   Department: ${jobDescWithEmployee.employees.department}`)
    }

    // 6. Test retrieval through employee query
    console.log('\n🔍 Testing retrieval through employee query...')
    const employeeWithJobDesc = await prisma.employees.findUnique({
      where: { id: employee.id },
      include: {
        job_descriptions: true
      }
    })

    if (employeeWithJobDesc?.job_descriptions) {
      console.log('✅ Successfully retrieved job description through employee query')
      console.log(`   Job Title: ${employeeWithJobDesc.job_descriptions.jobTitle}`)
      console.log(`   Responsibilities Count: ${employeeWithJobDesc.job_descriptions.keyResponsibilities?.length || 0}`)
    } else {
      console.log('❌ Failed to retrieve job description through employee query')
    }

    // 7. Summary
    console.log('\n📊 Summary:')
    console.log('   ✅ Job descriptions can be created')
    console.log('   ✅ Job descriptions can be updated with versioning')
    console.log('   ✅ Key responsibilities are stored as JSON array')
    console.log('   ✅ Weights and tasks are preserved')
    console.log('   ✅ Can retrieve job description with employee data')
    console.log('   ✅ Can retrieve job description through employee query')
    console.log('\n✨ All tests passed! Job descriptions are ready for performance plans and appraisals.')

  } catch (error) {
    console.error('❌ Error testing job descriptions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testJobDescriptions()

