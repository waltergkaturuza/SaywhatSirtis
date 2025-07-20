import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface SystemSetting {
  key: string
  value: string
  description: string
  category: string
  type: 'string' | 'number' | 'boolean' | 'json'
}

const defaultSettings: SystemSetting[] = [
  {
    key: 'app.name',
    value: 'SIRTIS',
    description: 'Application name displayed throughout the system',
    category: 'General',
    type: 'string'
  },
  {
    key: 'app.organization',
    value: 'SAYWHAT',
    description: 'Organization name',
    category: 'General',
    type: 'string'
  },
  {
    key: 'security.session_timeout',
    value: '30',
    description: 'Session timeout in minutes',
    category: 'Security',
    type: 'number'
  },
  {
    key: 'security.max_login_attempts',
    value: '5',
    description: 'Maximum login attempts before account lockout',
    category: 'Security',
    type: 'number'
  },
  {
    key: 'security.password_min_length',
    value: '12',
    description: 'Minimum password length requirement',
    category: 'Security',
    type: 'number'
  },
  {
    key: 'security.mfa_required',
    value: 'false',
    description: 'Require multi-factor authentication for all users',
    category: 'Security',
    type: 'boolean'
  },
  {
    key: 'email.smtp_host',
    value: '',
    description: 'SMTP server hostname for email notifications',
    category: 'Email',
    type: 'string'
  },
  {
    key: 'email.smtp_port',
    value: '587',
    description: 'SMTP server port',
    category: 'Email',
    type: 'number'
  },
  {
    key: 'email.from_address',
    value: 'noreply@saywhat.org',
    description: 'Default from address for system emails',
    category: 'Email',
    type: 'string'
  },
  {
    key: 'cache.enabled',
    value: 'true',
    description: 'Enable Redis caching for improved performance',
    category: 'Performance',
    type: 'boolean'
  },
  {
    key: 'cache.ttl_default',
    value: '3600',
    description: 'Default cache TTL in seconds',
    category: 'Performance',
    type: 'number'
  },
  {
    key: 'ai.openai_enabled',
    value: 'true',
    description: 'Enable OpenAI integration for SIRTIS Copilot',
    category: 'AI',
    type: 'boolean'
  },
  {
    key: 'ai.openai_model',
    value: 'gpt-3.5-turbo',
    description: 'OpenAI model to use for AI features',
    category: 'AI',
    type: 'string'
  },
  {
    key: 'office365.enabled',
    value: 'false',
    description: 'Enable Office 365 integration',
    category: 'Integration',
    type: 'boolean'
  },
  {
    key: 'audit.retention_days',
    value: '365',
    description: 'Number of days to retain audit logs',
    category: 'Audit',
    type: 'number'
  }
]

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.permissions?.includes('admin.access')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all system settings
    const settings = await prisma.systemSetting.findMany({
      orderBy: [
        { category: 'asc' },
        { key: 'asc' }
      ]
    })

    // If no settings exist, create default ones
    if (settings.length === 0) {
      await prisma.systemSetting.createMany({
        data: defaultSettings.map(setting => ({
          key: setting.key,
          value: setting.value,
          description: setting.description,
          category: setting.category
        }))
      })

      const newSettings = await prisma.systemSetting.findMany({
        orderBy: [
          { category: 'asc' },
          { key: 'asc' }
        ]
      })

      return NextResponse.json({ settings: newSettings })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching system settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.permissions?.includes('admin.access')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { settings } = await request.json()

    if (!Array.isArray(settings)) {
      return NextResponse.json(
        { error: 'Settings must be an array' },
        { status: 400 }
      )
    }

    // Update each setting
    const updatePromises = settings.map(async (setting: any) => {
      const existing = await prisma.systemSetting.findUnique({
        where: { key: setting.key }
      })

      if (existing) {
        return prisma.systemSetting.update({
          where: { key: setting.key },
          data: {
            value: setting.value,
            description: setting.description,
            category: setting.category
          }
        })
      } else {
        return prisma.systemSetting.create({
          data: {
            key: setting.key,
            value: setting.value,
            description: setting.description,
            category: setting.category
          }
        })
      }
    })

    await Promise.all(updatePromises)

    // Log the settings update
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE_SYSTEM_SETTINGS',
        resource: 'SystemSettings',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({ 
      message: 'System settings updated successfully',
      count: settings.length 
    })
  } catch (error) {
    console.error('Error updating system settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.permissions?.includes('admin.access')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { key, value, description, category, type } = await request.json()

    if (!key || !value || !description || !category) {
      return NextResponse.json(
        { error: 'Key, value, description, and category are required' },
        { status: 400 }
      )
    }

    // Create new setting
    const setting = await prisma.systemSetting.create({
      data: {
        key,
        value,
        description,
        category
      }
    })

    // Log the setting creation
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_SYSTEM_SETTING',
        resource: 'SystemSetting',
        resourceId: setting.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({ setting })
  } catch (error) {
    console.error('Error creating system setting:', error)
    
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Setting key already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
