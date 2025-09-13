import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Generate registration form for an event
export async function POST(
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
    const { registrationFields, registrationDeadline, requiresRegistration } = body;

    // Check if event exists
    const event = await prisma.events.findUnique({
      where: { id },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (!requiresRegistration) {
      return NextResponse.json({ 
        message: 'Registration form not needed for this event',
        registrationEnabled: false 
      });
    }

    // Create/update event registration configuration
    // Note: This would typically be stored in a separate EventRegistration table
    // For now, we'll return the configuration that would be used to generate the form

    const registrationConfig = {
      eventId: id,
      eventName: event.title,
      eventDate: event.startDate,
      eventLocation: event.location,
      deadline: registrationDeadline,
      fields: registrationFields,
      formUrl: `${process.env.NEXTAUTH_URL}/events/${id}/register`,
      enabled: true,
      createdAt: new Date().toISOString()
    };

    // In a real implementation, you would:
    // 1. Store this configuration in a database table
    // 2. Generate a public registration page
    // 3. Set up email notifications
    // 4. Create a management interface for viewing registrations

    return NextResponse.json({
      message: 'Registration form configured successfully',
      registration: registrationConfig,
      formUrl: registrationConfig.formUrl
    });

  } catch (error) {
    console.error('Registration setup error:', error);
    return NextResponse.json(
      { error: 'Failed to setup registration' },
      { status: 500 }
    );
  }
}

// Get event registration details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const event = await prisma.events.findUnique({
      where: { id }
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Return event details for registration page
    return NextResponse.json({
      event: {
        id: event.id,
        name: event.title,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        venue: event.venue,
        type: event.type,
        status: event.status,
        capacity: event.capacity,
        requiresRegistration: event.requiresRegistration,
        registrationDeadline: event.registrationDeadline
      }
    });

  } catch (error) {
    console.error('Registration fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch registration details' },
      { status: 500 }
    );
  }
}
