const { PrismaClient } = require('@prisma/client')
const { randomUUID } = require('crypto')
const prisma = new PrismaClient()

async function createJobDescriptionForTatenda() {
  try {
    console.log('🔍 Creating job description for tatenda@saywhat.org...\n')
    
    // Find employee
    const employee = await prisma.employees.findUnique({
      where: { email: 'tatenda@saywhat.org' }
    })
    
    if (!employee) {
      console.log('❌ Employee not found')
      return
    }
    
    console.log('✅ Employee found:', employee.id, employee.firstName, employee.lastName)
    
    // Create sample job description
    const jobDescription = await prisma.job_descriptions.create({
      data: {
        id: randomUUID(),
        employeeId: employee.id,
        jobTitle: 'Call Center Officer',
        location: 'Office',
        jobSummary: 'Handle customer inquiries and provide excellent customer service',
        keyResponsibilities: JSON.stringify([
          {
            description: 'Answer customer calls and resolve inquiries',
            tasks: 'Handle inbound calls, log customer issues, provide solutions',
            weight: 30,
            successIndicators: [
              {
                indicator: 'Call Response Time',
                target: '90% of calls answered within 30 seconds',
                measurement: 'Call center system metrics'
              },
              {
                indicator: 'Customer Satisfaction',
                target: '85% satisfaction rating',
                measurement: 'Post-call surveys'
              }
            ]
          },
          {
            description: 'Maintain accurate customer records',
            tasks: 'Update CRM system, document interactions, follow up on pending issues',
            weight: 25,
            successIndicators: [
              {
                indicator: 'Data Accuracy',
                target: '98% accuracy in customer records',
                measurement: 'Monthly audit'
              }
            ]
          },
          {
            description: 'Meet call volume and quality targets',
            tasks: 'Handle minimum call volume, maintain quality scores',
            weight: 25,
            successIndicators: [
              {
                indicator: 'Call Volume',
                target: 'Minimum 50 calls per day',
                measurement: 'Daily call reports'
              },
              {
                indicator: 'Quality Score',
                target: '90% quality score',
                measurement: 'Monthly quality audits'
              }
            ]
          },
          {
            description: 'Collaborate with team and escalate issues',
            tasks: 'Participate in team meetings, share knowledge, escalate complex cases',
            weight: 20,
            successIndicators: [
              {
                indicator: 'Team Collaboration',
                target: 'Active participation in team activities',
                measurement: 'Supervisor assessment'
              }
            ]
          }
        ]),
        essentialExperience: 'Minimum 1 year customer service experience',
        essentialSkills: 'Excellent communication, problem-solving, computer literacy',
        isActive: true,
        version: 1,
        acknowledgment: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    
    console.log('\n✅ Job description created successfully!')
    console.log('  - ID:', jobDescription.id)
    console.log('  - Job Title:', jobDescription.jobTitle)
    console.log('  - Key Responsibilities:', jobDescription.keyResponsibilities ? 'Added' : 'Missing')
    
    console.log('\n📝 Key Responsibilities Preview:')
    const responsibilities = JSON.parse(jobDescription.keyResponsibilities)
    responsibilities.forEach((resp, index) => {
      console.log(`\n  ${index + 1}. ${resp.description}`)
      console.log(`     Weight: ${resp.weight}%`)
      console.log(`     Success Indicators: ${resp.successIndicators.length}`)
    })
    
    console.log('\n✨ Now the appraisal form should auto-fetch these responsibilities!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createJobDescriptionForTatenda()

