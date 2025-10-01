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

    const risk = await prisma.risks.findUnique({
      where: { id },
      include: {
        users_risks_ownerIdTousers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        users_risks_createdByIdTousers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        risk_mitigations: {
          select: {
            id: true,
            strategy: true,
            controlMeasure: true,
            status: true,
            implementationProgress: true
          }
        },
        risk_assessments: true,
        _count: {
          select: {
            risk_mitigations: true,
            risk_assessments: true,
            risk_documents: true
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

    // Check permissions for updating risks - Include HR users with risks_edit
    const userPermissions = session.user.permissions || [];
    const userRoles = session.user.roles || [];
    if (!userPermissions.includes('risk.edit') && 
        !userPermissions.includes('admin.access') &&
        !userPermissions.includes('risks_edit') &&
        !userPermissions.includes('risks.edit') &&
        !userRoles.some(role => ['hr', 'advance_user_1', 'advance_user_2', 'admin', 'manager'].includes(role.toLowerCase()))) {
      return Response.json({ error: 'Insufficient permissions to edit risks' }, { status: 403 });
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

    const risk = await prisma.risks.update({
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
        users_risks_ownerIdTousers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        users_risks_createdByIdTousers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        risk_mitigations: true,
        _count: {
          select: {
            risk_mitigations: true,
            risk_assessments: true,
            risk_documents: true
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

    // Check permissions for deleting risks - Include HR users with risks_edit
    const userPermissions = session.user.permissions || [];
    const userRoles = session.user.roles || [];
    if (!userPermissions.includes('risk.delete') && 
        !userPermissions.includes('admin.access') &&
        !userPermissions.includes('risks_edit') &&
        !userPermissions.includes('risks.edit') &&
        !userRoles.some(role => ['hr', 'advance_user_1', 'advance_user_2', 'admin', 'manager'].includes(role.toLowerCase()))) {
      return Response.json({ error: 'Insufficient permissions to delete risks' }, { status: 403 });
    }

    // Check if risk exists
    const existingRisk = await prisma.risks.findUnique({
      where: { id },
      include: {
        risk_mitigations: true,
        risk_assessments: true
      }
    })

    if (!existingRisk) {
      return Response.json({ error: 'Risk not found' }, { status: 404 })
    }

    // Delete related records first (cascade delete)
    await prisma.$transaction([
      // Delete risk assessments
      prisma.risk_assessments.deleteMany({
        where: { riskId: id }
      }),
      // Delete risk mitigations
      prisma.risk_mitigations.deleteMany({
        where: { riskId: id }
      }),
      // Delete the risk itself
      prisma.risks.delete({
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
