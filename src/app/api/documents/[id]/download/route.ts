import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return NextResponse.json({ 
    success: true, 
    message: 'Document download endpoint ready',
    documentId: id
  })
}