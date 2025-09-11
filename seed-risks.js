const { PrismaClient, RiskCategory, RiskProbability, RiskImpact, RiskStatus, MitigationStatus } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedRisksOnly() {
  try {
    console.log('🚨 Seeding risk data only...');
    
    // Check if users exist first
    const admin = await prisma.user.findUnique({ where: { email: 'admin@saywhat.org' } });
    const projectManager = await prisma.user.findUnique({ where: { email: 'pm@saywhat.org' } });
    
    if (!admin || !projectManager) {
      console.error('❌ Required users not found. Please ensure users are seeded first.');
      return;
    }
    
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
    ];

    for (const riskData of risks) {
      const risk = await prisma.risk.create({
        data: riskData
      });
      console.log(`   ✅ Created risk: ${risk.riskId}`);
      
      // Create sample mitigations for specific risks
      if (risk.riskId === 'RISK-2025-001') {
        await prisma.riskMitigation.create({
          data: {
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
            ]
          }
        });
        console.log(`     ✅ Added mitigation for ${risk.riskId}`);
      }
      
      if (risk.riskId === 'RISK-2025-003') {
        await prisma.riskMitigation.create({
          data: {
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
            ]
          }
        });
        console.log(`     ✅ Added mitigation for ${risk.riskId}`);
      }
    }
    
    console.log('🎉 Risk seeding completed!');
    
    // Final counts
    const finalCounts = {
      risks: await prisma.risk.count(),
      mitigations: await prisma.riskMitigation.count()
    };
    
    console.log('📊 Risk data counts:', finalCounts);
    
  } catch (error) {
    console.error('❌ Error seeding risks:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedRisksOnly();
