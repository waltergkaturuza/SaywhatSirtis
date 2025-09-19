import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('Events API: Starting request...')
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('Events API: Unauthorized - no session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    console.log('Events API: Query params:', { status, category, page, limit })

    // Database connection is handled automatically by Prisma

    // Build where clause
    const where: any = {};
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }
    if (category && category !== 'all') {
      where.category = category.toUpperCase();
    }

    console.log('Events API: Where clause:', where)

    // Get events with pagination
    const [events, total] = await Promise.all([
      prisma.events.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip: offset,
        take: limit,
      }),
      prisma.events.count({ where }),
    ]);

    console.log(`Events API: Found ${events.length} events, total: ${total}`)

    return NextResponse.json({
      events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Events fetch error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch events',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      objectives,
      startDate,
      startTime,
      endDate,
      endTime,
      location,
      venue,
      address,
      expectedAttendees,
      actualAttendees,
      status,
      category,
      budget,
      actualCost,
      organizer,
      agenda,
      speakers,
      partners,
      registrationFields,
    } = body;

    // Validate required fields
    if (!name || !startDate || !endDate || !location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the event with all fields
    const event = await prisma.events.create({
      data: {
        id: crypto.randomUUID(),
        title: name,
        description,
        objectives: objectives || undefined,
        startDate: new Date(startDate),
        startTime: startTime || undefined,
        endDate: new Date(endDate),
        endTime: endTime || undefined,
        location,
        venue: venue || undefined,
        address: address || undefined,
        expectedAttendees: expectedAttendees ? parseInt(expectedAttendees) : 0,
        actualAttendees: actualAttendees ? parseInt(actualAttendees) : undefined,
        status: status?.toLowerCase() || 'planning',
        type: category?.toLowerCase() || 'conference',
        budget: budget ? parseFloat(budget) : 0,
        actualCost: actualCost ? parseFloat(actualCost) : undefined,
        organizer: organizer || undefined,
        agenda: agenda || undefined,
        speakers: speakers || undefined,
        partners: partners || undefined,
        registrationFields: registrationFields || undefined,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Event creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
