import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

// Mock database for reports
const reports = new Map()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const assetIds = searchParams.get('assetIds')?.split(',') || []

    // Generate sample report data
    const reportData = {
      id: Date.now().toString(),
      type: type || 'asset-register',
      title: `${type?.replace('-', ' ').toUpperCase()} Report`,
      generated: new Date().toISOString(),
      generatedBy: session.user?.name || 'System',
      assetIds,
      summary: {
        totalAssets: assetIds.length,
        totalValue: Math.floor(Math.random() * 1000000),
        avgValue: Math.floor(Math.random() * 10000)
      },
      data: assetIds.map(id => ({
        assetId: id,
        name: `Asset ${id}`,
        value: Math.floor(Math.random() * 50000),
        status: 'active'
      }))
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error('Reports API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, dateRange, assets } = body

    // Generate report based on type
    let reportData: any = {
      id: Date.now().toString(),
      type,
      title: `${type.replace('-', ' ').replace(/\b\w/g, (l: any) => l.toUpperCase())} Report`,
      generated: new Date().toISOString(),
      generatedBy: session.user?.name || 'System',
      dateRange,
      assets
    }

    switch (type) {
      case 'asset-register':
        reportData = {
          ...reportData,
          summary: {
            totalAssets: assets.length,
            activeAssets: Math.floor(assets.length * 0.9),
            inactiveAssets: Math.floor(assets.length * 0.1)
          },
          data: assets.map((assetId: string) => ({
            assetId,
            status: Math.random() > 0.1 ? 'active' : 'inactive',
            lastAudit: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }))
        }
        break

      case 'depreciation':
        reportData = {
          ...reportData,
          summary: {
            totalOriginalValue: Math.floor(Math.random() * 2000000),
            totalCurrentValue: Math.floor(Math.random() * 1500000),
            totalDepreciation: Math.floor(Math.random() * 500000)
          },
          data: assets.map((assetId: string) => ({
            assetId,
            originalValue: Math.floor(Math.random() * 50000),
            currentValue: Math.floor(Math.random() * 30000),
            depreciationRate: Math.floor(Math.random() * 20) + 5
          }))
        }
        break

      case 'financial':
        reportData = {
          ...reportData,
          summary: {
            totalValue: Math.floor(Math.random() * 3000000),
            totalCost: Math.floor(Math.random() * 500000),
            roi: Math.floor(Math.random() * 20) + 5
          },
          data: assets.map((assetId: string) => ({
            assetId,
            procurementCost: Math.floor(Math.random() * 50000),
            maintenanceCost: Math.floor(Math.random() * 5000),
            utilization: Math.floor(Math.random() * 100)
          }))
        }
        break

      default:
        reportData.data = assets.map((assetId: string) => ({
          assetId,
          value: Math.floor(Math.random() * 50000)
        }))
    }

    // Store report
    reports.set(reportData.id, reportData)

    return NextResponse.json(reportData)
  } catch (error) {
    console.error('Reports generation error:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
