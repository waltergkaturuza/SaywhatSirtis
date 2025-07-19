import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedAssets() {
  console.log('🌱 Seeding assets...')
  
  // Clear existing assets
  await prisma.assetMaintenance.deleteMany()
  await prisma.asset.deleteMany()
  
  // Create sample assets
  const assets = [
    {
      name: "Dell Latitude 7420 Laptop",
      assetNumber: "IT-2024-0001",
      assetType: "Information Technology Equipment",
      model: "Latitude 7420",
      procurementValue: 1500,
      depreciationRate: 20,
      currentValue: 1200,
      allocation: "IT Department",
      location: "Head Office",
      condition: "EXCELLENT" as const,
      status: "ACTIVE" as const,
      procurementDate: new Date("2024-01-15")
    },
    {
      name: "HP LaserJet Pro Printer",
      assetNumber: "OF-2024-0002",
      assetType: "Office Equipment",
      model: "LaserJet Pro M404n",
      procurementValue: 300,
      depreciationRate: 15,
      currentValue: 240,
      allocation: "Administration",
      location: "Branch Office A",
      condition: "GOOD" as const,
      status: "ACTIVE" as const,
      procurementDate: new Date("2024-02-10")
    },
    {
      name: "Toyota Corolla Company Vehicle",
      assetNumber: "VH-2024-0003",
      assetType: "Vehicles & Transport",
      model: "Corolla 2024",
      procurementValue: 25000,
      depreciationRate: 12,
      currentValue: 22000,
      allocation: "Operations",
      location: "Head Office",
      condition: "EXCELLENT" as const,
      status: "ACTIVE" as const,
      procurementDate: new Date("2024-01-05")
    },
    {
      name: "Industrial Generator",
      assetNumber: "MC-2024-0004",
      assetType: "Machinery",
      model: "Cat C9 Generator",
      procurementValue: 45000,
      depreciationRate: 10,
      currentValue: 42000,
      allocation: "Operations",
      location: "Warehouse",
      condition: "GOOD" as const,
      status: "UNDER_MAINTENANCE" as const,
      procurementDate: new Date("2023-08-15")
    },
    {
      name: "Conference Room Projector",
      assetNumber: "OF-2024-0005",
      assetType: "Office Equipment",
      model: "Epson PowerLite 1795F",
      procurementValue: 800,
      depreciationRate: 18,
      currentValue: 650,
      allocation: "Administration",
      location: "Head Office",
      condition: "EXCELLENT" as const,
      status: "ACTIVE" as const,
      procurementDate: new Date("2023-11-20")
    },
    {
      name: "Server Rack Equipment",
      assetNumber: "IT-2024-0006",
      assetType: "Information Technology Equipment",
      model: "HPE ProLiant DL380 Gen10",
      procurementValue: 8500,
      depreciationRate: 25,
      currentValue: 6000,
      allocation: "IT Department",
      location: "Data Center",
      condition: "GOOD" as const,
      status: "ACTIVE" as const,
      procurementDate: new Date("2023-05-10")
    }
  ]

  for (const assetData of assets) {
    const asset = await prisma.asset.create({
      data: assetData
    })
    console.log(`✅ Created asset: ${asset.name} (${asset.assetNumber})`)
  }

  console.log('🎉 Asset seeding completed!')
}

async function main() {
  try {
    await seedAssets()
  } catch (error) {
    console.error('Error seeding database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
