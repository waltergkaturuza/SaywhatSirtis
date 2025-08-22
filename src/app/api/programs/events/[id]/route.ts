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

    const event = await prisma.flagshipEvent.findUnique({
      where: { id },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
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
      actualAttendees,
      actualCost,
    } = body;

    // Check if event exists
    const existingEvent = await prisma.flagshipEvent.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Find organizer user if provided
    let organizerUserId = existingEvent.organizerUserId;
    if (organizer) {
      const organizerUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: organizer },
            { name: organizer },
            { id: organizer },
          ],
        },
      });
      if (organizerUser) {
        organizerUserId = organizerUser.id;
      }
    }

    // Update the event
    const event = await prisma.flagshipEvent.update({
      where: { id },
      data: {
        name,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        startTime,
        endDate: endDate ? new Date(endDate) : undefined,
        endTime,
        location,
        expectedAttendees: expectedAttendees ? parseInt(expectedAttendees) : undefined,
        actualAttendees: actualAttendees ? parseInt(actualAttendees) : undefined,
        status: status?.toUpperCase(),
        category: category?.toUpperCase(),
        budget: budget ? parseFloat(budget) : undefined,
        actualCost: actualCost ? parseFloat(actualCost) : undefined,
        organizerUserId,
      },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
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
    const existingEvent = await prisma.flagshipEvent.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Delete the event
    await prisma.flagshipEvent.delete({
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
