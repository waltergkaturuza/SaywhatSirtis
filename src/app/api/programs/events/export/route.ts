import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const eventId = searchParams.get('eventId');

    // Build where clause
    const where: any = {};
    if (eventId) {
      where.id = eventId;
    }

    // Get events
    const events = await prisma.event.findMany({
      where,
      include: {
        registrations: {
          select: {
            id: true,
            participantName: true,
            participantEmail: true,
            status: true,
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    if (format === 'csv') {
      // Generate CSV
      const csvHeaders = [
        'Event Name',
        'Description',
        'Start Date',
        'Start Time',
        'End Date',
        'End Time',
        'Location',
        'Expected Attendees',
        'Actual Attendees',
        'Status',
        'Category',
        'Budget (USD)',
        'Actual Cost (USD)',
        'Organizer',
        'Organizer Email',
        'Created Date',
      ];

      const csvRows = events.map(event => [
        event.title,
        event.description || '',
        new Date(event.startDate).toLocaleDateString(),
        '', // startTime not available in model
        event.endDate ? new Date(event.endDate).toLocaleDateString() : '',
        '', // endTime not available in model
        event.location || '',
        event.capacity?.toString() || '',
        '', // actualAttendees not available in model
        event.status || '',
        event.type || '',
        event.budget?.toString() || '',
        '', // actualCost not available in model
        '', // organizer name not available in model
        '', // organizer email not available in model
        new Date(event.createdAt).toLocaleDateString(),
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field.replace(/"/g, '""')}"`).join(','))
        .join('\n');

      const fileName = eventId 
        ? `event-${events[0]?.title?.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.csv`
        : `saywhat-events-${new Date().toISOString().split('T')[0]}.csv`;

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${fileName}"`,
        },
      });
    }

    // For JSON format (default)
    return NextResponse.json({
      events,
      exportedAt: new Date().toISOString(),
      totalEvents: events.length,
    });

  } catch (error) {
    console.error('Events export error:', error);
    return NextResponse.json(
      { error: 'Failed to export events' },
      { status: 500 }
    );
  }
}
