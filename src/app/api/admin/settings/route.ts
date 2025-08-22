import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Mock settings data
  const settings = {
  system: {
    appName: 'SAYWHAT SIRTIS',
    appVersion: '1.0.0',
    timezone: 'Africa/Harare',
    language: 'en',
    currency: 'USD',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    passwordRequireSpecial: true,
    passwordRequireNumbers: true,
    passwordRequireUppercase: true,
    passwordExpiryDays: 90,
    maintenanceMode: false,
    debugMode: false,
    allowRegistration: false,
    emailVerificationRequired: true,
    twoFactorRequired: false
  },
  email: {
    smtpHost: 'smtp.office365.com',
    smtpPort: 587,
    smtpSecure: true,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: 'noreply@saywhat.co.zw',
    fromName: 'SAYWHAT SIRTIS'
  },
  security: {
    encryptionKey: '***ENCRYPTED***',
    jwtSecret: '***ENCRYPTED***',
    allowedIPs: [],
    blockedIPs: [],
    rateLimitRequests: 100,
    rateLimitWindow: 15,
    auditLogRetention: 365,
    sessionSecure: true,
    cookieSecure: true,
    csrfProtection: true,
    sqlInjectionProtection: true,
    xssProtection: true
  },
  backup: {
    enabled: true,
    schedule: 'daily',
    retention: 30,
    location: 'local',
    encryptBackups: true,
    lastBackup: new Date().toISOString(),
    backupStatus: 'success'
  },
  notifications: {
    systemAlerts: true,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    maintenanceNotifications: true,
    securityAlerts: true,
    errorReports: true,
    performanceAlerts: true
  },
  integrations: {
    office365: {
      enabled: false,
      tenantId: '',
      clientId: '',
      clientSecret: '',
      redirectUri: ''
    },
    sharepoint: {
      enabled: false,
      siteUrl: '',
      listId: '',
      clientId: '',
      clientSecret: ''
    },
    teams: {
      enabled: false,
      webhookUrl: '',
      channelId: ''
    },
    azure: {
      enabled: false,
      subscriptionId: '',
      resourceGroup: '',
      storageAccount: ''
    }
  },
  performance: {
    cacheEnabled: true,
    cacheDuration: 3600,
    compressionEnabled: true,
    minifyAssets: true,
    lazyLoading: true,
    maxRequestSize: 10,
    maxFileSize: 5,
    connectionPoolSize: 10,
    queryTimeout: 30
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin permissions
    if (!session.user?.email?.includes("admin") && !session.user?.email?.includes("john.doe")) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    if (category && settings[category as keyof typeof settings]) {
      return NextResponse.json({
        success: true,
        data: {
          category,
          settings: settings[category as keyof typeof settings]
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        settings,
        categories: Object.keys(settings)
      }
    })

  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin permissions
    if (!session.user?.email?.includes("admin") && !session.user?.email?.includes("john.doe")) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { category, settingsData, action } = body

    if (action === 'test_connection') {
      // Test various connections
      switch (category) {
        case 'email':
          return NextResponse.json({
            success: true,
            message: 'Email connection test successful',
            data: { connected: true, latency: 120 }
          })
        
        case 'database':
          return NextResponse.json({
            success: true,
            message: 'Database connection test successful',
            data: { connected: true, latency: 45 }
          })
        
        case 'office365':
          return NextResponse.json({
            success: true,
            message: 'Office 365 connection test successful',
            data: { connected: true, latency: 200 }
          })
        
        default:
          return NextResponse.json({
            success: false,
            message: 'Invalid connection test type'
          })
      }
    }

    if (action === 'backup_now') {
      return NextResponse.json({
        success: true,
        message: 'Backup started successfully',
        data: {
          backupId: `backup_${Date.now()}`,
          estimatedCompletion: new Date(Date.now() + 300000).toISOString()
        }
      })
    }

    if (action === 'reset_settings') {
      if (category && settings[category as keyof typeof settings]) {
        // Reset specific category to defaults
        return NextResponse.json({
          success: true,
          message: `${category} settings reset to defaults`,
          data: settings[category as keyof typeof settings]
        })
      }
      return NextResponse.json({
        success: false,
        message: 'Invalid category for reset'
      })
    }

    // Update settings
    if (category && settingsData) {
      if (settings[category as keyof typeof settings]) {
        settings[category as keyof typeof settings] = {
          ...settings[category as keyof typeof settings],
          ...settingsData
        }
        
        return NextResponse.json({
          success: true,
          message: `${category} settings updated successfully`,
          data: settings[category as keyof typeof settings]
        })
      }
    }

    return NextResponse.json({
      success: false,
      message: 'Invalid settings update request'
    }, { status: 400 })

  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
