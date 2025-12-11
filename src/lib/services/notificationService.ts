import { executeQuery } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'
import emailService from '@/lib/email-service'

export interface NotificationData {
  title: string
  message: string
  type: string
  priority?: 'low' | 'normal' | 'high' | 'critical'
  recipientId?: string
  employeeId?: string
  senderId: string
  deadline?: Date
  actionUrl?: string
  metadata?: any
}

export class NotificationService {
  
  /**
   * Create a new notification
   */
  static async createNotification(data: NotificationData) {
    try {
      return await executeQuery(async (prisma) => {
        // Validate foreign keys proactively to produce clearer errors
        if (data.employeeId) {
          const employeeExists = await prisma.employees.findUnique({ select: { id: true }, where: { id: data.employeeId } })
          if (!employeeExists) {
            throw new Error(`Employee ${data.employeeId} does not exist`)
          }
        }

        if (data.recipientId) {
          const recipientExists = await prisma.users.findUnique({ select: { id: true }, where: { id: data.recipientId } })
          if (!recipientExists) {
            throw new Error(`Recipient user ${data.recipientId} does not exist`)
          }
        }

        let senderId: string | null = data.senderId
        if (senderId === 'system') {
          // Allow null sender to avoid FK violation if no 'system' user row exists
            senderId = null
        } else if (senderId) {
          const senderExists = await prisma.users.findUnique({ select: { id: true }, where: { id: senderId } })
          if (!senderExists) {
            throw new Error(`Sender user ${senderId} does not exist`)
          }
        }

        const notification = await prisma.notifications.create({
          data: {
            id: uuidv4(),
            title: data.title,
            message: data.message,
            type: data.type.toUpperCase() as any,
            priority: data.priority || 'normal',
            recipientId: data.recipientId,
            employeeId: data.employeeId,
            senderId: senderId,
            deadline: data.deadline,
            actionUrl: data.actionUrl,
            metadata: data.metadata,
            status: 'pending'
          },
          include: {
            users_notifications_recipientIdTousers: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            },
            users_notifications_senderIdTousers: true,
            employees: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        })

        // Send email notification if recipient has email
        if (notification.users_notifications_recipientIdTousers?.email) {
          const recipient = notification.users_notifications_recipientIdTousers
          const employee = notification.employees
          const actionUrl = data.actionUrl 
            ? `${process.env.NEXTAUTH_URL || 'https://sirtis-saywhat.onrender.com'}${data.actionUrl}`
            : undefined

          // Send email based on notification type
          this.sendNotificationEmail(
            notification.type,
            recipient.email,
            recipient.firstName || 'User',
            data.title,
            data.message,
            actionUrl,
            employee,
            data.deadline,
            data.priority || 'normal'
          ).catch(err => {
            console.error('Failed to send notification email:', err)
            // Don't fail notification creation if email fails
          })
        }

        return notification
      })
    } catch (error) {
      console.error('Error creating notification:', error)
      // Pass through validation context if we set custom message
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to create notification')
    }
  }

  /**
   * Route notification based on routing rules
   */
  static async routeNotification(notificationType: string, employeeId: string, metadata?: any) {
    try {
      // Find routing rules for this notification type
      const routingRules = await executeQuery(async (prisma) => {
        return prisma.notification_routing_rules.findMany({
        where: {
          trigger: notificationType.toUpperCase(),
          isActive: true
        },
        include: {
          notification_routes: true
        },
        orderBy: {
          createdAt: 'desc'
        }
        })
      })

      const employee = await executeQuery(async (prisma) => {
        return prisma.employees.findUnique({
          where: { id: employeeId },
          include: { departments: true }
        })
      })

      if (!employee) {
        throw new Error('Employee not found')
      }

      const notifications = []

      // Process routing rules
      for (const rule of routingRules) {
        // Create notifications for each route in the rule
        for (const route of rule.notification_routes) {
            const notification = await this.createNotification({
              title: this.generateTitle(notificationType, employee),
              message: this.generateMessage(notificationType, employee, metadata),
              type: notificationType,
              priority: this.determinePriority(notificationType, metadata),
              recipientId: route.recipient, // Using the recipient field from the route
              employeeId: employeeId,
              senderId: 'system', // System generated
              deadline: this.calculateDeadline(notificationType, 0), // No delay minutes in current schema
              actionUrl: this.generateActionUrl(notificationType, employeeId),
              metadata: {
                ...metadata,
                routingRuleId: rule.id,
                routeId: route.id
              }
            })

            notifications.push(notification)
          }
      }

      // If no routing rules matched, use default routing
      if (notifications.length === 0) {
        const defaultNotification = await this.createDefaultNotification(
          notificationType, 
          employee, 
          metadata
        )
        notifications.push(defaultNotification)
      }

      return notifications
    } catch (error) {
      console.error('Error routing notification:', error)
      throw new Error('Failed to route notification')
    }
  }

  /**
   * Evaluate routing rule conditions
   */
  private static evaluateRuleConditions(conditions: any, employee: any, metadata?: any): boolean {
    if (!conditions) return true

    // Department condition
    if (conditions.department) {
      const empDept = employee.departments?.name || employee.department
      if (conditions.department !== empDept) return false
    }

    // Position condition
    if (conditions.position) {
      if (!employee.position?.toLowerCase().includes(conditions.position.toLowerCase())) {
        return false
      }
    }

    // Metadata conditions
    if (conditions.metadata && metadata) {
      for (const [key, value] of Object.entries(conditions.metadata)) {
        if (metadata[key] !== value) return false
      }
    }

    return true
  }

  /**
   * Generate notification title based on type
   */
  private static generateTitle(type: string, employee: any): string {
    const employeeName = `${employee.firstName} ${employee.lastName}`
    
    switch (type.toUpperCase()) {
      case 'PERFORMANCE_PLAN':
        return `Performance Plan Required - ${employeeName}`
      case 'APPRAISAL':
        return `Performance Appraisal Due - ${employeeName}`
      case 'TRAINING':
        return `Training Assignment - ${employeeName}`
      case 'DEADLINE':
        return `Deadline Reminder - ${employeeName}`
      case 'ESCALATION':
        return `Escalation Required - ${employeeName}`
      case 'APPROVAL':
        return `Approval Required - ${employeeName}`
      default:
        return `HR Notification - ${employeeName}`
    }
  }

  /**
   * Generate notification message
   */
  private static generateMessage(type: string, employee: any, metadata?: any): string {
    const employeeName = `${employee.firstName} ${employee.lastName}`
    const department = employee.departments?.name || employee.department || 'Unknown Department'
    
    switch (type.toUpperCase()) {
      case 'PERFORMANCE_PLAN':
        return `A performance improvement plan needs to be created for ${employeeName} in ${department}. Please review and take action.`
      case 'APPRAISAL':
        return `Performance appraisal is due for ${employeeName} in ${department}. Please complete the evaluation process.`
      case 'TRAINING':
        return `Training assignment required for ${employeeName} in ${department}. Please assign appropriate training modules.`
      case 'DEADLINE':
        return `Important deadline approaching for ${employeeName} in ${department}. Please ensure completion on time.`
      case 'ESCALATION':
        return `Issue escalation for ${employeeName} in ${department}. Immediate supervisor attention required.`
      case 'APPROVAL':
        return `Approval required for ${employeeName} in ${department}. Please review and approve/reject.`
      default:
        return `HR action required for ${employeeName} in ${department}.`
    }
  }

  /**
   * Determine notification priority
   */
  private static determinePriority(type: string, metadata?: any): 'low' | 'normal' | 'high' | 'critical' {
    if (metadata?.priority) return metadata.priority

    switch (type.toUpperCase()) {
      case 'ESCALATION':
        return 'critical'
      case 'DEADLINE':
        return 'high'
      case 'APPROVAL':
        return 'high'
      case 'PERFORMANCE_PLAN':
        return 'normal'
      case 'APPRAISAL':
        return 'normal'
      case 'TRAINING':
        return 'low'
      default:
        return 'normal'
    }
  }

  /**
   * Calculate deadline based on notification type and delay
   */
  private static calculateDeadline(type: string, delayMinutes: number = 0): Date {
    const now = new Date()
    const deadline = new Date(now.getTime() + (delayMinutes * 60 * 1000))

    // Add default deadlines based on type
    switch (type.toUpperCase()) {
      case 'ESCALATION':
        deadline.setHours(deadline.getHours() + 2) // 2 hours
        break
      case 'DEADLINE':
        deadline.setDate(deadline.getDate() + 1) // 1 day
        break
      case 'APPROVAL':
        deadline.setDate(deadline.getDate() + 3) // 3 days
        break
      case 'PERFORMANCE_PLAN':
        deadline.setDate(deadline.getDate() + 7) // 1 week
        break
      case 'APPRAISAL':
        deadline.setDate(deadline.getDate() + 14) // 2 weeks
        break
      case 'TRAINING':
        deadline.setDate(deadline.getDate() + 30) // 1 month
        break
      default:
        deadline.setDate(deadline.getDate() + 7) // 1 week default
    }

    return deadline
  }

  /**
   * Generate action URL for notification
   */
  private static generateActionUrl(type: string, employeeId: string): string {
    switch (type.toUpperCase()) {
      case 'PERFORMANCE_PLAN':
        return `/hr/performance/plans/${employeeId}`
      case 'APPRAISAL':
        return `/hr/performance/appraisals/${employeeId}`
      case 'TRAINING':
        return `/hr/training/assignments/${employeeId}`
      case 'APPROVAL':
        return `/hr/approvals/${employeeId}`
      default:
        return `/hr/employees/${employeeId}`
    }
  }

  /**
   * Create default notification when no routing rules match
   */
  private static async createDefaultNotification(type: string, employee: any, metadata?: any) {
    // Default to employee's manager or HR
    // Schema uses supervisor_id for manager relationship
    let recipientId = employee.supervisor_id

    // If no manager, find HR manager
    if (!recipientId) {
      const hrManager = await executeQuery(async (prisma) => {
        return prisma.employees.findFirst({
          where: {
            archived_at: null,
            OR: [
              { position: { contains: 'HR Manager', mode: 'insensitive' } },
              { position: { contains: 'Human Resources', mode: 'insensitive' } },
              { department: { contains: 'HR', mode: 'insensitive' } }
            ]
          },
          include: { users: { select: { id: true } } }
        })
      })
  recipientId = hrManager?.users?.id || hrManager?.id
    }

    return await this.createNotification({
      title: this.generateTitle(type, employee),
      message: this.generateMessage(type, employee, metadata),
      type: type,
      priority: this.determinePriority(type, metadata),
      recipientId: recipientId,
      employeeId: employee.id,
      senderId: 'system',
      deadline: this.calculateDeadline(type),
      actionUrl: this.generateActionUrl(type, employee.id),
      metadata: {
        ...metadata,
        isDefault: true
      }
    })
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string) {
    try {
      return await executeQuery(async (prisma) => {
        return prisma.notifications.update({
        where: { 
          id: notificationId,
          recipientId: userId
        },
        data: { 
          isRead: true,
          updatedAt: new Date()
        }
        })
      })
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw new Error('Failed to mark notification as read')
    }
  }

  /**
   * Update notification status
   */
  static async updateStatus(notificationId: string, status: string, userId?: string) {
    try {
      const updateData: any = { 
        status: status.toLowerCase(),
        updatedAt: new Date()
      }

      if (status === 'acknowledged' && userId) {
        updateData.acknowledgedAt = new Date()
      }

      return await executeQuery(async (prisma) => {
        return prisma.notifications.update({
          where: { id: notificationId },
          data: updateData
        })
      })
    } catch (error) {
      console.error('Error updating notification status:', error)
      throw new Error('Failed to update notification status')
    }
  }

  /**
   * Send email notification based on type
   */
  private static async sendNotificationEmail(
    type: string,
    recipientEmail: string,
    recipientName: string,
    title: string,
    message: string,
    actionUrl?: string,
    employee?: { firstName: string; lastName: string; email: string | null } | null,
    deadline?: Date | null,
    priority: string = 'normal'
  ): Promise<void> {
    const notificationType = type.toUpperCase()
    const baseUrl = process.env.NEXTAUTH_URL || 'https://sirtis-saywhat.onrender.com'
    const actionButtonText = this.getActionButtonText(notificationType)
    const formattedDeadline = deadline 
      ? new Date(deadline).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : null

    // Generate email content based on notification type
    let emailSubject = title
    let emailMessage = message

    // Add context based on notification type
    switch (notificationType) {
      case 'PERFORMANCE_PLAN':
        emailSubject = `Performance Plan Required - ${employee ? `${employee.firstName} ${employee.lastName}` : 'Action Required'}`
        emailMessage = `
${message}

${employee ? `Employee: ${employee.firstName} ${employee.lastName}` : ''}
${formattedDeadline ? `Deadline: ${formattedDeadline}` : ''}

Please review and create the performance plan as soon as possible.
        `.trim()
        break

      case 'APPRAISAL':
        emailSubject = `Performance Appraisal Due - ${employee ? `${employee.firstName} ${employee.lastName}` : 'Action Required'}`
        emailMessage = `
${message}

${employee ? `Employee: ${employee.firstName} ${employee.lastName}` : ''}
${formattedDeadline ? `Due Date: ${formattedDeadline}` : ''}

Please complete the performance appraisal evaluation process.
        `.trim()
        break

      case 'TRAINING':
        emailSubject = `Training Assignment - ${employee ? `${employee.firstName} ${employee.lastName}` : 'Action Required'}`
        emailMessage = `
${message}

${employee ? `Employee: ${employee.firstName} ${employee.lastName}` : ''}
${formattedDeadline ? `Training Deadline: ${formattedDeadline}` : ''}

Please assign appropriate training modules.
        `.trim()
        break

      case 'DEADLINE':
        emailSubject = `Deadline Reminder - ${employee ? `${employee.firstName} ${employee.lastName}` : 'Action Required'}`
        emailMessage = `
${message}

${employee ? `Related to: ${employee.firstName} ${employee.lastName}` : ''}
${formattedDeadline ? `⚠️ Deadline: ${formattedDeadline}` : ''}

Please ensure completion on time.
        `.trim()
        break

      case 'ESCALATION':
        emailSubject = `🚨 Escalation Required - ${employee ? `${employee.firstName} ${employee.lastName}` : 'Urgent'}`
        emailMessage = `
${message}

${employee ? `Employee: ${employee.firstName} ${employee.lastName}` : ''}
${formattedDeadline ? `Response Required By: ${formattedDeadline}` : ''}

Immediate supervisor attention required.
        `.trim()
        break

      case 'APPROVAL':
        emailSubject = `Approval Required - ${employee ? `${employee.firstName} ${employee.lastName}` : 'Action Required'}`
        emailMessage = `
${message}

${employee ? `Employee: ${employee.firstName} ${employee.lastName}` : ''}
${formattedDeadline ? `Approval Deadline: ${formattedDeadline}` : ''}

Please review and approve/reject as appropriate.
        `.trim()
        break

      default:
        // Generic notification
        emailMessage = `
${message}

${employee ? `Related Employee: ${employee.firstName} ${employee.lastName}` : ''}
${formattedDeadline ? `Deadline: ${formattedDeadline}` : ''}
        `.trim()
    }

    // Add priority indicator
    if (priority === 'critical' || priority === 'high') {
      emailMessage = `[${priority.toUpperCase()} PRIORITY]\n\n${emailMessage}`
    }

    // Send email using email service
    await emailService.sendNotificationEmail(
      recipientEmail,
      emailSubject,
      emailMessage,
      actionUrl,
      actionButtonText
    )
  }

  /**
   * Get action button text based on notification type
   */
  private static getActionButtonText(type: string): string {
    switch (type.toUpperCase()) {
      case 'PERFORMANCE_PLAN':
        return 'View Performance Plan'
      case 'APPRAISAL':
        return 'Complete Appraisal'
      case 'TRAINING':
        return 'View Training'
      case 'DEADLINE':
        return 'View Details'
      case 'ESCALATION':
        return 'Respond Now'
      case 'APPROVAL':
        return 'Review & Approve'
      default:
        return 'View Notification'
    }
  }
}