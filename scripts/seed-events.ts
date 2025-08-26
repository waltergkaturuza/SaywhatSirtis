import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedEvents() {
  console.log('Seeding flagship events...')

  // First, get or create a user to be the organizer
  let organizer = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  })

  if (!organizer) {
    // Create a default admin user if none exists
    organizer = await prisma.user.create({
      data: {
        email: 'admin@saywhat.org',
        firstName: 'SAYWHAT',
        lastName: 'Admin',
        role: 'ADMIN',
        isActive: true,
      }
    })
  }

  // Create some sample events
  const sampleEvents = [
    {
      title: 'Youth Leadership Conference 2025',
      description: 'Annual conference bringing together young leaders from across Zimbabwe to discuss empowerment and development opportunities.',
      type: 'flagship',
      status: 'planning',
      startDate: new Date('2025-09-15'),
      endDate: new Date('2025-09-17'),
      location: 'Harare',
      venue: 'Harare International Conference Centre',
      capacity: 150,
      budget: 25000,
      requiresRegistration: true,
      registrationDeadline: new Date('2025-09-10'),
    },
    {
      title: 'Women in Tech Workshop',
      description: 'Hands-on workshop focusing on digital skills and technology for women entrepreneurs.',
      type: 'training',
      status: 'approved',
      startDate: new Date('2025-08-30'),
      endDate: new Date('2025-08-30'),
      location: 'Bulawayo',
      venue: 'Bulawayo Polytechnic',
      capacity: 50,
      budget: 8000,
      requiresRegistration: true,
      registrationDeadline: new Date('2025-08-25'),
    },
    {
      title: 'Community Outreach - Masvingo',
      description: 'Community engagement program to raise awareness about youth development initiatives.',
      type: 'outreach',
      status: 'completed',
      startDate: new Date('2025-07-20'),
      endDate: new Date('2025-07-20'),
      location: 'Masvingo',
      venue: 'Masvingo Civic Centre',
      capacity: 200,
      budget: 5000,
      actualCost: 4500,
      requiresRegistration: false,
    },
    {
      title: 'Fundraising Gala 2025',
      description: 'Annual fundraising event to support SAYWHAT programs and initiatives.',
      type: 'fundraising',
      startTime: '18:00',
      status: 'planning',
      startDate: new Date('2025-12-10'),
      endDate: new Date('2025-12-10'),
      location: 'Harare',
      venue: 'Harare International Convention Centre',
      capacity: 300,
      budget: 50000,
      requiresRegistration: true,
      registrationDeadline: new Date('2025-12-05'),
    },
  ]

  for (const eventData of sampleEvents) {
    await prisma.event.create({
      data: eventData,
    })
  }

  console.log(`Created ${sampleEvents.length} flagship events`)
}

async function main() {
  try {
    await seedEvents()
    console.log('Flagship events seeding completed successfully!')
  } catch (error) {
    console.error('Error seeding flagship events:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
}

export { seedEvents }
