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

    // Check if database is connected
    try {
      await prisma.$connect()
      console.log('Events API: Database connected successfully')
    } catch (dbError) {
      console.error('Events API: Database connection failed:', dbError)
      return NextResponse.json({ 
        error: 'Database connection failed',
        details: process.env.NODE_ENV === 'development' ? dbError : undefined
      }, { status: 500 })
    }

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
      prisma.event.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip: offset,
        take: limit,
      }),
      prisma.event.count({ where }),
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
      startDate,
      startTime,
      endDate,
      endTime,
      location,
      expectedAttendees,
      status,
      category,
      budget,
      organizer,
    } = body;

    // Validate required fields
    if (!name || !startDate || !endDate || !location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find organizer user
    let organizerUser;
    if (organizer) {
      organizerUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: organizer },
            { firstName: organizer },
            { lastName: organizer },
            { id: organizer },
          ],
        },
      });
    }

    // Create the event
    const event = await prisma.event.create({
      data: {
        title: name,
        description,
        type: category?.toLowerCase() || 'conference',
        status: status?.toLowerCase() || 'planning',
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        location,
        capacity: parseInt(expectedAttendees) || null,
        budget: parseFloat(budget) || null,
      },
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
