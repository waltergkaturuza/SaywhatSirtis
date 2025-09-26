import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Create temporary file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const tempDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempFilePath = path.join(tempDir, `temp_${Date.now()}_${file.name}`);
    fs.writeFileSync(tempFilePath, buffer);

    try {
      // Dynamically import document processor to avoid build-time issues
      const { documentProcessor } = await import('@/lib/document-processor');
      
      // Process the document to extract metadata
      const result = await documentProcessor.processDocument(tempFilePath, file.type);
      
      // Extract keywords if text content is available
      let keywords: string[] = [];
      if (result.textContent) {
        keywords = documentProcessor.extractKeywords(result.textContent);
      }

      // Clean up temporary file
      fs.unlinkSync(tempFilePath);

      return NextResponse.json({
        success: true,
        metadata: result.metadata,
        textContent: result.textContent,
        keywords,
        processing: {
          success: result.success,
          error: result.error
        }
      });

    } catch (processingError) {
      // Clean up temporary file on error
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      throw processingError;
    }

  } catch (error) {
    console.error('Document analysis error:', error);
    return NextResponse.json({
      success: false,
      error: 'Document analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}