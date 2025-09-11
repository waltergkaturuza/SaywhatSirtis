import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text, fileType } = await request.json();
    
    if (!text) {
      return NextResponse.json({
        error: 'Text is required for classification'
      }, { status: 400 });
    }
    
    // Simple document classification logic
    let classification = 'GENERAL';
    const textLower = text.toLowerCase();
    
    if (textLower.includes('confidential') || textLower.includes('private')) {
      classification = 'CONFIDENTIAL';
    } else if (textLower.includes('internal') || textLower.includes('restricted')) {
      classification = 'RESTRICTED';
    } else if (textLower.includes('public') || textLower.includes('open')) {
      classification = 'PUBLIC';
    }
    
    // Determine document category
    let category = 'GENERAL';
    if (textLower.includes('financial') || textLower.includes('budget')) {
      category = 'FINANCIAL';
    } else if (textLower.includes('hr') || textLower.includes('employee')) {
      category = 'HR';
    } else if (textLower.includes('legal') || textLower.includes('contract')) {
      category = 'LEGAL';
    } else if (textLower.includes('technical') || textLower.includes('software')) {
      category = 'TECHNICAL';
    }
    
    return NextResponse.json({
      classification,
      category,
      confidence: 0.8,
      suggestions: {
        tags: classification === 'CONFIDENTIAL' ? ['secure', 'private'] : ['general'],
        security_level: classification
      }
    });
  } catch (error) {
    console.error('Document classification error:', error);
    return NextResponse.json({
      error: 'Failed to classify document'
    }, { status: 500 });
  }
}
