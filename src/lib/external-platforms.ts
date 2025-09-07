// External Learning Platforms Configuration
// SIRTIS Integration for External Learning Management Systems

export interface ExternalPlatform {
  id: string
  name: string
  description: string
  url: string
  loginUrl?: string
  apiEndpoint?: string
  ssoEnabled: boolean
  requiresAuth: boolean
  status: 'active' | 'inactive' | 'maintenance'
  credentials?: {
    clientId?: string
    clientSecret?: string
    apiKey?: string
  }
  features: {
    courseAccess: boolean
    certificateDownload: boolean
    progressTracking: boolean
    ssoSupport: boolean
  }
}

export const externalPlatforms: ExternalPlatform[] = [
  {
    id: 'agora',
    name: 'Agora Learning Platform',
    description: 'Main external learning management system for mandatory training courses',
    url: process.env.NEXT_PUBLIC_AGORA_PLATFORM_URL || 'https://agora.learning.platform',
    loginUrl: process.env.NEXT_PUBLIC_AGORA_LOGIN_URL,
    apiEndpoint: process.env.AGORA_API_ENDPOINT,
    ssoEnabled: process.env.AGORA_SSO_ENABLED === 'true',
    requiresAuth: true,
    status: 'active',
    credentials: {
      clientId: process.env.AGORA_CLIENT_ID,
      clientSecret: process.env.AGORA_CLIENT_SECRET,
      apiKey: process.env.AGORA_API_KEY
    },
    features: {
      courseAccess: true,
      certificateDownload: true,
      progressTracking: true,
      ssoSupport: process.env.AGORA_SSO_ENABLED === 'true'
    }
  },
  {
    id: 'coursera',
    name: 'Coursera for Business',
    description: 'Professional development courses and certifications',
    url: process.env.NEXT_PUBLIC_COURSERA_URL || '',
    ssoEnabled: false,
    requiresAuth: true,
    status: 'inactive',
    features: {
      courseAccess: true,
      certificateDownload: true,
      progressTracking: false,
      ssoSupport: false
    }
  },
  {
    id: 'linkedin-learning',
    name: 'LinkedIn Learning',
    description: 'Business and technical skills training',
    url: process.env.NEXT_PUBLIC_LINKEDIN_LEARNING_URL || '',
    ssoEnabled: false,
    requiresAuth: true,
    status: 'inactive',
    features: {
      courseAccess: true,
      certificateDownload: true,
      progressTracking: false,
      ssoSupport: false
    }
  }
]

export function getActivePlatforms(): ExternalPlatform[] {
  return externalPlatforms.filter(platform => platform.status === 'active')
}

export function getPlatformById(id: string): ExternalPlatform | undefined {
  return externalPlatforms.find(platform => platform.id === id)
}

export function generatePlatformUrl(platformId: string, userId?: string, courseId?: string): string {
  const platform = getPlatformById(platformId)
  if (!platform) return '#'

  let url = platform.url

  // Add SSO parameters if enabled
  if (platform.ssoEnabled && userId) {
    const ssoParams = new URLSearchParams({
      user_id: userId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/hr/training`,
      timestamp: Date.now().toString()
    })
    
    if (platform.loginUrl) {
      url = `${platform.loginUrl}?${ssoParams.toString()}`
    } else {
      url = `${platform.url}?${ssoParams.toString()}`
    }
  }

  // Add course-specific parameters
  if (courseId) {
    const separator = url.includes('?') ? '&' : '?'
    url = `${url}${separator}course=${courseId}`
  }

  return url
}

export function validatePlatformConnection(platform: ExternalPlatform): Promise<boolean> {
  return new Promise(async (resolve) => {
    try {
      if (!platform.url || platform.url === '' || platform.url.includes('placeholder')) {
        resolve(false)
        return
      }

      // Simple connectivity check
      const response = await fetch(platform.url, { 
        method: 'HEAD',
        mode: 'no-cors'
      })
      resolve(true)
    } catch (error) {
      console.warn(`Platform ${platform.name} connectivity check failed:`, error)
      resolve(false)
    }
  })
}
