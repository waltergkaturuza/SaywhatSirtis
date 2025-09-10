import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get basic document insights from existing data
    const totalDocuments = await prisma.document.count({
      where: {
        OR: [
          { uploadedBy: session.user.id },
          { isPublic: true }
        ]
      }
    })

    const recentDocuments = await prisma.document.count({
      where: {
        OR: [
          { uploadedBy: session.user.id },
          { isPublic: true }
        ],
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    })

    // Group documents by type
    const documentsByType = await prisma.document.groupBy({
      by: ['mimeType'],
      where: {
        OR: [
          { uploadedBy: session.user.id },
          { isPublic: true }
        ]
      },
      _count: {
        id: true
      }
    })

    // Calculate total storage used
    const storageUsed = await prisma.document.aggregate({
      where: {
        OR: [
          { uploadedBy: session.user.id },
          { isPublic: true }
        ]
      },
      _sum: {
        size: true
      }
    })

    const insights = {
      overview: {
        totalDocuments,
        recentDocuments,
        totalSize: storageUsed._sum.size || 0
      },
      distribution: {
        byType: documentsByType.map(item => ({
          type: item.mimeType,
          count: item._count.id
        }))
      },
      trends: {
        weeklyGrowth: recentDocuments,
        averageSize: totalDocuments > 0 ? Math.round((storageUsed._sum.size || 0) / totalDocuments) : 0
      }
    }

    return NextResponse.json({
      success: true,
      insights,
      message: 'Document insights retrieved successfully'
    })

  } catch (error) {
    console.error('Error retrieving insights:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve insights' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      message: 'AI insights endpoint ready',
      features: ['document analytics', 'usage patterns', 'content trends']
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to process insights request' },
      { status: 500 }
    )
  }
}
