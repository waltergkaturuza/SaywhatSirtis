const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createEvent() {
  try {
    console.log('Creating training event...');
    
    const trainingEvent = await prisma.event.create({
      data: {
        title: 'SIRTIS System Training',
        description: 'Complete training on the SIRTIS platform',
        type: 'training',
        status: 'approved',
        startDate: new Date('2025-10-01'),
        endDate: new Date('2025-10-03'),
        location: 'Training Room A',
        capacity: 20,
        requiresRegistration: true,
        registrationDeadline: new Date('2025-09-25'),
        budget: 5000,
        actualCost: 0
      }
    });

    console.log('Training event created:', trainingEvent.id);

    // Check final counts
    const counts = {
      departments: await prisma.department.count(),
      employees: await prisma.employee.count(),
      events: await prisma.event.count()
    };

    console.log('Final counts:', counts);

    await prisma.$disconnect();

  } catch (error) {
    console.error('Error creating event:', error);
    await prisma.$disconnect();
  }
}

createEvent();
