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

    // Check if user has risk management permissions
    const hasPermission = session?.user?.permissions?.includes("risk.update") ||
                         session?.user?.roles?.includes("admin") ||
                         session?.user?.roles?.includes("manager")

    if (!hasPermission) {
      return NextResponse.json({ 
        error: 'Insufficient permissions to update mitigation plans.' 
      }, { status: 403 })
    }

    const planId = (await params).id
    const body = await request.json()

    // Add update timestamp
    body.lastUpdated = new Date().toISOString().split('T')[0]

    // In production, this would update the database
    console.log(`Updating mitigation plan ${planId} with data:`, body)

    return NextResponse.json({
      message: 'Mitigation plan updated successfully',
      planId,
      updatedFields: body
    })

  } catch (error) {
    console.error('Mitigation plan update error:', error)
    return NextResponse.json(
      { error: 'Failed to update mitigation plan' },
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

    // Check if user has risk management permissions
    const hasPermission = session?.user?.permissions?.includes("risk.delete") ||
                         session?.user?.roles?.includes("admin")

    if (!hasPermission) {
      return NextResponse.json({ 
        error: 'Insufficient permissions to delete mitigation plans.' 
      }, { status: 403 })
    }

    const planId = (await params).id

    // In production, this would delete from database
    console.log(`Deleting mitigation plan ${planId}`)

    return NextResponse.json({
      message: 'Mitigation plan deleted successfully',
      planId
    })

  } catch (error) {
    console.error('Mitigation plan deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete mitigation plan' },
      { status: 500 }
    )
  }
}
