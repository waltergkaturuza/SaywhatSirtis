import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Default organization settings
const DEFAULT_ORG_SETTINGS = {
  name: 'SAYWHAT Organization',
  email: 'admin@saywhat.org', 
  phone: '+263 803 123 4567',
  address: '143 Harare Drive, Wuse 2, Abuja, Nigeria',
  timezone: 'Africa/Harare',
  defaultLanguage: 'en',
  currency: 'USD'
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch organization settings from database
    const orgConfig = await prisma.system_config.findMany({
      where: {
        category: 'organization'
      }
    });

    // Convert array of config entries to settings object
    const settings: any = { ...DEFAULT_ORG_SETTINGS };
    
    orgConfig.forEach(config => {
      if (config.key.startsWith('org_')) {
        const settingKey = config.key.replace('org_', '');
        settings[settingKey] = config.value;
      }
    });

    return NextResponse.json({
      success: true,
      data: settings
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
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin permissions
    const userRoles = (session.user.roles as string[]) || [];
    const hasAdminAccess = userRoles.some(role => 
      ['SYSTEM_ADMINISTRATOR', 'SUPERUSER'].includes(role)
    );

    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

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

    // Save each setting to the database
    const settingsToSave = [
      { key: 'org_name', value: body.name, description: 'Organization name' },
      { key: 'org_email', value: body.email, description: 'Primary organization email' },
      { key: 'org_phone', value: body.phone, description: 'Primary organization phone' },
      { key: 'org_address', value: body.address, description: 'Organization address' },
      { key: 'org_timezone', value: body.timezone || 'Africa/Harare', description: 'Default timezone' },
      { key: 'org_defaultLanguage', value: body.defaultLanguage || 'en', description: 'Default language' },
      { key: 'org_currency', value: body.currency || 'USD', description: 'Default currency' }
    ];

    // Use transaction to update all settings
    await prisma.$transaction(async (tx) => {
      for (const setting of settingsToSave) {
        await tx.system_config.upsert({
          where: { key: setting.key },
          update: {
            value: setting.value,
            updatedAt: new Date()
          },
          create: {
            id: crypto.randomUUID(),
            key: setting.key,
            value: setting.value,
            description: setting.description,
            category: 'organization',
            updatedAt: new Date()
          }
        });
      }
    });

    // Return the updated settings
    const updatedSettings = {
      name: body.name,
      email: body.email,
      phone: body.phone,
      address: body.address,
      timezone: body.timezone || 'Africa/Harare',
      defaultLanguage: body.defaultLanguage || 'en',
      currency: body.currency || 'USD',
      updatedAt: new Date()
    };

    return NextResponse.json({
      success: true,
      message: 'Organization settings updated successfully',
      data: updatedSettings
    });

  } catch (error) {
    console.error('Organization settings update error:', error);
    return NextResponse.json(
      { error: 'Failed to update organization settings' },
      { status: 500 }
    );
  }
}
