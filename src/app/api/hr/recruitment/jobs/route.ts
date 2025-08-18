import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: JobPosting model doesn't exist in schema yet
    return NextResponse.json({ 
      message: 'Job postings temporarily disabled - schema updates needed',
      jobs: []
    }, { status: 501 })
    
  } catch (error) {
    console.error('Jobs API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: JobPosting model doesn't exist in schema yet
    return NextResponse.json({ 
      message: 'Job creation temporarily disabled - schema updates needed'
    }, { status: 501 })
    
  } catch (error) {
    console.error('Jobs API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
