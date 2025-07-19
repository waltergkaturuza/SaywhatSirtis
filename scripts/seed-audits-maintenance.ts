import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedAuditsAndMaintenance() {
  console.log('🌱 Seeding audits and maintenance data...')

  try {
    // Get existing assets to reference
    const assets = await prisma.asset.findMany()
    
    if (assets.length === 0) {
      console.log('❌ No assets found. Please run asset seeding first.')
      return
    }

    // Create sample audits
    const audits = [
      {
        name: 'Q3 2024 Full Inventory Audit',
        type: 'FULL_INVENTORY' as const,
        status: 'COMPLETED' as const,
        scheduledDate: new Date('2024-07-15'),
        completedDate: new Date('2024-07-18'),
        auditor: 'Jane Smith',
        description: 'Comprehensive audit of all company assets',
        findings: JSON.stringify([
          'All IT equipment accounted for',
          'Two furniture items need repair',
          'Vehicle maintenance schedules up to date'
        ]),
        recommendations: JSON.stringify([
          'Schedule furniture repairs',
          'Implement monthly mini-audits',
          'Update asset tracking system'
        ]),
        assets: JSON.stringify(assets.slice(0, 3).map(a => a.id)),
        progress: 100
      },
      {
        name: 'IT Equipment Security Audit',
        type: 'SECURITY_AUDIT' as const,
        status: 'IN_PROGRESS' as const,
        scheduledDate: new Date('2024-08-01'),
        auditor: 'Mike Johnson',
        description: 'Security assessment of IT infrastructure',
        assets: JSON.stringify(assets.filter(a => a.assetType === 'TECHNOLOGY').map(a => a.id)),
        progress: 65
      },
      {
        name: 'Vehicle Fleet Compliance Check',
        type: 'COMPLIANCE_AUDIT' as const,
        status: 'PENDING' as const,
        scheduledDate: new Date('2024-08-15'),
        auditor: 'Sarah Wilson',
        description: 'Regulatory compliance audit for vehicle fleet',
        assets: JSON.stringify(assets.filter(a => a.assetType === 'VEHICLE').map(a => a.id)),
        progress: 0
      }
    ]

    console.log('📋 Creating audit records...')
    for (const audit of audits) {
      const created = await prisma.inventoryAudit.create({
        data: audit
      })
      console.log(`✅ Created audit: ${created.name}`)
    }

    // Create sample maintenance records
    const maintenanceRecords = [
      {
        assetId: assets[0].id, // First asset
        maintenanceType: 'PREVENTIVE' as const,
        description: 'Monthly software updates and security patches',
        scheduledDate: new Date('2024-07-10'),
        completedDate: new Date('2024-07-10'),
        cost: 50.00,
        performedBy: 'IT Support Team',
        status: 'COMPLETED' as const
      },
      {
        assetId: assets[1].id, // Second asset
        maintenanceType: 'CORRECTIVE' as const,
        description: 'Repair printer paper jam mechanism',
        scheduledDate: new Date('2024-07-20'),
        completedDate: new Date('2024-07-22'),
        cost: 125.00,
        performedBy: 'Technical Services',
        status: 'COMPLETED' as const
      },
      {
        assetId: assets[2].id, // Third asset
        maintenanceType: 'PREVENTIVE' as const,
        description: 'Quarterly furniture inspection and cleaning',
        scheduledDate: new Date('2024-08-01'),
        cost: 75.00,
        performedBy: 'Facilities Team',
        status: 'SCHEDULED' as const
      },
      {
        assetId: assets[0].id, // Back to first asset
        maintenanceType: 'UPGRADE' as const,
        description: 'Hardware diagnostics and performance analysis',
        scheduledDate: new Date('2024-08-10'),
        cost: 100.00,
        performedBy: 'IT Support Team',
        status: 'SCHEDULED' as const
      }
    ]

    console.log('🔧 Creating maintenance records...')
    for (const record of maintenanceRecords) {
      const created = await prisma.assetMaintenance.create({
        data: record
      })
      console.log(`✅ Created maintenance record for asset: ${record.assetId}`)
    }

    // Get final counts
    const auditCount = await prisma.inventoryAudit.count()
    const maintenanceCount = await prisma.assetMaintenance.count()

    console.log('\n🎉 Seeding completed successfully!')
    console.log(`📊 Total audits: ${auditCount}`)
    console.log(`🔧 Total maintenance records: ${maintenanceCount}`)

  } catch (error) {
    console.error('❌ Error seeding audit and maintenance data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  seedAuditsAndMaintenance()
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export { seedAuditsAndMaintenance }
