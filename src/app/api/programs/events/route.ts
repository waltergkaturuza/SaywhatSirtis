import { NextRequest, NextResponse } from 'next/server'
import { createErrorResponse } from '@/lib/error-handler';
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
    const fromParam = searchParams.get('from'); // YYYY-MM-DD inclusive
    const toParam = searchParams.get('to'); // YYYY-MM-DD inclusive
    let page = parseInt(searchParams.get('page') || '1');
    let limit = parseInt(searchParams.get('limit') || '10');
    let offset = (page - 1) * limit;

    console.log('Events API: Query params:', { status, category, from: fromParam, to: toParam, page, limit })

    const andParts: Record<string, unknown>[] = [];

    if (status && status !== 'all') {
      andParts.push({ status: status.toLowerCase() });
    }
    if (category && category !== 'all') {
      const cat = category.toLowerCase();
      if (cat === 'competitions') {
        andParts.push({ OR: [{ type: 'competitions' }, { type: 'fundraising' }] });
      } else {
        andParts.push({ type: cat });
      }
    }

    /** Calendar / range fetch: events overlapping [from 00:00 UTC, to 23:59:59.999 UTC] */
    let dateScoped = false;
    if (fromParam && toParam) {
      const rangeStart = new Date(`${fromParam}T00:00:00.000Z`);
      const rangeEnd = new Date(`${toParam}T23:59:59.999Z`);
      if (!Number.isNaN(rangeStart.getTime()) && !Number.isNaN(rangeEnd.getTime()) && rangeStart <= rangeEnd) {
        dateScoped = true;
        andParts.push({ startDate: { lte: rangeEnd } });
        andParts.push({
          OR: [
            { endDate: { gte: rangeStart } },
            {
              AND: [
                { endDate: null },
                { startDate: { gte: rangeStart } },
                { startDate: { lte: rangeEnd } },
              ],
            },
          ],
        });
      }
    }

    const where = andParts.length > 0 ? { AND: andParts } : {};

    if (dateScoped) {
      limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '3000', 10), 1), 5000);
      offset = 0;
      page = 1;
    }

    console.log('Events API: Where clause:', where, { dateScoped, limit, offset })

    // Get events with pagination (or full range for calendar)
    const [events, total] = await Promise.all([
      prisma.events.findMany({
        where,
        orderBy: dateScoped
          ? { startDate: 'asc' }
          : { createdAt: 'desc' },
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
    return createErrorResponse(error, request.url)
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
      country,
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
    if (!name || !startDate || !endDate || !location || !country || String(country).trim() === '') {
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
        country: String(country).trim(),
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
    return createErrorResponse(error, request.url)
  }
}
