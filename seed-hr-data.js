const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedHRData() {
  try {
    console.log('Seeding HR test data...');
    
    // Create departments first
    const itDept = await prisma.department.upsert({
      where: { name: 'Information Technology' },
      update: {},
      create: {
        name: 'Information Technology',
        description: 'Technology and systems management',
        code: 'IT',
        location: 'Main Office',
        manager: 'John Smith',
        status: 'ACTIVE',
        level: 0
      }
    });

    const hrDept = await prisma.department.upsert({
      where: { name: 'Human Resources' },
      update: {},
      create: {
        name: 'Human Resources',
        description: 'People management and development',
        code: 'HR',
        location: 'Main Office',
        manager: 'Jane Doe',
        status: 'ACTIVE',
        level: 0
      }
    });

    const finDept = await prisma.department.upsert({
      where: { name: 'Finance' },
      update: {},
      create: {
        name: 'Finance',
        description: 'Financial management and accounting',
        code: 'FIN',
        location: 'Main Office',
        manager: 'Robert Johnson',
        status: 'ACTIVE',
        level: 0
      }
    });

    console.log('Departments created:', { itDept: itDept.id, hrDept: hrDept.id, finDept: finDept.id });

    // Create users first (required for employees)
    const users = await Promise.all([
      prisma.user.upsert({
        where: { email: 'john.smith@saywhat.org' },
        update: {},
        create: {
          email: 'john.smith@saywhat.org',
          username: 'john.smith',
          firstName: 'John',
          lastName: 'Smith',
          role: 'USER',
          department: 'Information Technology',
          position: 'IT Manager',
          isActive: true
        }
      }),
      prisma.user.upsert({
        where: { email: 'jane.doe@saywhat.org' },
        update: {},
        create: {
          email: 'jane.doe@saywhat.org',
          username: 'jane.doe',
          firstName: 'Jane',
          lastName: 'Doe',
          role: 'USER',
          department: 'Human Resources',
          position: 'HR Manager',
          isActive: true
        }
      }),
      prisma.user.upsert({
        where: { email: 'mike.wilson@saywhat.org' },
        update: {},
        create: {
          email: 'mike.wilson@saywhat.org',
          username: 'mike.wilson',
          firstName: 'Mike',
          lastName: 'Wilson',
          role: 'USER',
          department: 'Information Technology',
          position: 'Software Developer',
          isActive: true
        }
      }),
      prisma.user.upsert({
        where: { email: 'sarah.brown@saywhat.org' },
        update: {},
        create: {
          email: 'sarah.brown@saywhat.org',
          username: 'sarah.brown',
          firstName: 'Sarah',
          lastName: 'Brown',
          role: 'USER',
          department: 'Finance',
          position: 'Accountant',
          isActive: true
        }
      })
    ]);

    console.log('Users created:', users.length);

    // Create employees
    const employees = await Promise.all([
      prisma.employee.upsert({
        where: { employeeId: 'EMP001' },
        update: {},
        create: {
          userId: users[0].id,
          employeeId: 'EMP001',
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@saywhat.org',
          phoneNumber: '+263 77 123 4567',
          department: 'Information Technology',
          departmentId: itDept.id,
          position: 'IT Manager',
          employmentType: 'FULL_TIME',
          startDate: new Date('2023-01-15'),
          hireDate: new Date('2023-01-15'),
          salary: 5000,
          status: 'ACTIVE',
          isSupervisor: true,
          isReviewer: true
        }
      }),
      prisma.employee.upsert({
        where: { employeeId: 'EMP002' },
        update: {},
        create: {
          userId: users[1].id,
          employeeId: 'EMP002',
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane.doe@saywhat.org',
          phoneNumber: '+263 77 234 5678',
          department: 'Human Resources',
          departmentId: hrDept.id,
          position: 'HR Manager',
          employmentType: 'FULL_TIME',
          startDate: new Date('2023-02-01'),
          hireDate: new Date('2023-02-01'),
          salary: 4500,
          status: 'ACTIVE',
          isSupervisor: true,
          isReviewer: true
        }
      }),
      prisma.employee.upsert({
        where: { employeeId: 'EMP003' },
        update: {},
        create: {
          userId: users[2].id,
          employeeId: 'EMP003',
          firstName: 'Mike',
          lastName: 'Wilson',
          email: 'mike.wilson@saywhat.org',
          phoneNumber: '+263 77 345 6789',
          department: 'Information Technology',
          departmentId: itDept.id,
          position: 'Software Developer',
          employmentType: 'FULL_TIME',
          startDate: new Date('2023-03-15'),
          hireDate: new Date('2023-03-15'),
          salary: 3500,
          status: 'ACTIVE',
          supervisorId: null // Will be set to John Smith's employee ID
        }
      }),
      prisma.employee.upsert({
        where: { employeeId: 'EMP004' },
        update: {},
        create: {
          userId: users[3].id,
          employeeId: 'EMP004',
          firstName: 'Sarah',
          lastName: 'Brown',
          email: 'sarah.brown@saywhat.org',
          phoneNumber: '+263 77 456 7890',
          department: 'Finance',
          departmentId: finDept.id,
          position: 'Accountant',
          employmentType: 'FULL_TIME',
          startDate: new Date('2023-04-01'),
          hireDate: new Date('2023-04-01'),
          salary: 3000,
          status: 'ACTIVE'
        }
      })
    ]);

    // Update Mike's supervisor to John
    await prisma.employee.update({
      where: { id: employees[2].id },
      data: { supervisorId: employees[0].id }
    });

    console.log('Employees created:', employees.length);

    // Create some training events
    const trainingEvent = await prisma.event.upsert({
      where: { title: 'SIRTIS System Training' },
      update: {},
      create: {
        title: 'SIRTIS System Training',
        description: 'Complete training on the SIRTIS platform',
        type: 'training',
        status: 'approved',
        startDate: new Date('2025-10-01'),
        endDate: new Date('2025-10-03'),
        location: 'Training Room A',
        maxAttendees: 20,
        department: 'All Departments',
        priority: 'high'
      }
    });

    console.log('Training event created:', trainingEvent.id);

    // Verify the data
    const finalCounts = {
      departments: await prisma.department.count(),
      employees: await prisma.employee.count(),
      users: await prisma.user.count(),
      events: await prisma.event.count()
    };

    console.log('Final counts:', finalCounts);

    await prisma.$disconnect();
    console.log('HR test data seeded successfully!');

  } catch (error) {
    console.error('Error seeding HR data:', error);
    await prisma.$disconnect();
  }
}

seedHRData();
