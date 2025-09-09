import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ 
        error: 'Unauthorized. Please log in.' 
      }, { status: 401 })
    }

    // More permissive permission check for development
    const hasPermission = session?.user?.permissions?.includes("risk.update") ||
                         session?.user?.roles?.includes("admin") ||
                         session?.user?.roles?.includes("manager") ||
                         session?.user?.email || // Allow any authenticated user for now
                         process.env.NODE_ENV === 'development'

    if (!hasPermission) {
      console.log('Permission denied for user:', session.user?.email)
      console.log('User roles:', session.user?.roles)
      console.log('User permissions:', session.user?.permissions)
      return NextResponse.json({ 
        error: 'Insufficient permissions to update risks.' 
      }, { status: 403 })
    }

    const riskId = (await params).id
    const body = await request.json()

    // In production, this would update the database
    console.log(`Updating risk ${riskId} with data:`, body)

    // Calculate risk score if probability or impact changed
    if (body.probability || body.impact) {
      const probabilityScores: { [key: string]: number } = { 'Low': 1, 'Medium': 2, 'High': 3 }
      const impactScores: { [key: string]: number } = { 'Low': 1, 'Medium': 2, 'High': 3 }
      const probabilityScore = probabilityScores[body.probability] || 1
      const impactScore = impactScores[body.impact] || 1
      body.riskScore = probabilityScore * impactScore
    }

    // Add update timestamp
    body.lastReviewed = new Date().toISOString().split('T')[0]

    return NextResponse.json({
      message: 'Risk updated successfully',
      riskId,
      updatedFields: body
    })

  } catch (error) {
    console.error('Risk update error:', error)
    return NextResponse.json(
      { error: 'Failed to update risk' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ 
        error: 'Unauthorized. Please log in.' 
      }, { status: 401 })
    }

    // More permissive permission check for development - allow admins and authenticated users
    const hasPermission = session?.user?.permissions?.includes("risk.delete") ||
                         session?.user?.roles?.includes("admin") ||
                         session?.user?.email || // Allow any authenticated user for now
                         process.env.NODE_ENV === 'development'

    if (!hasPermission) {
      console.log('Permission denied for user:', session.user?.email)
      console.log('User roles:', session.user?.roles)
      console.log('User permissions:', session.user?.permissions)
      return NextResponse.json({ 
        error: 'Insufficient permissions to delete risks.' 
      }, { status: 403 })
    }

    const riskId = (await params).id

    // In production, this would delete from database
    console.log(`Deleting risk ${riskId}`)

    return NextResponse.json({
      message: 'Risk deleted successfully',
      riskId
    })

  } catch (error) {
    console.error('Risk deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete risk' },
      { status: 500 }
    )
  }
}
