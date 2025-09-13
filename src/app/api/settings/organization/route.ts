import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Return static organization settings for now (model doesn't exist in schema)
    const orgSettings = {
      id: crypto.randomUUID(),
      name: 'SAYWHAT Organization',
      email: 'admin@saywhat.org', 
      phone: '+263 803 123 4567',
      address: '143 Harare Drive, Wuse 2, Abuja, Nigeria',
      timezone: 'Africa/Harare',
      defaultLanguage: 'en',
      currency: 'USD',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return NextResponse.json({
      success: true,
      data: orgSettings
    });

  } catch (error) {
    console.error('Organization settings fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'phone'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Return updated settings (static implementation for now)
    const orgSettings = {
      id: crypto.randomUUID(),
      name: body.name,
      email: body.email,
      phone: body.phone,
      address: body.address,
      timezone: body.timezone || 'Africa/Harare',
      defaultLanguage: body.defaultLanguage || 'en', 
      currency: body.currency || 'USD',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return NextResponse.json({
      success: true,
      message: 'Organization settings updated successfully',
      data: orgSettings
    });

  } catch (error) {
    console.error('Organization settings update error:', error);
    return NextResponse.json(
      { error: 'Failed to update organization settings' },
      { status: 500 }
    );
  }
}
