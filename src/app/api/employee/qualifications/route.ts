import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: Fetch employee qualifications
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' }, 
        { status: 401 }
      );
    }

    // Find employee by email
    const employee = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee profile not found' }, 
        { status: 404 }
      );
    }

    // Fetch qualifications
    const qualifications = await prisma.qualification.findMany({
      where: { employeeId: employee.id },
      orderBy: { dateObtained: 'desc' }
    });

    // Format response
    const formattedQualifications = qualifications.map(q => ({
      id: q.id,
      type: q.type,
      title: q.title,
      institution: q.institution,
      issuer: q.issuer,
      dateObtained: q.dateObtained.toISOString(),
      expiryDate: q.expiryDate?.toISOString(),
      level: q.level,
      grade: q.grade,
      description: q.description,
      certificateUrl: q.certificateUrl,
      status: q.status,
      verificationStatus: q.verificationStatus
    }));

    return NextResponse.json(formattedQualifications);

  } catch (error) {
    console.error('Error fetching qualifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// POST: Create new qualification
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' }, 
        { status: 401 }
      );
    }

    // Find employee by email
    const employee = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee profile not found' }, 
        { status: 404 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.type || !body.title || !body.dateObtained) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title, dateObtained' }, 
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ['education', 'certification', 'skill', 'training'];
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        { error: 'Invalid qualification type' }, 
        { status: 400 }
      );
    }

    // Determine status based on expiry date
    let status = 'active';
    if (body.expiryDate && new Date(body.expiryDate) < new Date()) {
      status = 'expired';
    }

    // Create qualification
    const qualification = await prisma.qualification.create({
      data: {
        employeeId: employee.id,
        type: body.type,
        title: body.title,
        institution: body.institution || null,
        issuer: body.issuer || null,
        dateObtained: new Date(body.dateObtained),
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
        level: body.level || null,
        grade: body.grade || null,
        description: body.description || null,
        status: status,
        verificationStatus: 'pending'
      }
    });

    // Create audit trail
    await prisma.auditLog.create({
      data: {
        userId: employee.id,
        action: 'CREATE',
        resource: 'Qualification',
        resourceId: qualification.id,
        details: {
          module: 'Employee Qualifications',
          after: qualification
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    // Format response
    const formattedQualification = {
      id: qualification.id,
      type: qualification.type,
      title: qualification.title,
      institution: qualification.institution,
      issuer: qualification.issuer,
      dateObtained: qualification.dateObtained.toISOString(),
      expiryDate: qualification.expiryDate?.toISOString(),
      level: qualification.level,
      grade: qualification.grade,
      description: qualification.description,
      certificateUrl: qualification.certificateUrl,
      status: qualification.status,
      verificationStatus: qualification.verificationStatus
    };

    return NextResponse.json(formattedQualification, { status: 201 });

  } catch (error) {
    console.error('Error creating qualification:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
