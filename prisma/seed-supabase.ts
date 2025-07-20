import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting SIRTIS database seed...')

  // Create system admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@saywhat.org' },
    update: {},
    create: {
      email: 'admin@saywhat.org',
      username: 'admin',
      role: 'SUPER_ADMIN',
      department: 'IT',
      position: 'System Administrator',
      isActive: true,
      emailVerified: new Date(),
    }
  })

  console.log('✅ Created admin user:', adminUser.email)

  // Create HR Manager user
  const hrManager = await prisma.user.upsert({
    where: { email: 'hr@saywhat.org' },
    update: {},
    create: {
      email: 'hr@saywhat.org',
      username: 'hrmanager',
      name: 'HR Manager',
      role: 'HR_MANAGER',
      department: 'Human Resources',
      position: 'HR Manager',
      isActive: true,
      emailVerified: new Date(),
    }
  })

  console.log('✅ Created HR manager:', hrManager.email)

  // Create Project Manager user
  const projectManager = await prisma.user.upsert({
    where: { email: 'pm@saywhat.org' },
    update: {},
    create: {
      email: 'pm@saywhat.org',
      username: 'projectmanager',
      name: 'Project Manager',
      role: 'PROJECT_MANAGER',
      department: 'Programs',
      position: 'Project Manager',
      isActive: true,
      emailVerified: new Date(),
    }
  })

  console.log('✅ Created project manager:', projectManager.email)

  // Create Call Centre Agent user
  const callAgent = await prisma.user.upsert({
    where: { email: 'agent@saywhat.org' },
    update: {},
    create: {
      email: 'agent@saywhat.org',
      username: 'callagent',
      name: 'Call Centre Agent',
      role: 'CALL_CENTRE_AGENT',
      department: 'Call Centre',
      position: 'Agent',
      isActive: true,
      emailVerified: new Date(),
    }
  })

  console.log('✅ Created call centre agent:', callAgent.email)

  // Create Departments
  const departments = [
    { name: 'Human Resources', description: 'Employee management and HR services' },
    { name: 'Programs', description: 'Project and program management' },
    { name: 'Call Centre', description: 'Customer service and support' },
    { name: 'IT', description: 'Information Technology services' },
    { name: 'Finance', description: 'Financial management and accounting' },
    { name: 'Operations', description: 'Daily operations and logistics' }
  ]

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: dept
    })
    console.log(`✅ Created department: ${dept.name}`)
  }

  // Create sample projects
  const projects = [
    {
      name: 'Community Health Initiative',
      description: 'Improving healthcare access in rural communities through mobile clinics and health education programs.',
      timeframe: 'January 2024 - December 2024',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-12-15'),
      country: 'Afghanistan',
      province: 'Kabul',
      objectives: JSON.stringify([
        'Establish 3 mobile health clinics',
        'Train 50 community health workers',
        'Reach 5000 beneficiaries',
        'Conduct 100 health education sessions'
      ]),
      budget: 150000,
      actualSpent: 65000,
      status: 'ACTIVE',
      priority: 'HIGH',
      progress: 45.5,
      managerId: projectManager.id
    },
    {
      name: 'Education Support Program',
      description: 'Supporting primary education in underserved areas through teacher training and infrastructure development.',
      timeframe: 'February 2024 - November 2024',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-11-30'),
      country: 'Afghanistan',
      province: 'Herat',
      objectives: JSON.stringify([
        'Build 5 new classrooms',
        'Train 25 teachers',
        'Provide school supplies for 500 students',
        'Establish school feeding program'
      ]),
      budget: 200000,
      actualSpent: 45000,
      status: 'ACTIVE',
      priority: 'MEDIUM',
      progress: 22.5,
      managerId: projectManager.id
    },
    {
      name: 'Water and Sanitation Project',
      description: 'Providing clean water access and sanitation facilities to rural communities.',
      timeframe: 'March 2024 - February 2025',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2025-02-28'),
      country: 'Afghanistan',
      province: 'Kandahar',
      objectives: JSON.stringify([
        'Install 10 water wells',
        'Build 20 latrine facilities',
        'Train 30 hygiene promoters',
        'Reach 2000 beneficiaries'
      ]),
      budget: 180000,
      actualSpent: 25000,
      status: 'PLANNING',
      priority: 'HIGH',
      progress: 13.9,
      managerId: projectManager.id
    }
  ]

  for (const project of projects) {
    await prisma.project.upsert({
      where: { name: project.name },
      update: {},
      create: project
    })
    console.log(`✅ Created project: ${project.name}`)
  }

  // Create sample employees
  const employees = [
    {
      userId: hrManager.id,
      employeeId: 'EMP001',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'hr@saywhat.org',
      position: 'HR Manager',
      department: 'Human Resources',
      employmentType: 'FULL_TIME',
      startDate: new Date('2023-01-15'),
      salary: 75000,
      status: 'ACTIVE'
    },
    {
      userId: projectManager.id,
      employeeId: 'EMP002',
      firstName: 'John',
      lastName: 'Johnson',
      email: 'pm@saywhat.org',
      position: 'Project Manager',
      department: 'Programs',
      employmentType: 'FULL_TIME',
      startDate: new Date('2023-03-01'),
      salary: 85000,
      status: 'ACTIVE'
    },
    {
      userId: callAgent.id,
      employeeId: 'EMP003',
      firstName: 'Sarah',
      lastName: 'Williams',
      email: 'agent@saywhat.org',
      position: 'Call Centre Agent',
      department: 'Call Centre',
      employmentType: 'FULL_TIME',
      startDate: new Date('2023-06-01'),
      salary: 45000,
      status: 'ACTIVE'
    }
  ]

  for (const employee of employees) {
    await prisma.employee.upsert({
      where: { employeeId: employee.employeeId },
      update: {},
      create: employee
    })
    console.log(`✅ Created employee: ${employee.firstName} ${employee.lastName}`)
  }

  // Create system settings
  const settings = [
    { key: 'app_name', value: 'SIRTIS', description: 'Application name', category: 'general', isPublic: true },
    { key: 'organization_name', value: 'SAYWHAT Organization', description: 'Organization name', category: 'general', isPublic: true },
    { key: 'timezone', value: 'UTC', description: 'Default timezone', category: 'general', isPublic: false },
    { key: 'date_format', value: 'YYYY-MM-DD', description: 'Default date format', category: 'general', isPublic: true },
    { key: 'currency', value: 'USD', description: 'Default currency', category: 'financial', isPublic: true }
  ]

  for (const setting of settings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting
    })
    console.log(`✅ Created setting: ${setting.key}`)
  }

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
