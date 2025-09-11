import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/risk-management/risks/[id] - Get single risk
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const risk = await prisma.risk.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        mitigations: {
          select: {
            id: true,
            strategy: true,
            controlMeasure: true,
            status: true,
            implementationProgress: true
          }
        },
        assessments: true,
        _count: {
          select: {
            mitigations: true,
            assessments: true,
            documents: true
          }
        }
      }
    })

    if (!risk) {
      return Response.json({ error: 'Risk not found' }, { status: 404 })
    }

    return Response.json({
      success: true,
      data: { risk }
    })

  } catch (error) {
    console.error('Error fetching risk:', error)
    return Response.json(
      { error: 'Failed to fetch risk' },
      { status: 500 }
    )
  }
}

// PUT /api/risk-management/risks/[id] - Update risk
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      category,
      department,
      probability,
      impact,
      status,
      ownerId,
      tags
    } = body

    // Calculate risk score
    const probabilityMap: Record<string, number> = {
      'VERY_LOW': 1,
      'LOW': 2,
      'MEDIUM': 3,
      'HIGH': 4,
      'VERY_HIGH': 5
    }
    const probabilityScore = probabilityMap[probability] || 3

    const impactMap: Record<string, number> = {
      'VERY_LOW': 1,
      'LOW': 2,
      'MEDIUM': 3,
      'HIGH': 4,
      'VERY_HIGH': 5
    }
    const impactScore = impactMap[impact] || 3

    const riskScore = probabilityScore * impactScore

    const risk = await prisma.risk.update({
      where: { id },
      data: {
        title,
        description,
        category,
        department,
        probability,
        impact,
        riskScore,
        status,
        ownerId: ownerId || null,
        tags: tags || [],
        updatedAt: new Date()
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        mitigations: true,
        _count: {
          select: {
            mitigations: true,
            assessments: true,
            documents: true
          }
        }
      }
    })

    return Response.json({
      success: true,
      data: { risk }
    })

  } catch (error) {
    console.error('Error updating risk:', error)
    return Response.json(
      { error: 'Failed to update risk' },
      { status: 500 }
    )
  }
}

// DELETE /api/risk-management/risks/[id] - Delete risk
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if risk exists
    const existingRisk = await prisma.risk.findUnique({
      where: { id },
      include: {
        mitigations: true,
        assessments: true
      }
    })

    if (!existingRisk) {
      return Response.json({ error: 'Risk not found' }, { status: 404 })
    }

    // Delete related records first (cascade delete)
    await prisma.$transaction([
      // Delete risk assessments
      prisma.riskAssessment.deleteMany({
        where: { riskId: id }
      }),
      // Delete risk mitigations
      prisma.riskMitigation.deleteMany({
        where: { riskId: id }
      }),
      // Delete the risk itself
      prisma.risk.delete({
        where: { id }
      })
    ])

    return Response.json({
      success: true,
      message: 'Risk deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting risk:', error)
    return Response.json(
      { error: 'Failed to delete risk' },
      { status: 500 }
    )
  }
}
