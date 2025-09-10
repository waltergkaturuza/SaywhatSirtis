import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    success: true, 
    message: 'Document analytics endpoint ready',
    analytics: {
      totalDocuments: 0,
      recentUploads: 0,
      topCategories: []
    }
  })
}