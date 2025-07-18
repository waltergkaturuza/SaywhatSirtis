import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedRecruitmentData() {
  console.log('🌱 Seeding recruitment data...')

  try {
    // Create sample job postings
    const jobPostings = [
      {
        title: 'Senior Software Engineer',
        department: 'Technology',
        location: 'Remote',
        type: 'FULL_TIME',
        level: 'SENIOR',
        status: 'ACTIVE',
        description: 'We are looking for a Senior Software Engineer to join our growing technology team. You will be responsible for designing, developing, and maintaining high-quality software solutions.',
        requirements: JSON.stringify([
          '5+ years of software development experience',
          'Proficiency in React, Node.js, and TypeScript',
          'Experience with cloud platforms (AWS/Azure)',
          'Strong problem-solving skills',
          'Bachelor\'s degree in Computer Science or related field'
        ]),
        responsibilities: JSON.stringify([
          'Design and develop scalable web applications',
          'Collaborate with cross-functional teams',
          'Mentor junior developers',
          'Participate in code reviews',
          'Contribute to technical architecture decisions'
        ]),
        salaryMin: 90000,
        salaryMax: 130000,
        currency: 'USD',
        benefits: JSON.stringify([
          'Health insurance',
          'Dental and vision coverage',
          'Flexible working hours',
          'Professional development budget',
          'Stock options'
        ]),
        postedDate: new Date('2024-01-15'),
        closingDate: new Date('2024-03-15'),
        createdBy: 'admin@saywhat.org'
      },
      {
        title: 'Program Coordinator',
        department: 'Programs',
        location: 'New York, NY',
        type: 'FULL_TIME',
        level: 'MID',
        status: 'ACTIVE',
        description: 'Join our Programs team as a Program Coordinator to help manage and implement community development initiatives.',
        requirements: JSON.stringify([
          '3+ years of program management experience',
          'Experience in community development',
          'Strong organizational skills',
          'Excellent communication abilities',
          'Bachelor\'s degree preferred'
        ]),
        responsibilities: JSON.stringify([
          'Coordinate program activities and events',
          'Manage stakeholder relationships',
          'Track program metrics and outcomes',
          'Prepare reports and documentation',
          'Support program evaluation activities'
        ]),
        salaryMin: 55000,
        salaryMax: 70000,
        currency: 'USD',
        benefits: JSON.stringify([
          'Health insurance',
          'Retirement plan',
          'Paid time off',
          'Professional development opportunities'
        ]),
        postedDate: new Date('2024-01-20'),
        closingDate: new Date('2024-03-20'),
        createdBy: 'admin@saywhat.org'
      },
      {
        title: 'Customer Service Representative',
        department: 'Call Centre',
        location: 'Various Locations',
        type: 'FULL_TIME',
        level: 'ENTRY',
        status: 'ACTIVE',
        description: 'We are seeking dedicated Customer Service Representatives to join our call centre team and provide excellent support to our community members.',
        requirements: JSON.stringify([
          '1+ years of customer service experience',
          'Excellent verbal communication skills',
          'Proficiency with computer systems',
          'Ability to work in a fast-paced environment',
          'High school diploma or equivalent'
        ]),
        responsibilities: JSON.stringify([
          'Handle incoming customer inquiries',
          'Provide information about services',
          'Resolve customer issues and complaints',
          'Document customer interactions',
          'Follow up on customer concerns'
        ]),
        salaryMin: 35000,
        salaryMax: 45000,
        currency: 'USD',
        benefits: JSON.stringify([
          'Health insurance',
          'Paid training',
          'Career advancement opportunities',
          'Performance bonuses'
        ]),
        postedDate: new Date('2024-01-25'),
        closingDate: new Date('2024-04-25'),
        createdBy: 'admin@saywhat.org'
      },
      {
        title: 'Human Resources Manager',
        department: 'Human Resources',
        location: 'Seattle, WA',
        type: 'FULL_TIME',
        level: 'SENIOR',
        status: 'DRAFT',
        description: 'Lead our HR department in strategic planning and implementation of human resources initiatives.',
        requirements: JSON.stringify([
          '7+ years of HR management experience',
          'SHRM certification preferred',
          'Experience with HR information systems',
          'Strong leadership and communication skills',
          'Master\'s degree in HR or related field preferred'
        ]),
        responsibilities: JSON.stringify([
          'Develop HR strategies and policies',
          'Oversee recruitment and selection processes',
          'Manage employee relations',
          'Ensure compliance with employment laws',
          'Lead performance management initiatives'
        ]),
        salaryMin: 80000,
        salaryMax: 110000,
        currency: 'USD',
        benefits: JSON.stringify([
          'Comprehensive health benefits',
          'Retirement plan with company match',
          'Flexible work arrangements',
          'Professional development budget',
          'Leadership training opportunities'
        ]),
        postedDate: null,
        closingDate: null,
        createdBy: 'admin@saywhat.org'
      },
      {
        title: 'Data Analyst',
        department: 'Analytics',
        location: 'Remote',
        type: 'CONTRACT',
        level: 'MID',
        status: 'CLOSED',
        description: 'Contract position for an experienced Data Analyst to support our analytics initiatives.',
        requirements: JSON.stringify([
          '3+ years of data analysis experience',
          'Proficiency in SQL and Python',
          'Experience with data visualization tools',
          'Statistical analysis skills',
          'Bachelor\'s degree in related field'
        ]),
        responsibilities: JSON.stringify([
          'Analyze complex datasets',
          'Create data visualizations and reports',
          'Support data-driven decision making',
          'Collaborate with stakeholders',
          'Maintain data quality standards'
        ]),
        salaryMin: 65000,
        salaryMax: 85000,
        currency: 'USD',
        benefits: JSON.stringify([
          'Competitive hourly rate',
          'Flexible schedule',
          'Remote work opportunity'
        ]),
        postedDate: new Date('2024-01-01'),
        closingDate: new Date('2024-01-31'),
        createdBy: 'admin@saywhat.org'
      }
    ]

    const createdJobs = []
    for (const job of jobPostings) {
      const createdJob = await prisma.jobPosting.create({ data: job })
      createdJobs.push(createdJob)
      console.log(`✅ Created job: ${job.title}`)
    }

    // Create sample applications
    const applications = [
      {
        candidateName: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1-555-0101',
        jobId: createdJobs[0].id, // Senior Software Engineer
        status: 'REVIEWING',
        resumeUrl: '/documents/resumes/john-smith-resume.pdf',
        coverLetter: 'I am excited to apply for the Senior Software Engineer position. My experience building scalable web applications aligns perfectly with your requirements.',
        appliedDate: new Date('2024-01-16'),
        notes: 'Strong technical background with 6+ years experience. Good cultural fit.',
        score: 85
      },
      {
        candidateName: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1-555-0102',
        jobId: createdJobs[0].id, // Senior Software Engineer
        status: 'SHORTLISTED',
        resumeUrl: '/documents/resumes/sarah-johnson-resume.pdf',
        coverLetter: 'With over 7 years of experience in software development, I believe I would be a valuable addition to your team.',
        appliedDate: new Date('2024-01-17'),
        notes: 'Excellent technical skills and leadership experience. Recommended for hire.',
        score: 92
      },
      {
        candidateName: 'Maria Garcia',
        email: 'maria.garcia@email.com',
        phone: '+1-555-0103',
        jobId: createdJobs[1].id, // Program Coordinator
        status: 'SUBMITTED',
        resumeUrl: '/documents/resumes/maria-garcia-resume.pdf',
        coverLetter: 'I am passionate about community development and would love to contribute to your programs team.',
        appliedDate: new Date('2024-01-21'),
        score: null
      },
      {
        candidateName: 'David Lee',
        email: 'david.lee@email.com',
        phone: '+1-555-0104',
        jobId: createdJobs[1].id, // Program Coordinator
        status: 'HIRED',
        resumeUrl: '/documents/resumes/david-lee-resume.pdf',
        coverLetter: 'My experience in community development and program management makes me an ideal candidate for this role.',
        appliedDate: new Date('2024-01-22'),
        notes: 'Outstanding candidate with relevant experience and strong references.',
        score: 95
      },
      {
        candidateName: 'Emily Wilson',
        email: 'emily.wilson@email.com',
        phone: '+1-555-0105',
        jobId: createdJobs[2].id, // Customer Service Representative
        status: 'REJECTED',
        resumeUrl: '/documents/resumes/emily-wilson-resume.pdf',
        coverLetter: 'I enjoy helping people and would like to grow my career in customer service.',
        appliedDate: new Date('2024-01-26'),
        notes: 'Good candidate but limited experience with phone-based customer service.',
        score: 68
      },
      {
        candidateName: 'Michael Brown',
        email: 'michael.brown@email.com',
        phone: '+1-555-0106',
        jobId: createdJobs[2].id, // Customer Service Representative
        status: 'INTERVIEWED',
        resumeUrl: '/documents/resumes/michael-brown-resume.pdf',
        coverLetter: 'I have extensive call center experience and am excited about this opportunity.',
        appliedDate: new Date('2024-01-27'),
        notes: 'Strong candidate with relevant experience. Good communication skills during interview.',
        score: 88
      }
    ]

    for (const application of applications) {
      await prisma.application.create({ data: application })
      console.log(`✅ Created application: ${application.candidateName} for ${jobPostings.find(j => j.title === createdJobs.find(cj => cj.id === application.jobId)?.title)?.title}`)
    }

    console.log(`🎉 Successfully seeded ${jobPostings.length} job postings and ${applications.length} applications!`)
    
  } catch (error) {
    console.error('❌ Error seeding recruitment data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedRecruitmentData()
    .then(() => {
      console.log('✅ Recruitment data seeding completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Recruitment data seeding failed:', error)
      process.exit(1)
    })
}

export default seedRecruitmentData
