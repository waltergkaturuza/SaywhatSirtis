import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Supabase database...')

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@saywhat.org' },
    update: {},
    create: {
      email: 'admin@saywhat.org',
      username: 'admin',
      firstName: 'System',
      lastName: 'Administrator',
      role: 'ADMIN',
      department: 'IT',
      position: 'System Administrator',
      isActive: true,
      emailVerified: new Date(),
    },
  })

  console.log('✅ Created admin user:', adminUser.email)

  // Create sample project
  const sampleProject = await prisma.project.upsert({
    where: { id: 'sample-project-1' },
    update: {},
    create: {
      id: 'sample-project-1',
      name: 'SAYWHAT Community Health Initiative',
      description: 'A comprehensive community health program focusing on maternal and child health in Zimbabwe.',
      status: 'ACTIVE',
      priority: 'HIGH',
      progress: 45,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      country: 'Zimbabwe',
      province: 'Harare',
      budget: 50000,
      actualSpent: 22500,
      creatorId: adminUser.id,
      objectives: JSON.stringify({
        categories: ['Maternal Health', 'Child protection'],
        projectLead: 'Dr. Sarah Mukamuri',
        implementingOrganizations: ['SAYWHAT', 'Ministry of Health'],
        evaluationFrequency: ['Midterm', 'Endterm'],
        methodologies: ['Narrative', 'Log frame'],
        fundingSource: 'USAID'
      })
    },
  })

  console.log('✅ Created sample project:', sampleProject.name)

  console.log('🎉 Supabase database seeding completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })