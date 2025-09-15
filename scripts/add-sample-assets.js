// Add Sample Asset Data
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const sampleAssets = [
  {
    assetTag: 'AST-001',
    name: 'Dell Laptop OptiPlex 7090',
    category: 'Computer',
    description: 'Dell business laptop for office use',
    brand: 'Dell',
    model: 'OptiPlex 7090',
    serialNumber: 'DL789123456',
    purchaseDate: new Date('2023-01-15'),
    purchasePrice: 1200.00,
    currentValue: 900.00,
    condition: 'GOOD',
    status: 'ACTIVE',
    location: 'HR Department'
  },
  {
    assetTag: 'AST-002',
    name: 'HP LaserJet Pro 404dn',
    category: 'Equipment',
    description: 'Office printer for document printing',
    brand: 'HP',
    model: 'LaserJet Pro 404dn',
    serialNumber: 'HP404789123',
    purchaseDate: new Date('2023-03-20'),
    purchasePrice: 350.00,
    currentValue: 280.00,
    condition: 'EXCELLENT',
    status: 'ACTIVE',
    location: 'Admin Office'
  },
  {
    assetTag: 'AST-003',
    name: 'Office Desk Wooden',
    category: 'Furniture',
    description: 'Standard office desk with drawers',
    brand: 'IKEA',
    model: 'BEKANT',
    serialNumber: 'IK160800',
    purchaseDate: new Date('2022-11-10'),
    purchasePrice: 180.00,
    currentValue: 120.00,
    condition: 'GOOD',
    status: 'ACTIVE',
    location: 'Office Floor 2'
  },
  {
    assetTag: 'AST-004',
    name: 'Toyota Hiace Van',
    category: 'Vehicle',
    description: 'Company vehicle for field operations',
    brand: 'Toyota',
    model: 'Hiace',
    serialNumber: 'TY2023HIACE789',
    purchaseDate: new Date('2023-06-01'),
    purchasePrice: 35000.00,
    currentValue: 32000.00,
    condition: 'EXCELLENT',
    status: 'ACTIVE',
    location: 'Vehicle Fleet'
  },
  {
    assetTag: 'AST-005',
    name: 'Samsung Monitor 27"',
    category: 'Computer',
    description: '27-inch 4K monitor for design work',
    brand: 'Samsung',
    model: 'M7 27"',
    serialNumber: 'SM27M7789123',
    purchaseDate: new Date('2023-08-15'),
    purchasePrice: 450.00,
    currentValue: 380.00,
    condition: 'EXCELLENT',
    status: 'ACTIVE',
    location: 'Design Department'
  }
]

async function addSampleAssets() {
  try {
    console.log('🏭 Adding sample asset data...')
    
    for (const assetData of sampleAssets) {
      try {
        const asset = await prisma.asset.create({
          data: assetData
        })
        console.log(`✅ Created asset: ${asset.name} (${asset.assetTag})`)
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️ Asset ${assetData.assetTag} already exists, skipping...`)
        } else {
          console.error(`❌ Error creating asset ${assetData.assetTag}:`, error)
        }
      }
    }
    
    // Check total count
    const totalAssets = await prisma.asset.count()
    console.log(`\n📊 Total assets in database: ${totalAssets}`)
    
  } catch (error) {
    console.error('❌ Error adding sample assets:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addSampleAssets()
