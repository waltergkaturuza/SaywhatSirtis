import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create default roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'System Administrator',
      permissions: JSON.stringify([
        'users.create', 'users.read', 'users.update', 'users.delete',
        'roles.create', 'roles.read', 'roles.update', 'roles.delete',
        'programs.create', 'programs.read', 'programs.update', 'programs.delete',
        'hr.create', 'hr.read', 'hr.update', 'hr.delete',
        'callcentre.create', 'callcentre.read', 'callcentre.update', 'callcentre.delete',
        'inventory.create', 'inventory.read', 'inventory.update', 'inventory.delete',
        'documents.create', 'documents.read', 'documents.update', 'documents.delete'
      ])
    }
  })

  const managerRole = await prisma.role.upsert({
    where: { name: 'manager' },
    update: {},
    create: {
      name: 'manager',
      description: 'Department Manager',
      permissions: JSON.stringify([
        'programs.read', 'programs.update',
        'hr.read', 'hr.update',
        'callcentre.read', 'callcentre.update',
        'inventory.read', 'inventory.update',
        'documents.read', 'documents.update'
      ])
    }
  })

  const employeeRole = await prisma.role.upsert({
    where: { name: 'employee' },
    update: {},
    create: {
      name: 'employee',
      description: 'Regular Employee',
      permissions: JSON.stringify([
        'programs.read',
        'hr.read',
        'callcentre.read',
        'inventory.read',
        'documents.read'
      ])
    }
  })

  // Create default departments
  const itDepartment = await prisma.department.upsert({
    where: { name: 'Information Technology' },
    update: {},
    create: {
      name: 'Information Technology',
      description: 'Manages technology infrastructure and systems'
    }
  })

  const hrDepartment = await prisma.department.upsert({
    where: { name: 'Human Resources' },
    update: {},
    create: {
      name: 'Human Resources',
      description: 'Manages employee relations and organizational development'
    }
  })

  const programsDepartment = await prisma.department.upsert({
    where: { name: 'Programs' },
    update: {},
    create: {
      name: 'Programs',
      description: 'Manages organizational programs and projects'
    }
  })

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@saywhat.org' },
    update: {},
    create: {
      email: 'admin@saywhat.org',
      firstName: 'System',
      lastName: 'Administrator',
      department: 'Information Technology',
      position: 'System Administrator',
      hashedPassword: '$2a$10$rZvGJ5xI7gMEwAi8IWW8KO7/Eo3QKsVxQhVJ2X7w9m0N1QmRZJQzK', // "password123"
      emailVerified: new Date(),
      isActive: true
    }
  })

  console.log('✅ Database seeded successfully!')
  console.log({
    roles: { admin: adminRole.id, manager: managerRole.id, employee: employeeRole.id },
    departments: { it: itDepartment.id, hr: hrDepartment.id, programs: programsDepartment.id },
    users: { admin: adminUser.id }
  })
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
