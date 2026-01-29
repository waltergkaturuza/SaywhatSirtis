import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { uploadToSupabaseStorage, ensureBucketExists } from '@/lib/storage/supabase-storage';

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
    const fileName = `certificate-${qualification.id}-${randomUUID()}.${fileExtension}`;
    
    // Determine storage strategy: Use Supabase Storage if configured, otherwise fallback to filesystem
    const useSupabaseStorage = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
    let certificateUrl: string;
    let storageProvider: 'supabase' | 'filesystem' = 'filesystem';
    
    if (useSupabaseStorage) {
      try {
        // Use 'documents' bucket with certificates subfolder for organization
        const bucket = 'documents';
        const storagePath = `certificates/${employee.id}/${qualification.id}/${fileName}`;
        
        // Ensure bucket exists
        await ensureBucketExists(bucket);
        
        // Upload to Supabase Storage
        const uploadResult = await uploadToSupabaseStorage({
          bucket,
          path: storagePath,
          file,
          contentType: file.type,
          upsert: false
        });
        
        if (!uploadResult.success) {
          throw new Error(`Supabase upload failed: ${uploadResult.error}`);
        }
        
        // Store signed URL or public URL
        certificateUrl = uploadResult.signedUrl || uploadResult.publicUrl || uploadResult.url || '';
        storageProvider = 'supabase';
        
        console.log(`✅ Certificate uploaded to Supabase Storage: ${storagePath}`);
      } catch (supabaseError) {
        console.error('❌ Supabase Storage upload failed, falling back to filesystem:', supabaseError);
        // Fallback to filesystem
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'certificates');
        try {
          await mkdir(uploadDir, { recursive: true });
        } catch (error) {
          console.log('Upload directory already exists or created');
        }
        
        const filePath = join(uploadDir, fileName);
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);
        
        certificateUrl = `/uploads/certificates/${fileName}`;
      }
    } else {
      // Filesystem fallback for local development
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'certificates');
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (error) {
        console.log('Upload directory already exists or created');
      }
      
      const filePath = join(uploadDir, fileName);
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);
      
      certificateUrl = `/uploads/certificates/${fileName}`;
    }
    
    const updatedQualification = await prisma.qualifications.update({
      where: { id: qualification.id },
      data: { 
        certificateUrl: certificateUrl,
        verificationStatus: 'uploaded',
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
        resourceId: qualification.id,
        details: {
          module: 'Qualification Certificate',
          field: 'certificateUrl',
          oldValue: null, // Training enrollment doesn't store certificate URL directly
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
