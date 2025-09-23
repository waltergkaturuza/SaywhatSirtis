import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Zod schema for audit validation
const auditSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['FULL_INVENTORY', 'PARTIAL_INVENTORY', 'COMPLIANCE_AUDIT', 'FINANCIAL_AUDIT', 'SECURITY_AUDIT', 'QUALITY_AUDIT']),
  scheduledDate: z.string().transform((val) => new Date(val)),
  auditor: z.string().min(1, 'Auditor is required'),
  description: z.string().optional(),
  assets: z.array(z.string()).default([])
})

// GET - List audits with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const auditor = searchParams.get('auditor')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const offset = (page - 1) * limit

    // Build filter conditions
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { auditor: { contains: search } }
      ]
    }
    
    if (status) where.status = status
    if (type) where.type = type
    if (auditor) where.auditor = { contains: auditor }
    
    if (dateFrom || dateTo) {
      where.scheduledDate = {}
      if (dateFrom) where.scheduledDate.gte = new Date(dateFrom)
      if (dateTo) where.scheduledDate.lte = new Date(dateTo)
    }

    // Query audits from database
    const [audits, totalCount] = await Promise.all([
      prisma.audit.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        include: {
          assets: {
            select: {
              id: true,
              name: true,
              assetTag: true
            }
          }
        }
      }),
      prisma.audit.count({ where })
    ])

    // Transform the data to match frontend expectations
    const transformedAudits = audits.map(audit => ({
      id: audit.id,
      name: audit.name,
      type: audit.type,
      status: audit.status,
      scheduledDate: audit.scheduledDate,
      completedDate: audit.completedDate,
      auditor: audit.auditor,
      description: audit.description,
      assets: audit.assets.map(asset => asset.id),
      findings: audit.findings || [],
      recommendations: audit.recommendations || [],
      progress: audit.progress || 0,
      createdAt: audit.createdAt,
      updatedAt: audit.updatedAt
    }))

    return NextResponse.json({
      audits: transformedAudits,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching audits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audits' },
      { status: 500 }
    )
  }
}

// POST - Create new audit
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate input
    const validationResult = auditSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.issues
        },
        { status: 400 }
      )
    }

    const { name, type, scheduledDate, auditor, description, assets } = validationResult.data

    // Create audit in database
    const newAudit = await prisma.audit.create({
      data: {
        name,
        type,
        scheduledDate,
        auditor,
        description,
        status: 'PENDING',
        progress: 0,
        findings: [],
        recommendations: [],
        // Connect assets if provided
        ...(assets.length > 0 && {
          assets: {
            connect: assets.map(assetId => ({ id: assetId }))
          }
        })
      },
      include: {
        assets: {
          select: {
            id: true,
            name: true,
            assetTag: true
          }
        }
      }
    })

    return NextResponse.json({
      audit: {
        id: newAudit.id,
        name: newAudit.name,
        type: newAudit.type,
        status: newAudit.status,
        scheduledDate: newAudit.scheduledDate,
        completedDate: newAudit.completedDate,
        auditor: newAudit.auditor,
        description: newAudit.description,
        assets: newAudit.assets.map(asset => asset.id),
        findings: newAudit.findings || [],
        recommendations: newAudit.recommendations || [],
        progress: newAudit.progress || 0,
        createdAt: newAudit.createdAt,
        updatedAt: newAudit.updatedAt
      },
      message: 'Audit created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating audit:', error)
    return NextResponse.json(
      { error: 'Failed to create audit' },
      { status: 500 }
    )
  }
}

// PUT - Update audit
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Audit ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Update audit in database
    const updatedAudit = await prisma.audit.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date()
      },
      include: {
        assets: {
          select: {
            id: true,
            name: true,
            assetTag: true
          }
        }
      }
    })

    return NextResponse.json({
      audit: {
        id: updatedAudit.id,
        name: updatedAudit.name,
        type: updatedAudit.type,
        status: updatedAudit.status,
        scheduledDate: updatedAudit.scheduledDate,
        completedDate: updatedAudit.completedDate,
        auditor: updatedAudit.auditor,
        description: updatedAudit.description,
        assets: updatedAudit.assets.map(asset => asset.id),
        findings: updatedAudit.findings || [],
        recommendations: updatedAudit.recommendations || [],
        progress: updatedAudit.progress || 0,
        createdAt: updatedAudit.createdAt,
        updatedAt: updatedAudit.updatedAt
      },
      message: 'Audit updated successfully'
    })

  } catch (error) {
    console.error('Error updating audit:', error)
    return NextResponse.json(
      { error: 'Failed to update audit' },
      { status: 500 }
    )
  }
}

// DELETE - Delete audit
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Audit ID is required' },
        { status: 400 }
      )
    }

    // Delete audit from database
    await prisma.audit.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Audit deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting audit:', error)
    return NextResponse.json(
      { error: 'Failed to delete audit' },
      { status: 500 }
    )
  }
}
