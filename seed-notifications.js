const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedNotifications() {
  try {
    console.log('🔄 Seeding notification categories...')

    // Insert notification categories
    const categories = [
      {
        id: 'cat_performance',
        name: 'Performance Management',
        description: 'Performance plans, appraisals, and reviews',
        icon: 'chart-bar',
        color: '#3B82F6',
        isActive: true
      },
      {
        id: 'cat_training',
        name: 'Training & Development',
        description: 'Training assignments and completions',
        icon: 'academic-cap',
        color: '#8B5CF6',
        isActive: true
      },
      {
        id: 'cat_deadlines',
        name: 'Deadlines & Reminders',
        description: 'Important deadlines and time-sensitive tasks',
        icon: 'clock',
        color: '#F59E0B',
        isActive: true
      },
      {
        id: 'cat_approvals',
        name: 'Approvals Required',
        description: 'Items requiring management approval',
        icon: 'check-circle',
        color: '#10B981',
        isActive: true
      },
      {
        id: 'cat_escalations',
        name: 'Escalations',
        description: 'Issues requiring immediate attention',
        icon: 'exclamation-triangle',
        color: '#EF4444',
        isActive: true
      }
    ]

    for (const category of categories) {
      await prisma.notification_categories.upsert({
        where: { id: category.id },
        update: category,
        create: category
      })
    }

    console.log('✅ Notification categories seeded successfully!')

    console.log('🔄 Seeding routing rules...')

    // Get first active HR manager or admin for routing
    const hrManager = await prisma.employees.findFirst({
      where: {
        isActive: true,
        OR: [
          { position: { contains: 'HR Manager', mode: 'insensitive' } },
          { position: { contains: 'Manager', mode: 'insensitive' } },
          { department: { contains: 'HR', mode: 'insensitive' } }
        ]
      }
    })

    if (hrManager) {
      // Insert sample routing rules
      const routingRules = [
        {
          id: 'rule_perf_plan',
          name: 'Performance Plan Review',
          notificationType: 'PERFORMANCE_PLAN',
          conditions: {},
          priority: 5,
          isActive: true
        },
        {
          id: 'rule_appraisal',
          name: 'Appraisal Processing',
          notificationType: 'APPRAISAL',
          conditions: {},
          priority: 4,
          isActive: true
        },
        {
          id: 'rule_training',
          name: 'Training Assignment',
          notificationType: 'TRAINING',
          conditions: {},
          priority: 3,
          isActive: true
        }
      ]

      for (const rule of routingRules) {
        const createdRule = await prisma.notification_routing_rules.upsert({
          where: { id: rule.id },
          update: rule,
          create: rule
        })

        // Create a default route to HR manager
        await prisma.notification_routes.upsert({
          where: {
            routingRuleId_recipientId: {
              routingRuleId: createdRule.id,
              recipientId: hrManager.id
            }
          },
          update: {
            delayMinutes: 0
          },
          create: {
            routingRuleId: createdRule.id,
            recipientId: hrManager.id,
            delayMinutes: 0
          }
        })
      }

      console.log('✅ Routing rules seeded successfully!')
    } else {
      console.log('⚠️  No HR manager found, skipping routing rules seeding')
    }

    console.log('🎉 Notification seeding completed!')
  } catch (error) {
    console.error('❌ Error seeding notifications:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  seedNotifications()
    .then(() => {
      console.log('✅ Seeding completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error)
      process.exit(1)
    })
}

module.exports = { seedNotifications }