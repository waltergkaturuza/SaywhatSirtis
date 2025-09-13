import { PrismaClient, UserRole, RiskCategory, RiskProbability, RiskImpact, RiskStatus, MitigationStatus } from '@prisma/client'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

async function safeSeed() {
  console.log('🌱 Starting SAFE database seeding...')
  
  // First, check if data already exists
  console.log('🔍 Checking existing data...')
  
  const existingCounts = {
    users: await prisma.users.count(),
    projects: await prisma.projects.count(),
    callRecords: await prisma.call_records.count(),
    activities: await prisma.activities.count()
  }
  
  console.log('📊 Current data counts:', existingCounts)
  
  // Only proceed if database is empty OR if explicitly forced
  const forceReseed = process.env.FORCE_RESEED === 'true'
  const isEmpty = Object.values(existingCounts).every(count => count === 0)
  
  if (!isEmpty && !forceReseed) {
    console.log('⚠️  Database already contains data!')
    console.log('💡 To reseed anyway, set environment variable: FORCE_RESEED=true')
    console.log('🔒 Skipping seed to preserve existing data.')
    console.log('\n📋 Current data preserved:')
    console.log(`   👥 Users: ${existingCounts.users}`)
    console.log(`   📋 Projects: ${existingCounts.projects}`)
    console.log(`   📞 Call Records: ${existingCounts.callRecords}`)
    console.log(`   📝 Activities: ${existingCounts.activities}`)
    return
  }
  
  if (forceReseed) {
    console.log('⚠️  FORCE_RESEED=true detected - clearing existing data...')
    console.log('🗑️  This will DELETE ALL EXISTING DATA!')
    
    // Wait 3 seconds to allow cancellation
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Clear existing data in reverse order of dependencies
    await prisma.activities.deleteMany({})
    await prisma.call_records.deleteMany({})
    await prisma.projects.deleteMany({})
    await prisma.audit_logs.deleteMany({})
    await prisma.sessions.deleteMany({})
    await prisma.accounts.deleteMany({})
    await prisma.users.deleteMany({})
    
    console.log('✅ Existing data cleared')
  }

  // Create Users (only if they don't exist)
  console.log('👥 Creating users...')
  
  const adminExists = await prisma.users.findUnique({ where: { email: 'admin@saywhat.org' } })
  if (!adminExists) {
    await prisma.users.create({
      data: {
        id: randomUUID(),
        email: 'admin@saywhat.org',
        username: 'admin',
        firstName: 'System',
        lastName: 'Administrator',
        role: 'SYSTEM_ADMINISTRATOR' as any,
        department: 'IT',
        position: 'System Administrator',
        phoneNumber: '+27123456789',
        location: 'Cape Town, South Africa',
        isActive: true,
        roles: ['ADMIN', 'SUPER_USER'],
        twoFactorEnabled: true,
        updatedAt: new Date(),
      }
    })
    console.log('   ✅ Created admin user')
  } else {
    console.log('   ℹ️  Admin user already exists')
  }

  const pmExists = await prisma.users.findUnique({ where: { email: 'pm@saywhat.org' } })
  if (!pmExists) {
    await prisma.users.create({
      data: {
        id: randomUUID(),
        email: 'pm@saywhat.org',
        username: 'projectmanager',
        firstName: 'John',
        lastName: 'Smith',
        role: 'ADVANCE_USER_2' as any,
        department: 'Programs',
        position: 'Project Manager',
        phoneNumber: '+27123456790',
        location: 'Johannesburg, South Africa',
        isActive: true,
        roles: ['PROJECT_MANAGER', 'PROJECT_LEAD'],
        updatedAt: new Date(),
      }
    })
    console.log('   ✅ Created project manager')
  } else {
    console.log('   ℹ️  Project manager already exists')
  }

  // Only create sample projects if none exist
  const projectCount = await prisma.projects.count()
  if (projectCount === 0) {
    console.log('📋 Creating sample projects...')
    
    const admin = await prisma.users.findUnique({ where: { email: 'admin@saywhat.org' } })
    const projectManager = await prisma.users.findUnique({ where: { email: 'pm@saywhat.org' } })
    
    if (admin && projectManager) {
      await prisma.projects.create({
        data: {
          id: randomUUID(),
          name: 'Community Water Access Program',
          description: 'Implementing sustainable water access solutions in rural communities.',
          objectives: {
            primary: 'Provide clean water access to 10,000 residents',
            secondary: ['Install 25 water points', 'Train 50 community members']
          },
          timeframe: '18 months',
          startDate: new Date('2024-01-15'),
          endDate: new Date('2025-07-15'),
          country: 'South Africa',
          province: 'Eastern Cape',
          budget: 2500000.00,
          actualSpent: 450000.00,
          status: 'ACTIVE',
          priority: 'HIGH',
          progress: 25,
          currency: 'ZAR',
          creatorId: admin.id,
          managerId: projectManager.id,
          updatedAt: new Date(),
        }
      })
      console.log('   ✅ Created sample project')
    }
  } else {
    console.log('   ℹ️  Projects already exist, skipping sample creation')
  }

  // Only create sample risks if none exist
  const riskCount = await prisma.risks.count()
  if (riskCount === 0) {
    console.log('🚨 Creating sample risks...')
    
    const admin = await prisma.users.findUnique({ where: { email: 'admin@saywhat.org' } })
    const projectManager = await prisma.users.findUnique({ where: { email: 'pm@saywhat.org' } })
    
    if (admin && projectManager) {
      const risks = [
        {
          riskId: 'RISK-2025-001',
          title: 'Staff Turnover in Programs Department',
          description: 'High turnover rate affecting program continuity and institutional knowledge retention. Loss of experienced staff members impacts project delivery and mentorship of new employees.',
          category: RiskCategory.HR_PERSONNEL,
          department: 'Programs',
          probability: RiskProbability.HIGH,
          impact: RiskImpact.HIGH,
          riskScore: 9,
          status: RiskStatus.OPEN,
          ownerId: admin.id,
          createdById: admin.id,
          tags: ['SDG-4', 'HR-Priority', 'Q1-2025']
        },
        {
          riskId: 'RISK-2025-002',
          title: 'Donor Funding Shortfall',
          description: 'Potential 30% reduction in donor funding for next fiscal year due to global economic conditions and donor priorities shifting.',
          category: RiskCategory.FINANCIAL,
          department: 'Finance',
          probability: RiskProbability.MEDIUM,
          impact: RiskImpact.HIGH,
          riskScore: 6,
          status: RiskStatus.OPEN,
          ownerId: projectManager.id,
          createdById: projectManager.id,
          tags: ['Donor-Critical', 'Budget-2025']
        },
        {
          riskId: 'RISK-2025-003',
          title: 'Cybersecurity Data Breach',
          description: 'Vulnerable systems and increasing cyber threats could lead to beneficiary data exposure and system downtime.',
          category: RiskCategory.CYBERSECURITY,
          department: 'IT',
          probability: RiskProbability.LOW,
          impact: RiskImpact.HIGH,
          riskScore: 3,
          status: RiskStatus.MITIGATED,
          ownerId: admin.id,
          createdById: admin.id,
          tags: ['ISO-27001', 'Data-Protection']
        },
        {
          riskId: 'RISK-2025-004',
          title: 'Compliance Audit Findings',
          description: 'Non-compliance with new donor reporting requirements and regulatory standards could result in funding suspension.',
          category: RiskCategory.COMPLIANCE,
          department: 'Finance',
          probability: RiskProbability.MEDIUM,
          impact: RiskImpact.MEDIUM,
          riskScore: 4,
          status: RiskStatus.OPEN,
          ownerId: projectManager.id,
          createdById: admin.id,
          tags: ['Audit-2025', 'Compliance-Critical']
        },
        {
          riskId: 'RISK-2025-005',
          title: 'Community Engagement Decline',
          description: 'Reduced community participation in programs due to competing priorities and external factors.',
          category: RiskCategory.OPERATIONAL,
          department: 'Programs',
          probability: RiskProbability.MEDIUM,
          impact: RiskImpact.MEDIUM,
          riskScore: 4,
          status: RiskStatus.OPEN,
          ownerId: projectManager.id,
          createdById: projectManager.id,
          tags: ['SDG-11', 'Community-Relations']
        }
      ]

      for (const riskData of risks) {
        const risk = await prisma.risks.create({
          data: {
            ...riskData,
            id: randomUUID(),
            updatedAt: new Date(),
          }
        })
        console.log(`   ✅ Created risk: ${risk.riskId}`)
        
        // Create sample mitigations for each risk
        if (risk.riskId === 'RISK-2025-001') {
          await prisma.risk_mitigations.create({
            data: {
              id: randomUUID(),
              riskId: risk.id,
              strategy: 'Implement comprehensive staff retention program with competitive compensation and career development opportunities.',
              controlMeasure: 'Regular staff satisfaction surveys and exit interviews to identify retention issues early.',
              ownerId: admin.id,
              deadline: new Date('2025-06-30'),
              implementationProgress: 45,
              status: MitigationStatus.IN_PROGRESS,
              milestones: [
                { title: 'Salary review completed', completed: true, date: '2025-01-15' },
                { title: 'Training program launched', completed: true, date: '2025-02-01' },
                { title: 'Mentorship program rollout', completed: false, targetDate: '2025-04-01' }
              ],
              lastUpdated: new Date(),
              updatedAt: new Date(),
            }
          })
        }
        
        if (risk.riskId === 'RISK-2025-003') {
          await prisma.risk_mitigations.create({
            data: {
              id: randomUUID(),
              riskId: risk.id,
              strategy: 'Implement multi-factor authentication, regular security audits, and staff cybersecurity training.',
              controlMeasure: 'Monthly penetration testing and quarterly security awareness training for all staff.',
              ownerId: admin.id,
              deadline: new Date('2025-03-31'),
              implementationProgress: 90,
              status: MitigationStatus.COMPLETED,
              completedAt: new Date('2025-02-28'),
              milestones: [
                { title: 'MFA implementation', completed: true, date: '2025-01-20' },
                { title: 'Security audit completed', completed: true, date: '2025-02-15' },
                { title: 'Staff training completed', completed: true, date: '2025-02-28' }
              ],
              lastUpdated: new Date(),
              updatedAt: new Date(),
            }
          })
        }
      }
      
      console.log('   ✅ Created 5 sample risks with mitigations')
    }
  } else {
    console.log('   ℹ️  Risks already exist, skipping sample creation')
  }

  console.log('\n🎉 Safe seeding completed!')
  
  // Final counts
  const finalCounts = {
    users: await prisma.users.count(),
    projects: await prisma.projects.count(),
    callRecords: await prisma.call_records.count(),
    activities: await prisma.activities.count(),
    risks: await prisma.risks.count(),
    mitigations: await prisma.risk_mitigations.count()
  }
  
  console.log('📊 Final data counts:', finalCounts)
}

async function main() {
  try {
    await safeSeed()
  } catch (error) {
    console.error('❌ Error during safe seeding:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .then(() => {
    console.log('✅ Safe seed completed successfully')
  })
  .catch((error) => {
    console.error('❌ Safe seed failed:', error)
    process.exit(1)
  })
