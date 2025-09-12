import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

// POST: Upload qualification certificate
export async function POST(
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

    const formData = await request.formData();
    const file = formData.get('certificate') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' }, 
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, JPEG, and PNG files are allowed.' }, 
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB.' }, 
        { status: 400 }
      );
    }

    // Create unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `certificate-${qualification.id}-${uuidv4()}.${fileExtension}`;
    
    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'certificates');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.log('Upload directory already exists or created');
    }

    // Save file
    const filePath = join(uploadDir, fileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    await writeFile(filePath, buffer);

    // Update qualification with certificate URL
    const certificateUrl = `/uploads/certificates/${fileName}`;
    
    const updatedQualification = await prisma.qualification.update({
      where: { id: qualification.id },
      data: { 
        certificateUrl: certificateUrl,
        verificationStatus: 'pending' // Reset to pending when new certificate is uploaded
      }
    });

    // Create audit trail
    await prisma.auditLog.create({
      data: {
        userId: employee.id,
        action: 'UPDATE',
        resource: 'Qualification',
        resourceId: qualification.id,
        details: {
          module: 'Qualification Certificate',
          field: 'certificateUrl',
          oldValue: qualification.certificateUrl,
          newValue: certificateUrl,
          fileName: fileName,
          fileSize: file.size,
          fileType: file.type
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    return NextResponse.json({
      success: true,
      url: certificateUrl,
      message: 'Certificate uploaded successfully'
    });

  } catch (error) {
    console.error('Error uploading certificate:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
