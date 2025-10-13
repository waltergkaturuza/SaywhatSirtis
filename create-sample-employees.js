const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')

const prisma = new PrismaClient()

const sampleEmployees = [
  {
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice.johnson@saywhat.org',
    department: 'Human Resources',
    position: 'HR Manager',
    phoneNumber: '+263772123456',
    status: 'ACTIVE',
    employmentType: 'PERMANENT',
    salary: 85000,
    gender: 'Female',
    nationality: 'Zimbabwean',
    marital_status: 'Married',
    dateOfBirth: '1985-03-15',
    startDate: '2020-01-15',
    hireDate: '2020-01-15',
    isSupervisor: true,
    isReviewer: true
  },
  {
    firstName: 'Bob',
    lastName: 'Smith',
    email: 'bob.smith@saywhat.org',
    department: 'Information Technology',
    position: 'Senior Developer',
    phoneNumber: '+263772234567',
    status: 'ACTIVE',
    employmentType: 'PERMANENT',
    salary: 75000,
    gender: 'Male',
    nationality: 'Zimbabwean',
    marital_status: 'Single',
    dateOfBirth: '1988-07-22',
    startDate: '2021-03-01',
    hireDate: '2021-03-01',
    isSupervisor: false,
    isReviewer: false
  },
  {
    firstName: 'Carol',
    lastName: 'Williams',
    email: 'carol.williams@saywhat.org',
    department: 'Finance',
    position: 'Financial Analyst',
    phoneNumber: '+263772345678',
    status: 'ACTIVE',
    employmentType: 'PERMANENT',
    salary: 65000,
    gender: 'Female',
    nationality: 'Zimbabwean',
    marital_status: 'Married',
    dateOfBirth: '1990-11-08',
    startDate: '2022-06-01',
    hireDate: '2022-06-01',
    isSupervisor: false,
    isReviewer: false
  },
  {
    firstName: 'David',
    lastName: 'Brown',
    email: 'david.brown@saywhat.org',
    department: 'Programs',
    position: 'Program Manager',
    phoneNumber: '+263772456789',
    status: 'ACTIVE',
    employmentType: 'PERMANENT',
    salary: 80000,
    gender: 'Male',
    nationality: 'Zimbabwean',
    marital_status: 'Single',
    dateOfBirth: '1987-05-12',
    startDate: '2021-09-15',
    hireDate: '2021-09-15',
    isSupervisor: true,
    isReviewer: true
  },
  {
    firstName: 'Eva',
    lastName: 'Davis',
    email: 'eva.davis@saywhat.org',
    department: 'Communications',
    position: 'Communications Specialist',
    phoneNumber: '+263772567890',
    status: 'ACTIVE',
    employmentType: 'CONTRACT',
    salary: 45000,
    gender: 'Female',
    nationality: 'Zimbabwean',
    marital_status: 'Single',
    dateOfBirth: '1992-09-25',
    startDate: '2023-01-10',
    hireDate: '2023-01-10',
    isSupervisor: false,
    isReviewer: false
  },
  {
    firstName: 'Frank',
    lastName: 'Miller',
    email: 'frank.miller@saywhat.org',
    department: 'Operations',
    position: 'Operations Coordinator',
    phoneNumber: '+263772678901',
    status: 'ON_LEAVE',
    employmentType: 'PERMANENT',
    salary: 55000,
    gender: 'Male',
    nationality: 'Zimbabwean',
    marital_status: 'Married',
    dateOfBirth: '1989-12-03',
    startDate: '2022-02-01',
    hireDate: '2022-02-01',
    isSupervisor: false,
    isReviewer: false
  }
]

const sampleUsers = [
  {
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice.johnson@saywhat.org',
    role: 'HR_MANAGER',
    isActive: true
  },
  {
    firstName: 'Bob',
    lastName: 'Smith',
    email: 'bob.smith@saywhat.org',
    role: 'SENIOR_USER',
    isActive: true
  },
  {
    firstName: 'Carol',
    lastName: 'Williams',
    email: 'carol.williams@saywhat.org',
    role: 'USER',
    isActive: true
  },
  {
    firstName: 'David',
    lastName: 'Brown',
    email: 'david.brown@saywhat.org',
    role: 'DEPARTMENT_ADMIN',
    isActive: true
  },
  {
    firstName: 'Eva',
    lastName: 'Davis',
    email: 'eva.davis@saywhat.org',
    role: 'USER',
    isActive: true
  },
  {
    firstName: 'Frank',
    lastName: 'Miller',
    email: 'frank.miller@saywhat.org',
    role: 'USER',
    isActive: true
  },
  // Add some higher-level roles
  {
    firstName: 'Grace',
    lastName: 'Wilson',
    email: 'grace.wilson@saywhat.org',
    role: 'SUPER_ADMIN',
    isActive: true
  },
  {
    firstName: 'Henry',
    lastName: 'Taylor',
    email: 'henry.taylor@saywhat.org',
    role: 'ADMIN',
    isActive: true
  }
]

const sampleDepartments = [
  {
    name: 'Human Resources',
    code: 'HR',
    description: 'Human Resources Department',
    type: 'main_department',
    parentId: null
  },
  {
    name: 'Information Technology',
    code: 'IT',
    description: 'Information Technology Department',
    type: 'main_department',
    parentId: null
  },
  {
    name: 'Finance',
    code: 'FIN',
    description: 'Finance Department',
    type: 'main_department',
    parentId: null
  },
  {
    name: 'Programs',
    code: 'PROG',
    description: 'Programs Department',
    type: 'main_department',
    parentId: null
  },
  {
    name: 'Communications',
    code: 'COMM',
    description: 'Communications Department',
    type: 'main_department',
    parentId: null
  },
  {
    name: 'Operations',
    code: 'OPS',
    description: 'Operations Department',
    type: 'main_department',
    parentId: null
  }
]

async function createSampleData() {
  try {
    console.log('Creating sample departments...')
    
    // Create departments first
    for (const dept of sampleDepartments) {
      try {
        await prisma.departments.upsert({
          where: { name: dept.name },
          update: dept,
          create: {
            ...dept,
            id: crypto.randomUUID()
          }
        })
        console.log(`✓ Created/updated department: ${dept.name}`)
      } catch (error) {
        console.log(`⚠ Department ${dept.name} might already exist:`, error.message)
      }
    }

    console.log('\nCreating sample users...')
    
    // Create users
    for (const user of sampleUsers) {
      try {
        await prisma.users.upsert({
          where: { email: user.email },
          update: user,
          create: {
            ...user,
            id: crypto.randomUUID(),
            password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeJjs/6pjxcs32OhW' // 'password123'
          }
        })
        console.log(`✓ Created/updated user: ${user.email} (${user.role})`)
      } catch (error) {
        console.log(`⚠ User ${user.email} might already exist:`, error.message)
      }
    }

    console.log('\nCreating sample employees...')
    
    // Create employees
    for (const emp of sampleEmployees) {
      try {
        await prisma.employees.upsert({
          where: { email: emp.email },
          update: emp,
          create: {
            ...emp,
            id: crypto.randomUUID(),
            employeeId: `EMP${Math.random().toString().substr(2, 6)}`,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })
        console.log(`✓ Created/updated employee: ${emp.firstName} ${emp.lastName} (${emp.department})`)
      } catch (error) {
        console.log(`⚠ Employee ${emp.email} might already exist:`, error.message)
      }
    }

    console.log('\n✅ Sample data creation completed!')
    
    // Show summary
    const employeeCount = await prisma.employees.count()
    const userCount = await prisma.users.count()
    const departmentCount = await prisma.departments.count()
    
    console.log('\n📊 Database Summary:')
    console.log(`- Employees: ${employeeCount}`)
    console.log(`- Users: ${userCount}`)
    console.log(`- Departments: ${departmentCount}`)

  } catch (error) {
    console.error('Error creating sample data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createSampleData()