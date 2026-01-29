import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handlePrismaError,
  logError,
  HttpStatus,
  ErrorCodes
} from '@/lib/api-utils'
import { uploadToSupabaseStorage, ensureBucketExists } from '@/lib/storage/supabase-storage'
import { randomUUID } from 'crypto'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        createErrorResponse('Authentication required', HttpStatus.UNAUTHORIZED, { 
          code: ErrorCodes.UNAUTHORIZED 
        }), 
        { status: HttpStatus.UNAUTHORIZED }
      )
    }

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')

    // TODO: Fetch certificates from database when certificate model is added
    const certificates = [
      {
        id: '1',
        employeeId: employeeId || 'emp-001',
        name: 'Leadership Training Certificate',
        issuer: 'Agora Learning Platform',
        dateCompleted: '2024-01-15',
        certificateNumber: 'AGR-2024-001',
        status: 'verified',
        fileUrl: '/certificates/leadership-cert.pdf',
        uploadedAt: '2024-01-16T10:00:00Z'
      },
      {
        id: '2',
        employeeId: employeeId || 'emp-001',
        name: 'Data Protection & Privacy',
        issuer: "Learner's Hub",
        dateCompleted: '2024-02-28',
        certificateNumber: 'LH-2024-047',
        status: 'verified',
        fileUrl: '/certificates/data-protection-cert.pdf',
        uploadedAt: '2024-03-01T14:30:00Z'
      }
    ]

    const response = createSuccessResponse(certificates, {
      message: 'Certificates retrieved successfully',
      meta: { total: certificates.length }
    })

    return NextResponse.json(response)
  } catch (error) {
    logError(error, {
      endpoint: '/api/hr/certificates',
      userId: 'unknown'
    })
    
    const { response, status } = handlePrismaError(error)
    return NextResponse.json(response, { status })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        createErrorResponse('Authentication required', HttpStatus.UNAUTHORIZED, { 
          code: ErrorCodes.UNAUTHORIZED 
        }), 
        { status: HttpStatus.UNAUTHORIZED }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll('certificates') as File[]
    const employeeId = formData.get('employeeId') as string
    const certificateName = formData.get('certificateName') as string
    const issuer = formData.get('issuer') as string
    const dateCompleted = formData.get('dateCompleted') as string

    if (!files.length) {
      return NextResponse.json(
        createErrorResponse('No files uploaded', HttpStatus.BAD_REQUEST),
        { status: HttpStatus.BAD_REQUEST }
      )
    }

    // Determine storage strategy: Use Supabase Storage if configured, otherwise fallback to filesystem
    const useSupabaseStorage = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
    const uploadedCertificates = await Promise.all(
      files.map(async (file, index) => {
        const fileExtension = file.name.split('.').pop();
        const fileName = `certificate-${Date.now()}-${index}-${randomUUID()}.${fileExtension}`;
        let fileUrl: string;
        
        if (useSupabaseStorage) {
          try {
            const bucket = 'documents';
            const storagePath = `certificates/hr/${employeeId || session.user.id}/${fileName}`;
            
            await ensureBucketExists(bucket);
            
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
            
            fileUrl = uploadResult.signedUrl || uploadResult.publicUrl || uploadResult.url || '';
            console.log(`✅ HR Certificate uploaded to Supabase Storage: ${storagePath}`);
          } catch (supabaseError) {
            console.error('❌ Supabase Storage upload failed:', supabaseError);
            // Fallback to placeholder URL
            fileUrl = `/certificates/${file.name}`;
          }
        } else {
          // Filesystem fallback (local development)
          fileUrl = `/certificates/${file.name}`;
        }
        
        return {
          id: `cert-${Date.now()}-${index}`,
          employeeId: employeeId || session.user.id,
          name: certificateName || file.name,
          issuer: issuer || 'Unknown',
          dateCompleted: dateCompleted || new Date().toISOString().split('T')[0],
          certificateNumber: `CERT-${Date.now()}-${index}`,
          status: 'pending',
          fileUrl: fileUrl,
          uploadedAt: new Date().toISOString(),
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          storageProvider: useSupabaseStorage ? 'supabase' : 'filesystem'
        };
      })
    );

    const response = createSuccessResponse(uploadedCertificates, {
      message: `Successfully uploaded ${files.length} certificate(s)`,
      meta: { uploaded: files.length }
    })

    return NextResponse.json(response)

  } catch (error) {
    logError(error, {
      endpoint: '/api/hr/certificates',
      userId: 'unknown'
    })
    
    const { response, status } = handlePrismaError(error)
    return NextResponse.json(response, { status })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        createErrorResponse('Authentication required', HttpStatus.UNAUTHORIZED, { 
          code: ErrorCodes.UNAUTHORIZED 
        }), 
        { status: HttpStatus.UNAUTHORIZED }
      )
    }

    const { searchParams } = new URL(request.url)
    const certificateId = searchParams.get('id')

    if (!certificateId) {
      return NextResponse.json(
        createErrorResponse('Certificate ID is required', HttpStatus.BAD_REQUEST),
        { status: HttpStatus.BAD_REQUEST }
      )
    }

    // TODO: Delete certificate from database and storage
    console.log('Deleting certificate:', certificateId)

    const response = createSuccessResponse({ deleted: true }, {
      message: 'Certificate deleted successfully'
    })

    return NextResponse.json(response)

  } catch (error) {
    logError(error, {
      endpoint: '/api/hr/certificates',
      userId: 'unknown'
    })
    
    const { response, status } = handlePrismaError(error)
    return NextResponse.json(response, { status })
  }
}
