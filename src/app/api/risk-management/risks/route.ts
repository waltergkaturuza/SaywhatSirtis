import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { canManageRisks, riskVisibilityOrFilter } from '@/lib/risk-management/session-risk-access';

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

/** Map UI 5-level values to Prisma enum (LOW | MEDIUM | HIGH). */
function normalizeRiskProbability(value: string): RiskProbability {
  const v = String(value).toUpperCase();
  if (v === 'VERY_LOW' || v === 'LOW') return 'LOW';
  if (v === 'HIGH' || v === 'VERY_HIGH') return 'HIGH';
  return 'MEDIUM';
}

function normalizeRiskImpact(value: string): RiskImpact {
  const v = String(value).toUpperCase();
  if (v === 'VERY_LOW' || v === 'LOW') return 'LOW';
  if (v === 'HIGH' || v === 'VERY_HIGH') return 'HIGH';
  return 'MEDIUM';
}

const RISK_CATEGORIES: RiskCategory[] = [
  'OPERATIONAL',
  'STRATEGIC',
  'FINANCIAL',
  'COMPLIANCE',
  'REPUTATIONAL',
  'ENVIRONMENTAL',
  'CYBERSECURITY',
  'HR_PERSONNEL',
];

function normalizeRiskStatus(value: unknown): RiskStatus {
  const v = String(value || '').toUpperCase();
  if (v === 'MITIGATED') return 'MITIGATED';
  if (v === 'ESCALATED' || v === 'UNDER_REVIEW' || v === 'TRANSFERRED') return 'ESCALATED';
  if (v === 'CLOSED' || v === 'ACCEPTED') return 'CLOSED';
  return 'OPEN';
}

function parseDate(value: unknown): Date | null {
  if (!value) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
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
    const searchRaw = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const andParts: Record<string, unknown>[] = [];
    if (category) andParts.push({ category });
    if (status) andParts.push({ status });
    if (department) andParts.push({ department });

    const search = searchRaw?.trim();
    if (search) {
      andParts.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { riskId: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    const vis = riskVisibilityOrFilter(session);
    if (vis) andParts.push(vis);

    const where = andParts.length > 0 ? { AND: andParts } : {};

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

    const userPermissions = session.user.permissions || [];
    const userRoles = session.user.roles || [];
    if (!canManageRisks(userPermissions, userRoles)) {
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
      status,
      ownerId,
      tags = [],
      dateIdentified,
      mitigationStrategy,
      targetDate,
      actualCost,
    } = body;

    // Validate required fields
    if (!title || !description || !category || !probability || !impact) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!RISK_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'Invalid risk category' }, { status: 400 });
    }

    const probabilityDb = normalizeRiskProbability(probability);
    const impactDb = normalizeRiskImpact(impact);
    const riskScore = calculateRiskScore(probabilityDb, impactDb);
    const statusDb = status ? normalizeRiskStatus(status) : 'OPEN';
    const identified = parseDate(dateIdentified);
    const strategy = String(mitigationStrategy || '').trim();
    const deadline = parseDate(targetDate);
    const costNote =
      actualCost !== undefined && actualCost !== null && actualCost !== ''
        ? `Estimated cost: ${actualCost}`
        : null;

    // Generate unique risk ID
    const riskId = generateRiskId();
    const now = new Date();

    const risk = await prisma.$transaction(async (tx) => {
      const created = await tx.risks.create({
        data: {
          id: crypto.randomUUID(),
          riskId,
          title,
          description,
          category,
          department: department || session.user.department,
          probability: probabilityDb,
          impact: impactDb,
          riskScore,
          status: statusDb,
          ...(identified ? { dateIdentified: identified } : {}),
          ownerId: ownerId || session.user.id,
          createdById: session.user.id,
          tags: Array.isArray(tags) ? tags : [],
          updatedAt: now
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

      if (strategy) {
        await tx.risk_mitigations.create({
          data: {
            id: crypto.randomUUID(),
            riskId: created.id,
            strategy,
            deadline,
            notes: costNote,
            ownerId: ownerId || session.user.id,
            status: 'PLANNED',
            lastUpdated: now,
            updatedAt: now,
            createdById: session.user.id,
          }
        });
      }

      await tx.risk_audit_logs.create({
        data: {
          id: crypto.randomUUID(),
          riskId: created.id,
          action: 'CREATE',
          userId: session.user.id,
          description: `Risk "${title}" created`
        }
      });

      return created;
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
