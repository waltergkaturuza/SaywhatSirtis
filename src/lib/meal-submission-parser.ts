/**
 * MEAL Submission Data Parser
 * Extracts and formats metadata from meal submissions for proper display
 */

export interface ParsedSubmission {
  id: string
  formName: string
  projectName: string
  submittedAt: string
  ipAddress: string
  location: string
  country: string
  region: string
  city: string
  coordinates: string | null
  gpsAccuracy: number | null
  gpsSource: string
  deviceInfo: {
    platform: string
    browser: string
    os: string
    userAgent: string
    language: string
    screenResolution: string
    timezone: string
    connectionType: string
    isMobile: boolean
    isTablet: boolean
  }
  dataSize: string
  attachments: number
  attachmentTypes: string[]
  completionTime: string
  submittedBy: string
  submittedByName: string
  status: string
  submissionSource: string
  formVersion: string
  referer: string
  origin: string
  timestamp: string
  formData: {
    hasPhoto: boolean
    photo: string | null
    [key: string]: any // Dynamic fields for different form types
  }
}

export class MealSubmissionParser {
  /**
   * Parse raw submission data into formatted display data
   */
  static parseSubmission(rawSubmission: any): ParsedSubmission {
    const metadata = rawSubmission.metadata || {}
    const deviceInfo = rawSubmission.device_info || {}
    const formData = rawSubmission.data || {}
    
    // Extract GPS data from multiple sources
    const gpsData = this.extractGPSData(rawSubmission, formData)
    
    // Extract device information from multiple sources
    const deviceData = this.extractDeviceInfo(deviceInfo, formData)
    
    // Extract location information
    const locationData = this.extractLocationInfo(metadata, formData, gpsData)
    
    // Format submitted time properly
    const submittedAt = this.formatDateTime(rawSubmission.submitted_at)
    
    return {
      id: rawSubmission.id,
      formName: rawSubmission.form_name || 'Unknown Form',
      projectName: rawSubmission.project_name || 'No Project',
      submittedAt: submittedAt,
      ipAddress: this.extractIPAddress(metadata, rawSubmission),
      location: locationData.location,
      country: locationData.country,
      region: locationData.region,
      city: locationData.city,
      coordinates: gpsData.coordinates,
      gpsAccuracy: gpsData.accuracy,
      gpsSource: gpsData.source,
      deviceInfo: deviceData,
      dataSize: this.calculateDataSize(rawSubmission.data),
      attachments: this.countAttachments(rawSubmission.attachments, formData),
      attachmentTypes: this.extractAttachmentTypes(rawSubmission.attachments, formData),
      completionTime: metadata.completion_time || 'Unknown',
      submittedBy: this.extractSubmitterInfo(rawSubmission, formData),
      submittedByName: this.extractSubmitterName(formData),
      status: metadata.status || 'completed',
      submissionSource: metadata.submission_source || 'Web Form',
      formVersion: metadata.form_version || '1.0',
      referer: metadata.referer || 'Unknown',
      origin: metadata.origin || 'Unknown',
      timestamp: metadata.timestamp || rawSubmission.submitted_at,
      formData: this.extractFormData(formData)
    }
  }

  /**
   * Extract GPS coordinates from multiple sources
   */
  private static extractGPSData(rawSubmission: any, formData: any) {
    let coordinates = null
    let accuracy = null
    let source = 'None'

    // Check database GPS fields first
    if (rawSubmission.latitude && rawSubmission.longitude) {
      coordinates = `${rawSubmission.latitude}, ${rawSubmission.longitude}`
      source = 'Database'
    }
    // Check form data GPS (BIODATA format)
    else if (formData.gps_location) {
      const gps = formData.gps_location
      if (gps.lat && gps.lng) {
        coordinates = `${gps.lat}, ${gps.lng}`
        accuracy = gps.accuracy || null
        source = 'Form Data'
      }
    }
    // Check alternative GPS field names
    else if (formData.gps) {
      const gps = formData.gps
      if (gps.latitude && gps.longitude) {
        coordinates = `${gps.latitude}, ${gps.longitude}`
        accuracy = gps.accuracy || null
        source = 'Form Data'
      }
    }

    return { coordinates, accuracy, source }
  }

  /**
   * Extract device information from multiple sources
   */
  private static extractDeviceInfo(deviceInfo: any, formData: any) {
    const formDeviceInfo = formData.device_info || {}
    
    return {
      platform: this.detectPlatform(deviceInfo.platform || formDeviceInfo.platform || formDeviceInfo.userAgent),
      browser: this.detectBrowser(deviceInfo.user_agent || formDeviceInfo.userAgent),
      os: this.detectOS(deviceInfo.user_agent || formDeviceInfo.userAgent),
      userAgent: deviceInfo.user_agent || formDeviceInfo.userAgent || 'Unknown',
      language: deviceInfo.language || formDeviceInfo.language || 'Unknown',
      screenResolution: deviceInfo.screen_resolution || 'Unknown',
      timezone: deviceInfo.timezone || 'Unknown',
      connectionType: deviceInfo.connection_type || 'Unknown',
      isMobile: this.detectMobile(deviceInfo.user_agent || formDeviceInfo.userAgent),
      isTablet: this.detectTablet(deviceInfo.user_agent || formDeviceInfo.userAgent)
    }
  }

  /**
   * Extract location information from multiple sources
   */
  private static extractLocationInfo(metadata: any, formData: any, gpsData: any) {
    let location = 'Unknown Location'
    let country = 'Unknown'
    let region = 'Unknown'
    let city = 'Unknown'

    // PRIORITY 1: GPS coordinates (most accurate)
    if (gpsData.coordinates) {
      const coords = gpsData.coordinates.split(', ')
      if (coords.length === 2) {
        const lat = parseFloat(coords[0])
        const lng = parseFloat(coords[1])
        
        // Show actual GPS coordinates as primary location
        location = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        
        // Try to identify country/region based on coordinates
        if (lat >= -18 && lat <= -15 && lng >= 30 && lng <= 33) {
          country = 'Zimbabwe'
          region = 'Harare Province'
          city = 'Harare'
        } else if (lat >= -40 && lat <= -35 && lng >= 140 && lng <= 150) {
          country = 'Australia'
          region = 'Victoria'
          city = 'Melbourne'
        } else {
          country = 'Unknown'
          region = 'Unknown'
          city = 'Unknown'
        }
      }
    }
    // PRIORITY 2: Metadata location
    else if (metadata.location && metadata.location !== 'Unknown Location') {
      location = metadata.location
      country = metadata.country || 'Unknown'
      region = metadata.region || 'Unknown'
      city = metadata.city || 'Unknown'
    }
    // PRIORITY 3: District name (fallback)
    else if (formData.district) {
      location = formData.district
      country = 'Zimbabwe' // Based on the GPS data we saw
      region = 'Unknown'
      city = formData.district
    }

    return { location, country, region, city }
  }

  /**
   * Extract IP address from multiple sources
   */
  private static extractIPAddress(metadata: any, rawSubmission: any): string {
    if (metadata.ip_address && metadata.ip_address !== 'Unknown') {
      return metadata.ip_address
    }
    
    // Try to extract from form data
    if (rawSubmission.data?.ip_address) {
      return rawSubmission.data.ip_address
    }
    
    return 'Unknown'
  }

  /**
   * Extract form-specific data dynamically
   */
  private static extractFormData(formData: any) {
    const extractedData: any = {
      hasPhoto: !!formData.photo,
      photo: formData.photo || null,
    }

    // Common fields that might exist in any form
    const commonFields = [
      'age', 'sex', 'name', 'surname', 'district', 'national_id', 'nationalId',
      'email', 'phone', 'address', 'city', 'country', 'region', 'postal_code',
      'date_of_birth', 'gender', 'occupation', 'education', 'income',
      'family_size', 'household_members', 'children_count',
      'latitude', 'longitude', 'coordinates', 'location',
      'timestamp', 'date', 'time', 'datetime',
      'status', 'priority', 'category', 'type',
      'description', 'notes', 'comments', 'feedback',
      'rating', 'score', 'value', 'amount', 'quantity',
      'unit', 'measurement', 'dimensions',
      'file', 'document', 'attachment', 'image', 'video',
      'signature', 'consent', 'agreement', 'terms'
    ]

    // Extract all common fields that exist in the form data
    commonFields.forEach(field => {
      if (formData[field] !== undefined && formData[field] !== null && formData[field] !== '') {
        extractedData[field] = formData[field]
      }
    })

    // Extract any other fields that might be form-specific
    Object.keys(formData).forEach(key => {
      if (!commonFields.includes(key) && 
          formData[key] !== undefined && 
          formData[key] !== null && 
          formData[key] !== '' &&
          typeof formData[key] !== 'object') {
        extractedData[key] = formData[key]
      }
    })

    return extractedData
  }

  /**
   * Categorize form data into logical groups for better display
   */
  static categorizeFormData(formData: any) {
    const categories: any = {
      personal: {},
      contact: {},
      location: {},
      demographic: {},
      assessment: {},
      technical: {},
      attachments: {},
      other: {}
    }

    Object.keys(formData).forEach(key => {
      const value = formData[key]
      if (value === null || value === undefined || value === '') return

      // Personal information
      if (['name', 'surname', 'age', 'sex', 'gender', 'date_of_birth', 'national_id', 'nationalId'].includes(key)) {
        categories.personal[key] = value
      }
      // Contact information
      else if (['email', 'phone', 'address', 'city', 'country', 'region', 'postal_code'].includes(key)) {
        categories.contact[key] = value
      }
      // Location information
      else if (['latitude', 'longitude', 'coordinates', 'location', 'district'].includes(key)) {
        categories.location[key] = value
      }
      // Demographic information
      else if (['occupation', 'education', 'income', 'family_size', 'household_members', 'children_count'].includes(key)) {
        categories.demographic[key] = value
      }
      // Assessment data
      else if (['rating', 'score', 'value', 'amount', 'quantity', 'status', 'priority', 'category', 'type'].includes(key)) {
        categories.assessment[key] = value
      }
      // Technical data
      else if (['timestamp', 'date', 'time', 'datetime', 'unit', 'measurement', 'dimensions'].includes(key)) {
        categories.technical[key] = value
      }
      // Attachments
      else if (['photo', 'file', 'document', 'attachment', 'image', 'video', 'signature'].includes(key)) {
        categories.attachments[key] = value
      }
      // Other fields
      else {
        categories.other[key] = value
      }
    })

    return categories
  }

  /**
   * Format field value for display
   */
  static formatFieldValue(key: string, value: any): string {
    if (value === null || value === undefined) return 'Not provided'
    
    // Handle dates
    if (key.includes('date') || key.includes('time') || key.includes('timestamp')) {
      try {
        const date = new Date(value)
        if (!isNaN(date.getTime())) {
          return date.toLocaleString()
        }
      } catch (e) {
        // Fall through to default formatting
      }
    }
    
    // Handle coordinates
    if (key.includes('latitude') || key.includes('longitude') || key.includes('coordinates')) {
      if (typeof value === 'number') {
        return value.toFixed(6)
      }
    }
    
    // Handle boolean values
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No'
    }
    
    // Handle arrays
    if (Array.isArray(value)) {
      return value.join(', ')
    }
    
    // Handle objects
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2)
    }
    
    return String(value)
  }

  /**
   * Extract submitter information from multiple sources
   */
  private static extractSubmitterInfo(rawSubmission: any, formData: any): string {
    // Try email first
    if (rawSubmission.user_email && rawSubmission.user_email !== 'Anonymous') {
      return rawSubmission.user_email
    }
    
    // Try submitted_by field
    if (rawSubmission.submitted_by && rawSubmission.submitted_by !== 'Anonymous') {
      return rawSubmission.submitted_by
    }
    
    // Try form data name and surname
    if (formData.name && formData.surname) {
      return `${formData.name} ${formData.surname}`
    }
    
    // Try just name
    if (formData.name) {
      return formData.name
    }
    
    // Try just surname
    if (formData.surname) {
      return formData.surname
    }
    
    return 'Anonymous'
  }

  /**
   * Extract submitter name from form data
   */
  private static extractSubmitterName(formData: any): string {
    if (formData.name && formData.surname) {
      return `${formData.name} ${formData.surname}`
    }
    
    if (formData.name) {
      return formData.name
    }
    
    if (formData.surname) {
      return formData.surname
    }
    
    return 'Anonymous'
  }

  /**
   * Calculate data size
   */
  private static calculateDataSize(data: any): string {
    if (!data) return '0 KB'
    const size = JSON.stringify(data).length
    return `${Math.round(size / 1024 * 10) / 10} KB`
  }

  /**
   * Count attachments from multiple sources
   */
  private static countAttachments(attachments: any, formData: any): number {
    let count = 0
    
    // Count from attachments field
    if (attachments) {
      if (Array.isArray(attachments)) {
        count += attachments.length
      } else if (typeof attachments === 'object') {
        count += Object.keys(attachments).length
      }
    }
    
    // Count from form data (photos, files, etc.)
    if (formData.photo) {
      count += 1
    }
    
    // Count other potential file fields
    const fileFields = ['document', 'file', 'attachment', 'image']
    fileFields.forEach(field => {
      if (formData[field]) {
        count += 1
      }
    })
    
    return count
  }

  /**
   * Extract attachment types from form data and attachments
   */
  private static extractAttachmentTypes(attachments: any, formData: any): string[] {
    const types: string[] = []
    
    // Check for photo in form data (BIODATA has photos)
    if (formData.photo) {
      if (formData.photo.startsWith('data:image/jpeg')) {
        types.push('Photo (JPEG)')
      } else if (formData.photo.startsWith('data:image/png')) {
        types.push('Photo (PNG)')
      } else if (formData.photo.startsWith('data:image/')) {
        types.push('Photo')
      } else {
        types.push('Photo')
      }
    }
    
    // Check attachments array/object
    if (attachments) {
      if (Array.isArray(attachments)) {
        attachments.forEach((attachment: any) => {
          if (attachment.type) {
            types.push(attachment.type)
          } else if (attachment.mimeType) {
            types.push(attachment.mimeType)
          } else if (attachment.filename) {
            const ext = attachment.filename.split('.').pop()?.toLowerCase()
            if (ext) {
              types.push(`File (${ext.toUpperCase()})`)
            }
          }
        })
      } else if (typeof attachments === 'object') {
        Object.values(attachments).forEach((attachment: any) => {
          if (attachment.type) {
            types.push(attachment.type)
          } else if (attachment.mimeType) {
            types.push(attachment.mimeType)
          }
        })
      }
    }
    
    // Remove duplicates
    return [...new Set(types)]
  }

  /**
   * Detect platform from user agent
   */
  private static detectPlatform(userAgent: string): string {
    if (!userAgent) return 'Unknown'
    
    if (/iPhone|iPad|iPod/i.test(userAgent)) return 'iOS'
    if (/Android/i.test(userAgent)) return 'Android'
    if (/Windows/i.test(userAgent)) return 'Windows'
    if (/Macintosh|Mac OS X/i.test(userAgent)) return 'macOS'
    if (/Linux/i.test(userAgent)) return 'Linux'
    
    return 'Unknown'
  }

  /**
   * Detect browser from user agent
   */
  private static detectBrowser(userAgent: string): string {
    if (!userAgent) return 'Unknown'
    
    if (/Chrome/i.test(userAgent) && !/Edge/i.test(userAgent)) return 'Chrome'
    if (/Firefox/i.test(userAgent)) return 'Firefox'
    if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) return 'Safari'
    if (/Edge/i.test(userAgent)) return 'Edge'
    if (/Opera/i.test(userAgent)) return 'Opera'
    
    return 'Unknown'
  }

  /**
   * Detect OS from user agent
   */
  private static detectOS(userAgent: string): string {
    if (!userAgent) return 'Unknown'
    
    if (/iPhone OS 18/i.test(userAgent)) return 'iOS 18'
    if (/iPhone OS 17/i.test(userAgent)) return 'iOS 17'
    if (/iPhone OS 16/i.test(userAgent)) return 'iOS 16'
    if (/iPhone OS 15/i.test(userAgent)) return 'iOS 15'
    if (/iPhone OS 14/i.test(userAgent)) return 'iOS 14'
    if (/iPhone OS 13/i.test(userAgent)) return 'iOS 13'
    if (/Android 14/i.test(userAgent)) return 'Android 14'
    if (/Android 13/i.test(userAgent)) return 'Android 13'
    if (/Android 12/i.test(userAgent)) return 'Android 12'
    if (/Android 11/i.test(userAgent)) return 'Android 11'
    if (/Android 10/i.test(userAgent)) return 'Android 10'
    if (/Windows NT 10.0/i.test(userAgent)) return 'Windows 10'
    if (/Windows NT 6.3/i.test(userAgent)) return 'Windows 8.1'
    if (/Windows NT 6.1/i.test(userAgent)) return 'Windows 7'
    if (/Mac OS X 10.15/i.test(userAgent)) return 'macOS Catalina'
    if (/Mac OS X 10.14/i.test(userAgent)) return 'macOS Mojave'
    
    return 'Unknown'
  }

  /**
   * Detect mobile device
   */
  private static detectMobile(userAgent: string): boolean {
    if (!userAgent) return false
    return /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
  }

  /**
   * Detect tablet device
   */
  private static detectTablet(userAgent: string): boolean {
    if (!userAgent) return false
    return /iPad|Android(?=.*Tablet)|Kindle|Silk/i.test(userAgent)
  }

  /**
   * Format date-time for display
   */
  private static formatDateTime(dateTime: any): string {
    if (!dateTime) return 'Unknown'
    
    try {
      // Handle both Date objects and strings
      let date: Date
      if (dateTime instanceof Date) {
        date = dateTime
      } else {
        date = new Date(dateTime)
      }
      
      if (isNaN(date.getTime())) return 'Invalid Date'
      
      // Format as DD/MM/YYYY, HH:MM:SS
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      const seconds = date.getSeconds().toString().padStart(2, '0')
      
      return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`
    } catch (error) {
      console.error('Date formatting error:', error, 'Input:', dateTime)
      return 'Invalid Date'
    }
  }
}
