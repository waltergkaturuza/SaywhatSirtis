// Phase 4: Office 365 Integration Service
// Comprehensive integration with Microsoft Office 365 services

import { Client } from '@microsoft/microsoft-graph-client'
import { AuthenticationProvider } from '@microsoft/microsoft-graph-client'

interface Office365Config {
  tenant: string
  clientId: string
  clientSecret: string
  redirectUri: string
  scopes: string[]
}

interface SharePointSite {
  id: string
  name: string
  webUrl: string
  displayName: string
}

interface SharePointDocument {
  id: string
  name: string
  webUrl: string
  size: number
  createdDateTime: string
  lastModifiedDateTime: string
  createdBy: {
    user: {
      displayName: string
      email: string
    }
  }
}

interface TeamsChannel {
  id: string
  displayName: string
  description: string
  webUrl: string
}

interface CalendarEvent {
  id: string
  subject: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  attendees: Array<{
    emailAddress: {
      address: string
      name: string
    }
    status: {
      response: string
      time: string
    }
  }>
}

class GraphAuthProvider implements AuthenticationProvider {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  async getAccessToken(): Promise<string> {
    return this.accessToken
  }
}

export class Office365Service {
  private config: Office365Config
  private graphClient?: Client

  constructor(config: Office365Config) {
    this.config = config
  }

  // Initialize Graph Client with user token
  initializeGraphClient(accessToken: string): void {
    const authProvider = new GraphAuthProvider(accessToken)
    this.graphClient = Client.initWithMiddleware({ authProvider })
  }

  // SharePoint Integration
  async getSharePointSites(): Promise<SharePointSite[]> {
    if (!this.graphClient) throw new Error('Graph client not initialized')

    try {
      const sites = await this.graphClient
        .api('/sites')
        .filter("siteCollection/hostname eq 'yourdomain.sharepoint.com'")
        .get()

      return sites.value.map((site: any) => ({
        id: site.id,
        name: site.name,
        webUrl: site.webUrl,
        displayName: site.displayName
      }))
    } catch (error) {
      console.error('Error fetching SharePoint sites:', error)
      throw new Error('Failed to fetch SharePoint sites')
    }
  }

  async getSharePointDocuments(siteId: string, listName: string = 'Documents'): Promise<SharePointDocument[]> {
    if (!this.graphClient) throw new Error('Graph client not initialized')

    try {
      const documents = await this.graphClient
        .api(`/sites/${siteId}/lists/${listName}/items`)
        .expand('fields,driveItem')
        .get()

      return documents.value
        .filter((item: any) => item.driveItem)
        .map((item: any) => ({
          id: item.driveItem.id,
          name: item.driveItem.name,
          webUrl: item.driveItem.webUrl,
          size: item.driveItem.size,
          createdDateTime: item.driveItem.createdDateTime,
          lastModifiedDateTime: item.driveItem.lastModifiedDateTime,
          createdBy: item.driveItem.createdBy
        }))
    } catch (error) {
      console.error('Error fetching SharePoint documents:', error)
      throw new Error('Failed to fetch SharePoint documents')
    }
  }

  async uploadDocumentToSharePoint(
    siteId: string, 
    fileName: string, 
    fileContent: Buffer,
    folderPath: string = ''
  ): Promise<SharePointDocument> {
    if (!this.graphClient) throw new Error('Graph client not initialized')

    try {
      const uploadPath = folderPath 
        ? `/sites/${siteId}/drive/root:/${folderPath}/${fileName}:/content`
        : `/sites/${siteId}/drive/root:/${fileName}:/content`

      const uploadResult = await this.graphClient
        .api(uploadPath)
        .put(fileContent)

      return {
        id: uploadResult.id,
        name: uploadResult.name,
        webUrl: uploadResult.webUrl,
        size: uploadResult.size,
        createdDateTime: uploadResult.createdDateTime,
        lastModifiedDateTime: uploadResult.lastModifiedDateTime,
        createdBy: uploadResult.createdBy
      }
    } catch (error) {
      console.error('Error uploading document to SharePoint:', error)
      throw new Error('Failed to upload document to SharePoint')
    }
  }

  async syncSIRTISDocumentToSharePoint(
    documentId: string,
    siteId: string,
    folderPath: string = 'SIRTIS Documents'
  ): Promise<void> {
    try {
      // This would integrate with your existing document system
      // For now, it's a placeholder that would:
      // 1. Fetch document from SIRTIS database
      // 2. Convert/prepare for SharePoint
      // 3. Upload to designated SharePoint location
      // 4. Update SIRTIS database with SharePoint URL

      console.log(`Syncing document ${documentId} to SharePoint site ${siteId}`)
      
      // Implementation would go here
    } catch (error) {
      console.error('Error syncing document to SharePoint:', error)
      throw new Error('Failed to sync document to SharePoint')
    }
  }

  // Microsoft Teams Integration
  async getTeamsChannels(teamId: string): Promise<TeamsChannel[]> {
    if (!this.graphClient) throw new Error('Graph client not initialized')

    try {
      const channels = await this.graphClient
        .api(`/teams/${teamId}/channels`)
        .get()

      return channels.value.map((channel: any) => ({
        id: channel.id,
        displayName: channel.displayName,
        description: channel.description,
        webUrl: channel.webUrl
      }))
    } catch (error) {
      console.error('Error fetching Teams channels:', error)
      throw new Error('Failed to fetch Teams channels')
    }
  }

  async sendTeamsNotification(
    teamId: string,
    channelId: string,
    message: string,
    isUrgent: boolean = false
  ): Promise<void> {
    if (!this.graphClient) throw new Error('Graph client not initialized')

    try {
      const messageBody = {
        body: {
          contentType: 'html',
          content: `
            <div style="background-color: ${isUrgent ? '#ffebee' : '#f5f5f5'}; padding: 10px; border-radius: 5px;">
              <h3 style="color: ${isUrgent ? '#d32f2f' : '#1976d2'};">📢 SIRTIS Notification</h3>
              <p>${message}</p>
              <small>Sent from SIRTIS at ${new Date().toLocaleString()}</small>
            </div>
          `
        }
      }

      await this.graphClient
        .api(`/teams/${teamId}/channels/${channelId}/messages`)
        .post(messageBody)

    } catch (error) {
      console.error('Error sending Teams notification:', error)
      throw new Error('Failed to send Teams notification')
    }
  }

  async createTeamsMeeting(
    subject: string,
    startTime: Date,
    endTime: Date,
    attendees: string[],
    content?: string
  ): Promise<string> {
    if (!this.graphClient) throw new Error('Graph client not initialized')

    try {
      const meeting = {
        subject: subject,
        body: {
          contentType: 'HTML',
          content: content || `Meeting created from SIRTIS for: ${subject}`
        },
        start: {
          dateTime: startTime.toISOString(),
          timeZone: 'UTC'
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'UTC'
        },
        attendees: attendees.map(email => ({
          emailAddress: {
            address: email,
            name: email.split('@')[0]
          },
          type: 'required'
        })),
        isOnlineMeeting: true,
        onlineMeetingProvider: 'teamsForBusiness'
      }

      const result = await this.graphClient
        .api('/me/events')
        .post(meeting)

      return result.onlineMeeting.joinUrl
    } catch (error) {
      console.error('Error creating Teams meeting:', error)
      throw new Error('Failed to create Teams meeting')
    }
  }

  // Outlook Integration
  async getCalendarEvents(
    startDate: Date,
    endDate: Date
  ): Promise<CalendarEvent[]> {
    if (!this.graphClient) throw new Error('Graph client not initialized')

    try {
      const events = await this.graphClient
        .api('/me/events')
        .filter(`start/dateTime ge '${startDate.toISOString()}' and end/dateTime le '${endDate.toISOString()}'`)
        .select('id,subject,start,end,attendees')
        .orderby('start/dateTime')
        .get()

      return events.value
    } catch (error) {
      console.error('Error fetching calendar events:', error)
      throw new Error('Failed to fetch calendar events')
    }
  }

  async createCalendarEvent(
    subject: string,
    startTime: Date,
    endTime: Date,
    attendees: string[],
    location?: string,
    body?: string
  ): Promise<string> {
    if (!this.graphClient) throw new Error('Graph client not initialized')

    try {
      const event = {
        subject: subject,
        body: {
          contentType: 'HTML',
          content: body || `Event created from SIRTIS: ${subject}`
        },
        start: {
          dateTime: startTime.toISOString(),
          timeZone: 'UTC'
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'UTC'
        },
        location: location ? {
          displayName: location
        } : undefined,
        attendees: attendees.map(email => ({
          emailAddress: {
            address: email,
            name: email.split('@')[0]
          },
          type: 'required'
        }))
      }

      const result = await this.graphClient
        .api('/me/events')
        .post(event)

      return result.id
    } catch (error) {
      console.error('Error creating calendar event:', error)
      throw new Error('Failed to create calendar event')
    }
  }

  async sendEmail(
    to: string[],
    subject: string,
    body: string,
    cc?: string[],
    attachments?: Array<{
      name: string
      content: Buffer
      contentType: string
    }>
  ): Promise<void> {
    if (!this.graphClient) throw new Error('Graph client not initialized')

    try {
      const message = {
        subject: subject,
        body: {
          contentType: 'HTML',
          content: body
        },
        toRecipients: to.map(email => ({
          emailAddress: {
            address: email
          }
        })),
        ccRecipients: cc?.map(email => ({
          emailAddress: {
            address: email
          }
        })),
        attachments: attachments?.map(att => ({
          '@odata.type': '#microsoft.graph.fileAttachment',
          name: att.name,
          contentType: att.contentType,
          contentBytes: att.content.toString('base64')
        }))
      }

      await this.graphClient
        .api('/me/sendMail')
        .post({ message })

    } catch (error) {
      console.error('Error sending email:', error)
      throw new Error('Failed to send email')
    }
  }

  // OneDrive Integration
  async uploadToOneDrive(
    fileName: string,
    fileContent: Buffer,
    folderPath: string = 'SIRTIS'
  ): Promise<string> {
    if (!this.graphClient) throw new Error('Graph client not initialized')

    try {
      const uploadPath = `/me/drive/root:/${folderPath}/${fileName}:/content`

      const result = await this.graphClient
        .api(uploadPath)
        .put(fileContent)

      return result.webUrl
    } catch (error) {
      console.error('Error uploading to OneDrive:', error)
      throw new Error('Failed to upload to OneDrive')
    }
  }

  // User Profile and Directory Integration
  async getUserProfile(userId?: string): Promise<any> {
    if (!this.graphClient) throw new Error('Graph client not initialized')

    try {
      const endpoint = userId ? `/users/${userId}` : '/me'
      const user = await this.graphClient
        .api(endpoint)
        .select('id,displayName,mail,jobTitle,department,officeLocation,businessPhones')
        .get()

      return user
    } catch (error) {
      console.error('Error fetching user profile:', error)
      throw new Error('Failed to fetch user profile')
    }
  }

  async searchUsers(query: string): Promise<any[]> {
    if (!this.graphClient) throw new Error('Graph client not initialized')

    try {
      const users = await this.graphClient
        .api('/users')
        .filter(`startswith(displayName,'${query}') or startswith(mail,'${query}')`)
        .select('id,displayName,mail,jobTitle,department')
        .top(10)
        .get()

      return users.value
    } catch (error) {
      console.error('Error searching users:', error)
      throw new Error('Failed to search users')
    }
  }

  // Integration Health Check
  async checkConnection(): Promise<{
    isConnected: boolean
    services: {
      graph: boolean
      sharepoint: boolean
      teams: boolean
      outlook: boolean
      onedrive: boolean
    }
    error?: string
  }> {
    try {
      if (!this.graphClient) {
        return {
          isConnected: false,
          services: {
            graph: false,
            sharepoint: false,
            teams: false,
            outlook: false,
            onedrive: false
          },
          error: 'Graph client not initialized'
        }
      }

      // Test basic Graph API access
      await this.graphClient.api('/me').select('id').get()

      return {
        isConnected: true,
        services: {
          graph: true,
          sharepoint: true, // Would test specific endpoints
          teams: true,
          outlook: true,
          onedrive: true
        }
      }
    } catch (error) {
      return {
        isConnected: false,
        services: {
          graph: false,
          sharepoint: false,
          teams: false,
          outlook: false,
          onedrive: false
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// Factory function to create Office365Service
export const createOffice365Service = (config: Office365Config): Office365Service => {
  return new Office365Service(config)
}

// Default configuration helper
export const getDefaultOffice365Config = (): Office365Config => ({
  tenant: process.env.OFFICE365_TENANT || '',
  clientId: process.env.OFFICE365_CLIENT_ID || '',
  clientSecret: process.env.OFFICE365_CLIENT_SECRET || '',
  redirectUri: process.env.OFFICE365_REDIRECT_URI || 'http://localhost:3000/auth/office365/callback',
  scopes: [
    'https://graph.microsoft.com/Sites.ReadWrite.All',
    'https://graph.microsoft.com/Files.ReadWrite.All',
    'https://graph.microsoft.com/Team.ReadBasic.All',
    'https://graph.microsoft.com/Channel.ReadBasic.All',
    'https://graph.microsoft.com/ChannelMessage.Send',
    'https://graph.microsoft.com/Calendars.ReadWrite',
    'https://graph.microsoft.com/Mail.Send',
    'https://graph.microsoft.com/User.Read.All',
    'https://graph.microsoft.com/Directory.Read.All'
  ]
})
