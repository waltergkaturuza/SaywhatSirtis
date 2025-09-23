import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Define types for risk enums
type RiskCategory = 'OPERATIONAL' | 'STRATEGIC' | 'FINANCIAL' | 'COMPLIANCE' | 'REPUTATIONAL' | 'ENVIRONMENTAL' | 'CYBERSECURITY' | 'HR_PERSONNEL';
type RiskProbability = 'LOW' | 'MEDIUM' | 'HIGH';
type RiskImpact = 'LOW' | 'MEDIUM' | 'HIGH';
type RiskStatus = 'OPEN' | 'MITIGATED' | 'ESCALATED' | 'CLOSED';

// Helper function to calculate risk score
function calculateRiskScore(probability: RiskProbability, impact: RiskImpact): number {
  const probabilityScore: { [key in RiskProbability]: number } = { LOW: 1, MEDIUM: 2, HIGH: 3 };
  const impactScore: { [key in RiskImpact]: number } = { LOW: 1, MEDIUM: 2, HIGH: 3 };
  return probabilityScore[probability] * impactScore[impact];
}

// Helper function to generate risk ID
function generateRiskId(): string {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  return `RISK-${year}-${timestamp}`;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as RiskCategory | null;
    const status = searchParams.get('status') as RiskStatus | null;
    const department = searchParams.get('department');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build filters
    const where: any = {};
    if (category) where.category = category;
    if (status) where.status = status;
    if (department) where.department = department;

    // Check user permissions for data filtering
    const userPermissions = session.user.permissions || [];
    
    // If user doesn't have admin access, filter by department or owned risks
    if (!userPermissions.includes('admin.access') && !userPermissions.includes('risk.full_access')) {
      where.OR = [
        { department: session.user.department },
        { ownerId: session.user.id },
        { createdById: session.user.id }
      ];
    }

    const [risks, total] = await Promise.all([
      prisma.risks.findMany({
        where,
        include: {
          users_risks_ownerIdTousers: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          users_risks_createdByIdTousers: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          risk_mitigations: {
            select: { id: true, status: true, implementationProgress: true }
          },
          _count: {
            select: {
              risk_mitigations: true,
              risk_assessments: true,
              risk_documents: true
            }
          }
        },
        orderBy: [
          { riskScore: 'desc' },
          { dateIdentified: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.risks.count({ where })
    ]);

    // Transform the data to match frontend expectations
    const transformedRisks = risks.map(risk => ({
      ...risk,
      owner: risk.users_risks_ownerIdTousers,
      createdBy: risk.users_risks_createdByIdTousers,
      mitigations: risk.risk_mitigations,
      _count: {
        mitigations: risk._count.risk_mitigations,
        assessments: risk._count.risk_assessments,
        documents: risk._count.risk_documents
      }
    }));

    return NextResponse.json({
      success: true,
      data: {
        risks: transformedRisks,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching risks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch risks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions for creating risks
    const userPermissions = session.user.permissions || [];
    if (!userPermissions.includes('risk.create') && !userPermissions.includes('admin.access')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      category,
      department,
      probability,
      impact,
      ownerId,
      tags = []
    } = body;

    // Validate required fields
    if (!title || !description || !category || !probability || !impact) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate risk score
    const riskScore = calculateRiskScore(probability, impact);
    
    // Generate unique risk ID
    const riskId = generateRiskId();

    const risk = await prisma.risks.create({
      data: {
        id: crypto.randomUUID(),
        riskId,
        title,
        description,
        category,
        department: department || session.user.department,
        probability,
        impact,
        riskScore,
        ownerId: ownerId || session.user.id,
        createdById: session.user.id,
        tags,
        updatedAt: new Date()
      },
      include: {
        users_risks_ownerIdTousers: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        users_risks_createdByIdTousers: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    // Create audit log
    await prisma.risk_audit_logs.create({
      data: {
        id: crypto.randomUUID(),
        riskId: risk.id,
        action: 'CREATE',
        userId: session.user.id,
        description: `Risk "${title}" created`
      }
    });

    return NextResponse.json({
      success: true,
      data: risk
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating risk:', error);
    return NextResponse.json(
      { error: 'Failed to create risk' },
      { status: 500 }
    );
  }
}
