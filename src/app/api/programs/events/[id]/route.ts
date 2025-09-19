import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const event = await prisma.events.findUnique({
      where: { id },
      include: {
        event_registrations: {
          select: {
            id: true,
            participantName: true,
            participantEmail: true,
            status: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Event fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

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

    // Check if event exists
    const existingEvent = await prisma.events.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Update the event with all fields
    const event = await prisma.events.update({
      where: { id },
      data: {
        title: name,
        description,
        objectives: objectives !== undefined ? objectives : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        startTime: startTime !== undefined ? startTime : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        endTime: endTime !== undefined ? endTime : undefined,
        location,
        venue: venue !== undefined ? venue : undefined,
        address: address !== undefined ? address : undefined,
        expectedAttendees: expectedAttendees !== undefined ? parseInt(expectedAttendees) : undefined,
        actualAttendees: actualAttendees !== undefined ? parseInt(actualAttendees) : undefined,
        status: status?.toLowerCase(),
        type: category?.toLowerCase(),
        budget: budget !== undefined ? parseFloat(budget) : undefined,
        actualCost: actualCost !== undefined ? parseFloat(actualCost) : undefined,
        organizer: organizer !== undefined ? organizer : undefined,
        agenda: agenda !== undefined ? agenda : undefined,
        speakers: speakers !== undefined ? speakers : undefined,
        partners: partners !== undefined ? partners : undefined,
        registrationFields: registrationFields !== undefined ? registrationFields : undefined,
      },
      include: {
        event_registrations: {
          select: {
            id: true,
            participantName: true,
            participantEmail: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Event update error:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if event exists
    const existingEvent = await prisma.events.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Delete the event
    await prisma.events.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Event deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
