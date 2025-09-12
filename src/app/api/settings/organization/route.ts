import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Try to get organization settings from database
    let orgSettings = await prisma.organizationSettings.findFirst();
    
    if (!orgSettings) {
      // Create default organization settings
      orgSettings = await prisma.organizationSettings.create({
        data: {
          name: 'SAYWHAT Organization',
          email: 'admin@saywhat.org', 
          phone: '+263 803 123 4567',
          address: '143 Harare Drive, Wuse 2, Abuja, Nigeria',
          timezone: 'Africa/Harare',
          defaultLanguage: 'en',
          currency: 'USD'
        }
      });
    }

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

    // Get existing settings or create new
    let orgSettings = await prisma.organizationSettings.findFirst();
    
    if (orgSettings) {
      // Update existing settings
      orgSettings = await prisma.organizationSettings.update({
        where: { id: orgSettings.id },
        data: {
          name: body.name,
          email: body.email,
          phone: body.phone,
          address: body.address,
          timezone: body.timezone || 'Africa/Harare',
          defaultLanguage: body.defaultLanguage || 'en', 
          currency: body.currency || 'USD',
          updatedAt: new Date()
        }
      });
    } else {
      // Create new settings
      orgSettings = await prisma.organizationSettings.create({
        data: {
          name: body.name,
          email: body.email,
          phone: body.phone,
          address: body.address,
          timezone: body.timezone || 'Africa/Harare',
          defaultLanguage: body.defaultLanguage || 'en',
          currency: body.currency || 'USD'
        }
      });
    }

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
