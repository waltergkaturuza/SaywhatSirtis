const { PrismaClient } = require('@prisma/client')
const { randomUUID } = require('crypto')

const prisma = new PrismaClient()

async function seedAdminUsers() {
  try {
    console.log('Starting admin users seed...')

    // Create or update the admin user
    const adminUser = await prisma.users.upsert({
      where: { email: 'admin@saywhat.org' },
      update: {
        lastLogin: new Date(),
        firstName: 'System',
        lastName: 'Administrator',
        department: 'HR',
        position: 'System Administrator',
        role: 'SYSTEM_ADMINISTRATOR',
        isActive: true
      },
      create: {
        id: randomUUID(),
        email: 'admin@saywhat.org',
        firstName: 'System',
        lastName: 'Administrator',
        department: 'HR',
        position: 'System Administrator',
        role: 'SYSTEM_ADMINISTRATOR',
        isActive: true,
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    console.log('Admin user created/updated:', adminUser.email)

    // Create some sample users with proper lastLogin dates
    const sampleUsers = [
      {
        email: 'hr@saywhat.org',
        firstName: 'HR',
        lastName: 'Manager',
        department: 'Human Resource Management',
        position: 'HR Manager',
        role: 'HR',
        lastLogin: new Date(Date.now() - 86400000), // 1 day ago
      },
      {
        email: 'john.doe@saywhat.org',
        firstName: 'John',
        lastName: 'Doe',
        department: 'Programs',
        position: 'Program Officer',
        role: 'BASIC_USER_1',
        lastLogin: new Date(Date.now() - 172800000), // 2 days ago
      },
      {
        email: 'takesure@saywhat.org',
        firstName: 'Takesure',
        lastName: 'Employee',
        department: 'Programs',
        position: 'Program Assistant',
        role: 'BASIC_USER_1',
        lastLogin: new Date(Date.now() - 604800000), // 1 week ago
        isActive: false // This user should show as archived/inactive
      }
    ]

    for (const userData of sampleUsers) {
      const user = await prisma.users.upsert({
        where: { email: userData.email },
        update: {
          ...userData,
          updatedAt: new Date()
        },
        create: {
          id: randomUUID(),
          ...userData,
          isActive: userData.isActive !== false, // Default to active unless specified
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      console.log(`User created/updated: ${user.email} - Active: ${user.isActive}`)
    }

    console.log('Admin users seed completed successfully!')

  } catch (error) {
    console.error('Error seeding admin users:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seed function
if (require.main === module) {
  seedAdminUsers()
    .then(() => {
      console.log('Seed completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Seed failed:', error)
      process.exit(1)
    })
}

module.exports = { seedAdminUsers }
