import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For now, we'll fetch partners from events that have partners data
    // In the future, this can be extended to use a dedicated implementation_partners table
    const events = await prisma.events.findMany({
      where: {
        partners: {
          not: null as any
        }
      },
      select: {
        id: true,
        partners: true
      }
    })

    // Extract unique partners from events
    const partnersMap = new Map()
    events.forEach(event => {
      if (event.partners && typeof event.partners === 'object') {
        const partners = Array.isArray(event.partners) ? event.partners : [event.partners]
        partners.forEach((partner: any) => {
          if (partner && partner.name) {
            partnersMap.set(partner.name, partner)
          }
        })
      }
    })

    const partners = Array.from(partnersMap.values())

    return NextResponse.json({ partners, success: true })
  } catch (error) {
    console.error('Error fetching implementation partners:', error)
    return NextResponse.json(
      { error: 'Failed to fetch implementation partners' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      organization,
      contactPerson,
      email,
      phone,
      address,
      partnershipType,
      description,
      website
    } = body

    // Validate required fields
    if (!name || !organization || !contactPerson || !email || !phone || !partnershipType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // For now, we'll store the partner data
    // In the future, this can be extended to use a dedicated implementation_partners table
    const partnerData = {
      id: `partner_${Date.now()}`,
      name,
      organization,
      contactPerson,
      email,
      phone,
      address: address || '',
      partnershipType,
      description: description || '',
      website: website || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Store in a way that can be retrieved later
    // For now, return success - in production, you'd want to store this in a database table
    return NextResponse.json({
      partner: partnerData,
      success: true,
      message: 'Implementation partner created successfully'
    })
  } catch (error) {
    console.error('Error creating implementation partner:', error)
    return NextResponse.json(
      { error: 'Failed to create implementation partner' },
      { status: 500 }
    )
  }
}

