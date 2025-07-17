// Script to add sample projects to the database
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedProjects() {
  console.log('🌱 Seeding sample projects...')

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
      actualSpent: 65000
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
      actualSpent: 45000
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
      actualSpent: 25000
    }
  ]

  for (const project of projects) {
    // Check if project already exists
    const existingProject = await prisma.project.findFirst({
      where: { name: project.name }
    })

    if (!existingProject) {
      await prisma.project.create({
        data: {
          ...project,
          objectives: project.objectives as string
        }
      })
      console.log(`✅ Created project: ${project.name}`)
    } else {
      console.log(`⏭️  Project already exists: ${project.name}`)
    }
  }

  console.log('✅ Sample projects seeded successfully!')
}

seedProjects()
  .catch((e) => {
    console.error('❌ Error seeding projects:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
