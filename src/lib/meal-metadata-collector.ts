/**
 * MEAL Metadata Collector
 * Collects comprehensive metadata from client-side for form submissions
 */

export interface ClientMetadata {
  screenResolution: string
  timezone: string
  language: string
  connectionType: string
  location?: {
    latitude: number
    longitude: number
    accuracy?: number
  }
  deviceInfo: {
    platform: string
    browser: string
    os: string
    isMobile: boolean
    isTablet: boolean
  }
  formData: {
    completionTime: number
    formVersion: string
    submissionSource: string
  }
}

export class MealMetadataCollector {
  private startTime: number
  private formVersion: string

  constructor(formVersion: string = '1.0') {
    this.startTime = Date.now()
    this.formVersion = formVersion
  }

  /**
   * Collect comprehensive client metadata
   */
  async collectMetadata(): Promise<ClientMetadata> {
    const screenResolution = this.getScreenResolution()
    const timezone = this.getTimezone()
    const language = this.getLanguage()
    const connectionType = this.getConnectionType()
    const location = await this.getLocation()
    const deviceInfo = this.getDeviceInfo()
    const completionTime = this.getCompletionTime()

    return {
      screenResolution,
      timezone,
      language,
      connectionType,
      location,
      deviceInfo,
      formData: {
        completionTime,
        formVersion: this.formVersion,
        submissionSource: 'Web Form'
      }
    }
  }

  /**
   * Get screen resolution
   */
  private getScreenResolution(): string {
    if (typeof window === 'undefined') return 'Unknown'
    return `${window.screen.width}x${window.screen.height}`
  }

  /**
   * Get user's timezone
   */
  private getTimezone(): string {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone
    } catch {
      return 'Unknown'
    }
  }

  /**
   * Get user's language preference
   */
  private getLanguage(): string {
    if (typeof navigator === 'undefined') return 'Unknown'
    return navigator.language || 'Unknown'
  }

  /**
   * Get connection type (if available)
   */
  private getConnectionType(): string {
    if (typeof navigator === 'undefined') return 'Unknown'
    
    // Check for connection API
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection
    
    if (connection) {
      return connection.effectiveType || connection.type || 'Unknown'
    }
    
    return 'Unknown'
  }

  /**
   * Get user's location (with permission)
   */
  private async getLocation(): Promise<{ latitude: number; longitude: number; accuracy?: number } | undefined> {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return undefined
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          })
        },
        () => {
          resolve(undefined)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      )
    })
  }

  /**
   * Get device information from user agent
   */
  private getDeviceInfo() {
    if (typeof navigator === 'undefined') {
      return {
        platform: 'Unknown',
        browser: 'Unknown',
        os: 'Unknown',
        isMobile: false,
        isTablet: false
      }
    }

    const userAgent = navigator.userAgent
    
    return {
      platform: this.getPlatformFromUserAgent(userAgent),
      browser: this.getBrowserFromUserAgent(userAgent),
      os: this.getOSFromUserAgent(userAgent),
      isMobile: /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
      isTablet: /iPad|Android(?=.*Tablet)|Kindle|Silk/i.test(userAgent)
    }
  }

  /**
   * Calculate form completion time
   */
  private getCompletionTime(): number {
    return Math.round((Date.now() - this.startTime) / 1000) // seconds
  }

  /**
   * Parse platform from user agent
   */
  private getPlatformFromUserAgent(userAgent: string): string {
    if (/Windows/i.test(userAgent)) return 'Windows'
    if (/Macintosh|Mac OS X/i.test(userAgent)) return 'macOS'
    if (/Linux/i.test(userAgent)) return 'Linux'
    if (/Android/i.test(userAgent)) return 'Android'
    if (/iPhone|iPad|iPod/i.test(userAgent)) return 'iOS'
    return 'Unknown'
  }

  /**
   * Parse browser from user agent
   */
  private getBrowserFromUserAgent(userAgent: string): string {
    if (/Chrome/i.test(userAgent) && !/Edge/i.test(userAgent)) return 'Chrome'
    if (/Firefox/i.test(userAgent)) return 'Firefox'
    if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) return 'Safari'
    if (/Edge/i.test(userAgent)) return 'Edge'
    if (/Opera/i.test(userAgent)) return 'Opera'
    return 'Unknown'
  }

  /**
   * Parse OS from user agent
   */
  private getOSFromUserAgent(userAgent: string): string {
    if (/Windows NT 10.0/i.test(userAgent)) return 'Windows 10'
    if (/Windows NT 6.3/i.test(userAgent)) return 'Windows 8.1'
    if (/Windows NT 6.1/i.test(userAgent)) return 'Windows 7'
    if (/Mac OS X 10.15/i.test(userAgent)) return 'macOS Catalina'
    if (/Mac OS X 10.14/i.test(userAgent)) return 'macOS Mojave'
    if (/Android 11/i.test(userAgent)) return 'Android 11'
    if (/Android 10/i.test(userAgent)) return 'Android 10'
    if (/iPhone OS 14/i.test(userAgent)) return 'iOS 14'
    if (/iPhone OS 13/i.test(userAgent)) return 'iOS 13'
    return 'Unknown'
  }
}

/**
 * Utility function to collect metadata for form submission
 */
export async function collectFormMetadata(formVersion: string = '1.0'): Promise<ClientMetadata> {
  const collector = new MealMetadataCollector(formVersion)
  return await collector.collectMetadata()
}
