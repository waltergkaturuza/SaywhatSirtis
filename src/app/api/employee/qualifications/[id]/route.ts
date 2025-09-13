import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

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
    const employee = await prisma.users.findUnique({
      where: { email: session.user.email }
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee profile not found' }, 
        { status: 404 }
      );
    }

    // Find qualification and verify ownership
    const existingQualification = await prisma.qualifications.findFirst({
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
    const updatedQualification = await prisma.qualifications.update({
      where: { id: params.id },
      data: {
        type: body.type || existingQualification.type,
        title: body.title || existingQualification.title,
        institution: body.institution || existingQualification.institution,
        description: body.description || existingQualification.description,
        dateObtained: body.dateObtained ? new Date(body.dateObtained) : existingQualification.dateObtained,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : existingQualification.expiryDate,
        grade: body.grade || existingQualification.grade,
        creditsEarned: body.creditsEarned ? parseFloat(body.creditsEarned) : existingQualification.creditsEarned,
        skillsGained: body.skillsGained || existingQualification.skillsGained,
        updatedAt: new Date()
      }
    });

    // Create audit trail
    await prisma.audit_logs.create({
      data: {
        id: randomUUID(),
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
      employeeId: updatedQualification.employeeId,
      type: updatedQualification.type,
      title: updatedQualification.title,
      institution: updatedQualification.institution,
      description: updatedQualification.description,
      dateObtained: updatedQualification.dateObtained.toISOString(),
      expiryDate: updatedQualification.expiryDate?.toISOString() || null,
      grade: updatedQualification.grade,
      certificateUrl: updatedQualification.certificateUrl,
      verificationStatus: updatedQualification.verificationStatus,
      isVerified: updatedQualification.isVerified,
      creditsEarned: updatedQualification.creditsEarned,
      skillsGained: updatedQualification.skillsGained,
      createdAt: updatedQualification.createdAt.toISOString(),
      updatedAt: updatedQualification.updatedAt.toISOString()
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
    const employee = await prisma.users.findUnique({
      where: { email: session.user.email }
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee profile not found' }, 
        { status: 404 }
      );
    }

    // Find qualification and verify ownership
    const qualification = await prisma.qualifications.findFirst({
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
    await prisma.qualifications.delete({
      where: { id: params.id }
    });

    // Create audit trail
    await prisma.audit_logs.create({
      data: {
        id: randomUUID(),
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
