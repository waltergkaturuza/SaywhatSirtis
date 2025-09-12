import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT: Update qualification
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' }, 
        { status: 401 }
      );
    }

    // Find employee by email
    const employee = await prisma.employee.findUnique({
      where: { email: session.user.email }
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee profile not found' }, 
        { status: 404 }
      );
    }

    // Find qualification and verify ownership
    const existingQualification = await prisma.qualification.findFirst({
      where: {
        id: params.id,
        employeeId: employee.id
      }
    });

    if (!existingQualification) {
      return NextResponse.json(
        { error: 'Qualification not found' }, 
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

    // Update qualification
    const updatedQualification = await prisma.qualification.update({
      where: { id: params.id },
      data: {
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
        verificationStatus: 'pending' // Reset verification status when updated
      }
    });

    // Create audit trail
    await prisma.auditLog.create({
      data: {
        userId: employee.id,
        action: 'UPDATE',
        resource: 'Qualification',
        resourceId: updatedQualification.id,
        details: {
          module: 'Employee Qualifications',
          before: existingQualification,
          after: updatedQualification
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    // Format response
    const formattedQualification = {
      id: updatedQualification.id,
      type: updatedQualification.type,
      title: updatedQualification.title,
      institution: updatedQualification.institution,
      issuer: updatedQualification.issuer,
      dateObtained: updatedQualification.dateObtained.toISOString(),
      expiryDate: updatedQualification.expiryDate?.toISOString(),
      level: updatedQualification.level,
      grade: updatedQualification.grade,
      description: updatedQualification.description,
      certificateUrl: updatedQualification.certificateUrl,
      status: updatedQualification.status,
      verificationStatus: updatedQualification.verificationStatus
    };

    return NextResponse.json(formattedQualification);

  } catch (error) {
    console.error('Error updating qualification:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// DELETE: Delete qualification
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' }, 
        { status: 401 }
      );
    }

    // Find employee by email
    const employee = await prisma.employee.findUnique({
      where: { email: session.user.email }
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee profile not found' }, 
        { status: 404 }
      );
    }

    // Find qualification and verify ownership
    const qualification = await prisma.qualification.findFirst({
      where: {
        id: params.id,
        employeeId: employee.id
      }
    });

    if (!qualification) {
      return NextResponse.json(
        { error: 'Qualification not found' }, 
        { status: 404 }
      );
    }

    // Delete qualification
    await prisma.qualification.delete({
      where: { id: params.id }
    });

    // Create audit trail
    await prisma.auditLog.create({
      data: {
        userId: employee.id,
        action: 'DELETE',
        resource: 'Qualification',
        resourceId: qualification.id,
        details: {
          module: 'Employee Qualifications',
          deletedData: qualification
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting qualification:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
