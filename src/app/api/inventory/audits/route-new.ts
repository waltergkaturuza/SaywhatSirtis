import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    success: true, 
    message: 'Inventory audits endpoint ready',
    audits: []
  })
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    success: true, 
    message: 'Inventory audit creation endpoint ready' 
  })
}
