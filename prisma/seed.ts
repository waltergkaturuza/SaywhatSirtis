import { PrismaClient, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing data in development
  console.log('🧹 Clearing existing data...')
  
  try {
    // Clear data in reverse order of dependencies
    await prisma.activity.deleteMany({})
    await prisma.callRecord.deleteMany({})
    await prisma.project.deleteMany({})
    await prisma.auditLog.deleteMany({})
    await prisma.session.deleteMany({})
    await prisma.account.deleteMany({})
    await prisma.user.deleteMany({})
    
    console.log('✅ Existing data cleared')
  } catch (error) {
    console.log('⚠️ No existing data to clear or error clearing:', error)
  }

  // Create Users
  console.log('👥 Creating users...')
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@saywhat.org',
      username: 'admin',
      firstName: 'System',
      lastName: 'Administrator',
      role: UserRole.ADMIN,
      department: 'IT',
      position: 'System Administrator',
      phoneNumber: '+27123456789',
      location: 'Cape Town, South Africa',
      isActive: true,
      roles: ['ADMIN', 'SUPER_USER'],
      twoFactorEnabled: true,
    }
  })

  const projectManager = await prisma.user.create({
    data: {
      email: 'pm@saywhat.org',
      username: 'projectmanager',
      firstName: 'John',
      lastName: 'Smith',
      role: UserRole.PROJECT_MANAGER,
      department: 'Programs',
      position: 'Project Manager',
      phoneNumber: '+27123456790',
      location: 'Johannesburg, South Africa',
      isActive: true,
      roles: ['PROJECT_MANAGER', 'PROJECT_LEAD'],
    }
  })

  const callAgent = await prisma.user.create({
    data: {
      email: 'agent@saywhat.org',
      username: 'callagent',
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: UserRole.CALL_CENTRE_AGENT,
      department: 'Call Centre',
      position: 'Call Centre Agent',
      phoneNumber: '+27123456791',
      location: 'Durban, South Africa',
      isActive: true,
      roles: ['CALL_CENTRE_AGENT'],
    }
  })

  const fieldOfficer = await prisma.user.create({
    data: {
      email: 'field@saywhat.org',
      username: 'fieldofficer',
      firstName: 'Michael',
      lastName: 'Brown',
      role: UserRole.EMPLOYEE,
      department: 'Field Operations',
      position: 'Field Officer',
      phoneNumber: '+27123456792',
      location: 'Eastern Cape, South Africa',
      isActive: true,
      roles: ['FIELD_OFFICER'],
    }
  })

  console.log('✅ Created 4 users')

  // Create Projects
  console.log('📋 Creating projects...')
  
  const projects = [
    {
      name: 'Community Water Access Program',
      description: 'Implementing sustainable water access solutions in rural communities across Eastern Cape province.',
      objectives: {
        primary: 'Provide clean water access to 10,000 residents',
        secondary: ['Install 25 water points', 'Train 50 community members', 'Establish maintenance protocols']
      },
      timeframe: '18 months',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2025-07-15'),
      country: 'South Africa',
      province: 'Eastern Cape',
      budget: 2500000.00,
      actualSpent: 450000.00,
      status: 'ACTIVE',
      priority: 'HIGH',
      progress: 25,
      currency: 'ZAR',
      creatorId: admin.id,
      managerId: projectManager.id,
    },
    {
      name: 'Youth Skills Development Initiative',
      description: 'Training program for unemployed youth in digital literacy and entrepreneurship skills.',
      objectives: {
        primary: 'Train 500 youth in digital and business skills',
        secondary: ['Establish 5 training centers', 'Create mentorship program', 'Track employment outcomes']
      },
      timeframe: '24 months',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2026-03-01'),
      country: 'South Africa',
      province: 'Gauteng',
      budget: 1800000.00,
      actualSpent: 150000.00,
      status: 'PLANNING',
      priority: 'HIGH',
      progress: 10,
      currency: 'ZAR',
      creatorId: projectManager.id,
      managerId: projectManager.id,
    },
    {
      name: 'Rural Health Outreach Program',
      description: 'Mobile health services delivery to remote rural communities with limited healthcare access.',
      objectives: {
        primary: 'Provide healthcare services to 15,000 residents',
        secondary: ['Deploy 3 mobile clinics', 'Train 20 community health workers', 'Establish referral system']
      },
      timeframe: '12 months',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2025-06-01'),
      country: 'South Africa',
      province: 'Limpopo',
      budget: 3200000.00,
      actualSpent: 0.00,
      status: 'PLANNING',
      priority: 'MEDIUM',
      progress: 5,
      currency: 'ZAR',
      creatorId: admin.id,
      managerId: fieldOfficer.id,
    },
    {
      name: 'Food Security Enhancement Project',
      description: 'Supporting smallholder farmers with agricultural training and resources to improve food security.',
      objectives: {
        primary: 'Support 200 smallholder farmers',
        secondary: ['Distribute seeds and tools', 'Provide agricultural training', 'Establish farmer cooperatives']
      },
      timeframe: '30 months',
      startDate: new Date('2023-09-01'),
      endDate: new Date('2026-03-01'),
      country: 'South Africa',
      province: 'KwaZulu-Natal',
      budget: 4500000.00,
      actualSpent: 2100000.00,
      status: 'ACTIVE',
      priority: 'HIGH',
      progress: 60,
      currency: 'ZAR',
      creatorId: admin.id,
      managerId: projectManager.id,
    },
    {
      name: 'Education Infrastructure Development',
      description: 'Building and renovating school facilities to improve educational outcomes in underserved areas.',
      objectives: {
        primary: 'Renovate 10 schools and build 3 new facilities',
        secondary: ['Install ICT labs', 'Provide learning materials', 'Train teachers']
      },
      timeframe: '36 months',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2027-02-01'),
      country: 'South Africa',
      province: 'North West',
      budget: 8900000.00,
      actualSpent: 890000.00,
      status: 'ACTIVE',
      priority: 'MEDIUM',
      progress: 15,
      currency: 'ZAR',
      creatorId: projectManager.id,
      managerId: fieldOfficer.id,
    }
  ]

  const createdProjects = []
  for (const projectData of projects) {
    const project = await prisma.project.create({
      data: projectData
    })
    createdProjects.push(project)
  }

  console.log('✅ Created 5 projects')

  // Create Activities for Projects
  console.log('📝 Creating activities...')
  
  const activities = [
    // Activities for Water Access Program
    {
      title: 'Site Assessment and Community Mapping',
      description: 'Conduct detailed assessment of potential water point locations and community needs.',
      status: 'completed',
      dueDate: new Date('2024-02-28'),
      completedAt: new Date('2024-02-25'),
      projectId: createdProjects[0].id,
    },
    {
      title: 'Drilling and Installation Phase 1',
      description: 'Install first 10 water points in selected communities.',
      status: 'in-progress',
      dueDate: new Date('2024-12-31'),
      projectId: createdProjects[0].id,
    },
    {
      title: 'Community Training Program',
      description: 'Train community members on water point maintenance and management.',
      status: 'pending',
      dueDate: new Date('2025-03-31'),
      projectId: createdProjects[0].id,
    },
    // Activities for Youth Skills Program
    {
      title: 'Curriculum Development',
      description: 'Develop comprehensive digital literacy and entrepreneurship curriculum.',
      status: 'completed',
      dueDate: new Date('2024-04-30'),
      completedAt: new Date('2024-04-28'),
      projectId: createdProjects[1].id,
    },
    {
      title: 'Training Center Setup',
      description: 'Establish and equip 5 training centers with necessary technology and resources.',
      status: 'pending',
      dueDate: new Date('2024-12-31'),
      projectId: createdProjects[1].id,
    },
    // Activities for Health Outreach
    {
      title: 'Mobile Clinic Procurement',
      description: 'Purchase and customize 3 mobile health clinics for rural deployment.',
      status: 'pending',
      dueDate: new Date('2024-09-30'),
      projectId: createdProjects[2].id,
    },
    {
      title: 'Health Worker Recruitment',
      description: 'Recruit and train community health workers for outreach program.',
      status: 'pending',
      dueDate: new Date('2024-10-31'),
      projectId: createdProjects[2].id,
    },
    // Activities for Food Security
    {
      title: 'Farmer Registration and Assessment',
      description: 'Register participating farmers and assess current agricultural practices.',
      status: 'completed',
      dueDate: new Date('2024-01-31'),
      completedAt: new Date('2024-01-29'),
      projectId: createdProjects[3].id,
    },
    {
      title: 'Seeds and Tools Distribution',
      description: 'Distribute high-quality seeds and farming tools to registered farmers.',
      status: 'completed',
      dueDate: new Date('2024-09-30'),
      completedAt: new Date('2024-09-25'),
      projectId: createdProjects[3].id,
    },
    {
      title: 'Cooperative Formation Support',
      description: 'Assist farmers in forming and registering agricultural cooperatives.',
      status: 'in-progress',
      dueDate: new Date('2025-06-30'),
      projectId: createdProjects[3].id,
    },
    // Activities for Education Infrastructure
    {
      title: 'Infrastructure Assessment',
      description: 'Assess current state of school facilities and infrastructure needs.',
      status: 'completed',
      dueDate: new Date('2024-03-31'),
      completedAt: new Date('2024-03-28'),
      projectId: createdProjects[4].id,
    },
    {
      title: 'Construction Planning and Permits',
      description: 'Develop construction plans and obtain necessary permits for school renovations.',
      status: 'in-progress',
      dueDate: new Date('2024-12-31'),
      projectId: createdProjects[4].id,
    }
  ]

  for (const activityData of activities) {
    await prisma.activity.create({
      data: activityData
    })
  }

  console.log('✅ Created 12 activities')

  // Create Call Records
  console.log('📞 Creating call records...')
  
  const callRecords = [
    {
      caseNumber: 'CASE-2024-001',
      callerName: 'Mary Ndaba',
      callerPhone: '+27821234567',
      callerEmail: 'mary.ndaba@gmail.com',
      callType: 'INBOUND',
      category: 'COMPLAINT',
      priority: 'HIGH',
      status: 'OPEN',
      subject: 'Water point not functioning in Mthatha',
      description: 'Water point installed 3 months ago has stopped working. Community has no access to clean water.',
      assignedOfficer: fieldOfficer.username,
      district: 'OR Tambo District',
      ward: 'Ward 15',
      followUpRequired: true,
      followUpDate: new Date('2024-12-15'),
      callStartTime: new Date('2024-12-10T09:15:00Z'),
      callEndTime: new Date('2024-12-10T09:32:00Z'),
    },
    {
      caseNumber: 'CASE-2024-002',
      callerName: 'James Mthembu',
      callerPhone: '+27831234568',
      callType: 'INBOUND',
      category: 'INQUIRY',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      subject: 'Youth training program enrollment',
      description: 'Inquiry about how to enroll in the youth skills development program.',
      assignedOfficer: callAgent.username,
      summary: 'Provided enrollment information and application forms.',
      resolution: 'Caller provided with enrollment details and application process. Forms sent via email.',
      satisfactionRating: 5,
      district: 'eThekwini District',
      ward: 'Ward 42',
      followUpRequired: false,
      callStartTime: new Date('2024-12-09T14:20:00Z'),
      callEndTime: new Date('2024-12-09T14:35:00Z'),
      resolvedAt: new Date('2024-12-09T14:35:00Z'),
    },
    {
      caseNumber: 'CASE-2024-003',
      callerName: 'Susan Malgas',
      callerPhone: '+27721234569',
      callerEmail: 'susan.malgas@yahoo.com',
      callType: 'INBOUND',
      category: 'REQUEST',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      subject: 'Request for mobile clinic visit',
      description: 'Requesting mobile clinic visit to remote community in Limpopo province.',
      assignedOfficer: fieldOfficer.username,
      notes: 'Community of approximately 300 residents. Last visit was 6 months ago.',
      district: 'Vhembe District',
      ward: 'Ward 8',
      followUpRequired: true,
      followUpDate: new Date('2024-12-18'),
      callStartTime: new Date('2024-12-11T11:45:00Z'),
      callEndTime: new Date('2024-12-11T12:05:00Z'),
    },
    {
      caseNumber: 'CASE-2024-004',
      callerName: 'Peter Khumalo',
      callerPhone: '+27841234570',
      callType: 'OUTBOUND',
      category: 'FOLLOW_UP',
      priority: 'LOW',
      status: 'RESOLVED',
      subject: 'Follow-up on seed distribution',
      description: 'Follow-up call to check on seed germination and crop progress.',
      assignedOfficer: fieldOfficer.username,
      summary: 'Seeds are germinating well. Farmer reports good progress.',
      resolution: 'Farmer confirmed successful seed germination. Crop development on track.',
      satisfactionRating: 4,
      district: 'uMgungundlovu District',
      ward: 'Ward 23',
      followUpRequired: false,
      callStartTime: new Date('2024-12-08T16:10:00Z'),
      callEndTime: new Date('2024-12-08T16:20:00Z'),
      resolvedAt: new Date('2024-12-08T16:20:00Z'),
    },
    {
      caseNumber: 'CASE-2024-005',
      callerName: 'Grace Mohale',
      callerPhone: '+27731234571',
      callerEmail: 'grace.mohale@gmail.com',
      callType: 'INBOUND',
      category: 'COMPLAINT',
      priority: 'HIGH',
      status: 'ESCALATED',
      subject: 'Delayed school renovation project',
      description: 'School renovation project promised 6 months ago has not started. Children learning in unsafe conditions.',
      assignedOfficer: projectManager.username,
      notes: 'Escalated to project manager. Urgent intervention required.',
      district: 'Bojanala District',
      ward: 'Ward 7',
      followUpRequired: true,
      followUpDate: new Date('2024-12-14'),
      callStartTime: new Date('2024-12-12T08:30:00Z'),
      callEndTime: new Date('2024-12-12T08:55:00Z'),
    }
  ]

  for (const callData of callRecords) {
    await prisma.callRecord.create({
      data: callData
    })
  }

  console.log('✅ Created 5 call records')

  // Create Audit Logs
  console.log('📋 Creating audit logs...')
  
  const auditLogs = [
    {
      action: 'CREATE',
      resource: 'Project',
      resourceId: createdProjects[0].id,
      userId: admin.id,
      details: { description: 'Created Community Water Access Program project', projectName: 'Community Water Access Program', budget: 2500000 },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    {
      action: 'UPDATE',
      resource: 'Project',
      resourceId: createdProjects[3].id,
      userId: projectManager.id,
      details: { description: 'Updated project progress to 60%', oldProgress: 55, newProgress: 60 },
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    {
      action: 'CREATE',
      resource: 'CallRecord',
      resourceId: 'CASE-2024-001',
      userId: callAgent.id,
      details: { description: 'Created new call record for water point complaint', caseNumber: 'CASE-2024-001', priority: 'HIGH' },
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    }
  ]

  for (const auditData of auditLogs) {
    await prisma.auditLog.create({
      data: auditData
    })
  }

  console.log('✅ Created 3 audit logs')

  console.log('🎉 Database seeding completed successfully!')
  
  // Print summary
  console.log('\n📊 Seeding Summary:')
  console.log(`👥 Users: 4 (1 Admin, 1 Manager, 2 Users)`)
  console.log(`📋 Projects: 5 (2 Active, 3 Planning)`)
  console.log(`📝 Activities: 12 (4 Completed, 3 In Progress, 5 Pending)`)
  console.log(`📞 Call Records: 5 (2 Resolved, 1 In Progress, 1 Escalated, 1 Open)`)
  console.log(`📋 Audit Logs: 3`)
  console.log('\n✅ All data has been seeded successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
