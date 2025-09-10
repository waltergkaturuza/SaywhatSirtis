import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(request: NextRequest) {
  return NextResponse.json({ 
    success: true, 
    message: 'Call delete endpoint ready' 
  })
}