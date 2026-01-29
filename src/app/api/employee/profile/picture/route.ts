import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { uploadToSupabaseStorage, ensureBucketExists } from '@/lib/storage/supabase-storage';

// POST: Upload profile picture
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
    const employee = await prisma.users.findUnique({
      where: { email: session.user.email }
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee profile not found' }, 
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('profilePicture') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' }, 
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP files are allowed.' }, 
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB.' }, 
        { status: 400 }
      );
    }

    // Create unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `profile-${employee.id}-${randomUUID()}.${fileExtension}`;
    
    // Determine storage strategy: Use Supabase Storage if configured, otherwise fallback to filesystem
    const useSupabaseStorage = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
    let profilePictureUrl: string;
    let storageProvider: 'supabase' | 'filesystem' = 'filesystem';
    
    if (useSupabaseStorage) {
      try {
        // Use 'documents' bucket with profiles subfolder for organization
        const bucket = 'documents';
        const storagePath = `profiles/${employee.id}/${fileName}`;
        
        // Ensure bucket exists
        await ensureBucketExists(bucket);
        
        // Upload to Supabase Storage
        const uploadResult = await uploadToSupabaseStorage({
          bucket,
          path: storagePath,
          file,
          contentType: file.type,
          upsert: true // Allow overwriting existing profile pictures
        });
        
        if (!uploadResult.success) {
          throw new Error(`Supabase upload failed: ${uploadResult.error}`);
        }
        
        // Store signed URL or public URL
        profilePictureUrl = uploadResult.signedUrl || uploadResult.publicUrl || uploadResult.url || '';
        storageProvider = 'supabase';
        
        console.log(`✅ Profile picture uploaded to Supabase Storage: ${storagePath}`);
      } catch (supabaseError) {
        console.error('❌ Supabase Storage upload failed, falling back to filesystem:', supabaseError);
        // Fallback to filesystem
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'profiles');
        try {
          await mkdir(uploadDir, { recursive: true });
        } catch (error) {
          console.log('Upload directory already exists or created');
        }
        
        const filePath = join(uploadDir, fileName);
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);
        
        profilePictureUrl = `/uploads/profiles/${fileName}`;
      }
    } else {
      // Filesystem fallback for local development
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'profiles');
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (error) {
        console.log('Upload directory already exists or created');
      }
      
      const filePath = join(uploadDir, fileName);
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);
      
      profilePictureUrl = `/uploads/profiles/${fileName}`;
    }
    
    const updatedUser = await prisma.users.update({
      where: { email: session.user.email },
      data: { profileImage: profilePictureUrl }
    });

    // Create audit trail
    await prisma.audit_logs.create({
      data: {
        id: randomUUID(),
        userId: employee.id,
        action: 'UPDATE',
        resource: 'User',
        resourceId: updatedUser.id,
        details: {
          module: 'Employee Profile Picture',
          field: 'profileImage',
          newValue: profilePictureUrl,
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
      url: profilePictureUrl,
      message: 'Profile picture uploaded successfully'
    });

  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
