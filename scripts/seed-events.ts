import { PrismaClient, EventStatus } from '@prisma/client'

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
        name: 'SAYWHAT Admin',
        role: 'ADMIN',
        isActive: true,
      }
    })
  }

  // Create some sample events
  const sampleEvents = [
    {
      name: 'Youth Leadership Conference 2025',
      description: 'Annual conference bringing together young leaders from across Zimbabwe to discuss empowerment and development opportunities.',
      startDate: new Date('2025-09-15'),
      startTime: '09:00',
      endDate: new Date('2025-09-17'),
      endTime: '17:00',
      location: 'Harare',
      expectedAttendees: 150,
      status: 'PLANNING' as EventStatus,
      category: 'CONFERENCE' as any,
      budget: 25000,
      organizerUserId: organizer.id,
    },
    {
      name: 'Women in Tech Workshop',
      description: 'Hands-on workshop focusing on digital skills and technology for women entrepreneurs.',
      startDate: new Date('2025-08-30'),
      startTime: '08:30',
      endDate: new Date('2025-08-30'),
      endTime: '16:30',
      location: 'Bulawayo',
      expectedAttendees: 50,
      status: 'ACTIVE' as EventStatus,
      category: 'WORKSHOP' as any,
      budget: 8000,
      organizerUserId: organizer.id,
    },
    {
      name: 'Community Outreach - Masvingo',
      description: 'Community engagement program to raise awareness about youth development initiatives.',
      startDate: new Date('2025-07-20'),
      startTime: '10:00',
      endDate: new Date('2025-07-20'),
      endTime: '15:00',
      location: 'Masvingo',
      expectedAttendees: 200,
      actualAttendees: 180,
      status: 'COMPLETED' as EventStatus,
      category: 'OUTREACH' as any,
      budget: 5000,
      actualCost: 4500,
      organizerUserId: organizer.id,
    },
    {
      name: 'Fundraising Gala 2025',
      description: 'Annual fundraising event to support SAYWHAT programs and initiatives.',
      startDate: new Date('2025-12-10'),
      startTime: '18:00',
      endDate: new Date('2025-12-10'),
      endTime: '23:00',
      location: 'Harare',
      expectedAttendees: 300,
      status: 'PLANNING' as EventStatus,
      category: 'FUNDRAISING' as any,
      budget: 50000,
      organizerUserId: organizer.id,
    },
  ]

  for (const eventData of sampleEvents) {
    await prisma.flagshipEvent.create({
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
