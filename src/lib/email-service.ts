import nodemailer from 'nodemailer'

export interface EmailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  cc?: string | string[]
  bcc?: string | string[]
  attachments?: Array<{
    filename: string
    content?: Buffer | string
    path?: string
    contentType?: string
  }>
}

export interface SMTPConfig {
  host: string
  port: number
  secure: boolean // true for 465, false for other ports
  auth: {
    user: string
    pass: string
  }
  from: string // Format: "Name <email@domain.com>"
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null
  private config: SMTPConfig | null = null
  private initialized = false

  /**
   * Initialize the email service with SMTP configuration
   */
  initialize(config?: SMTPConfig): void {
    // Use provided config or read from environment variables
    const smtpConfig: SMTPConfig = config || {
      host: process.env.SMTP_HOST || 'smtp.office365.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true' || false, // false for TLS on port 587
      auth: {
        user: process.env.SMTP_USERNAME || '',
        pass: process.env.SMTP_PASSWORD || '',
      },
      from: process.env.EMAIL_FROM || 'SIRTIS Notifications <sirtis@saywhat.org.zw>',
    }

    // Validate configuration
    if (!smtpConfig.host || !smtpConfig.auth.user || !smtpConfig.auth.pass) {
      console.warn('⚠️ Email service not fully configured. SMTP_HOST, SMTP_USERNAME, and SMTP_PASSWORD are required.')
      this.initialized = false
      return
    }

    this.config = smtpConfig

    try {
      this.transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure, // true for 465, false for other ports
        auth: {
          user: smtpConfig.auth.user,
          pass: smtpConfig.auth.pass,
        },
        tls: {
          // Do not fail on invalid certificates
          rejectUnauthorized: false,
        },
      })

      this.initialized = true
      console.log('✅ Email service initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error)
      this.initialized = false
    }
  }

  /**
   * Verify SMTP connection
   */
  async verifyConnection(): Promise<boolean> {
    if (!this.transporter || !this.initialized) {
      console.warn('⚠️ Email service not initialized')
      return false
    }

    try {
      await this.transporter.verify()
      console.log('✅ SMTP connection verified')
      return true
    } catch (error) {
      console.error('❌ SMTP verification failed:', error)
      return false
    }
  }

  /**
   * Send an email
   */
  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.transporter || !this.initialized || !this.config) {
      const error = 'Email service not initialized. Please configure SMTP settings.'
      console.error('❌', error)
      return { success: false, error }
    }

    try {
      // Normalize recipients
      const to = Array.isArray(options.to) ? options.to : [options.to]
      const cc = options.cc ? (Array.isArray(options.cc) ? options.cc : [options.cc]) : undefined
      const bcc = options.bcc ? (Array.isArray(options.bcc) ? options.bcc : [options.bcc]) : undefined

      const mailOptions: nodemailer.SendMailOptions = {
        from: this.config.from,
        to: to.join(', '),
        subject: options.subject,
        html: options.html,
        text: options.text,
        cc: cc?.join(', '),
        bcc: bcc?.join(', '),
        attachments: options.attachments,
      }

      const info = await this.transporter.sendMail(mailOptions)
      console.log('✅ Email sent successfully:', info.messageId)
      return { success: true, messageId: info.messageId }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to send email'
      console.error('❌ Error sending email:', errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(
    to: string,
    firstName: string,
    email: string,
    temporaryPassword?: string
  ): Promise<{ success: boolean; error?: string }> {
    const subject = 'Welcome to SIRTIS - Your Account Has Been Created'
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to SIRTIS</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Welcome to SIRTIS</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Dear ${firstName},</p>
            <p>Your account has been successfully created in the SIRTIS system.</p>
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Email:</strong> ${email}</p>
              ${temporaryPassword ? `<p style="margin: 10px 0 0 0;"><strong>Temporary Password:</strong> <code style="background: #f0f0f0; padding: 5px 10px; border-radius: 3px;">${temporaryPassword}</code></p>` : ''}
            </div>
            ${temporaryPassword ? '<p><strong>Important:</strong> Please change your password after your first login for security purposes.</p>' : ''}
            <p>You can now access the system at: <a href="${process.env.NEXTAUTH_URL || 'https://sirtis-saywhat.onrender.com'}" style="color: #667eea;">${process.env.NEXTAUTH_URL || 'https://sirtis-saywhat.onrender.com'}</a></p>
            <p>If you have any questions or need assistance, please contact the system administrator.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">This is an automated message from SIRTIS. Please do not reply to this email.</p>
          </div>
        </body>
      </html>
    `

    const text = `
Welcome to SIRTIS

Dear ${firstName},

Your account has been successfully created in the SIRTIS system.

Email: ${email}
${temporaryPassword ? `Temporary Password: ${temporaryPassword}` : ''}

${temporaryPassword ? 'Important: Please change your password after your first login for security purposes.' : ''}

You can now access the system at: ${process.env.NEXTAUTH_URL || 'https://sirtis-saywhat.onrender.com'}

If you have any questions or need assistance, please contact the system administrator.

---
This is an automated message from SIRTIS. Please do not reply to this email.
    `

    return await this.sendEmail({ to, subject, html, text })
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    to: string,
    firstName: string,
    resetToken: string,
    resetUrl?: string
  ): Promise<{ success: boolean; error?: string }> {
    const subject = 'SIRTIS - Password Reset Request'
    const resetLink = resetUrl || `${process.env.NEXTAUTH_URL || 'https://sirtis-saywhat.onrender.com'}/auth/reset-password?token=${resetToken}`

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Password Reset Request</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Dear ${firstName},</p>
            <p>We received a request to reset your password for your SIRTIS account.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${resetLink}</p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you did not request a password reset, please ignore this email or contact the system administrator if you have concerns.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">This is an automated message from SIRTIS. Please do not reply to this email.</p>
          </div>
        </body>
      </html>
    `

    const text = `
Password Reset Request

Dear ${firstName},

We received a request to reset your password for your SIRTIS account.

Click the following link to reset your password:
${resetLink}

This link will expire in 1 hour.

If you did not request a password reset, please ignore this email or contact the system administrator if you have concerns.

---
This is an automated message from SIRTIS. Please do not reply to this email.
    `

    return await this.sendEmail({ to, subject, html, text })
  }

  /**
   * Send password changed notification
   */
  async sendPasswordChangedEmail(
    to: string,
    firstName: string
  ): Promise<{ success: boolean; error?: string }> {
    const subject = 'SIRTIS - Password Changed Successfully'

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Changed</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Password Changed</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Dear ${firstName},</p>
            <p>Your password has been successfully changed.</p>
            <p>If you did not make this change, please contact the system administrator immediately.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">This is an automated message from SIRTIS. Please do not reply to this email.</p>
          </div>
        </body>
      </html>
    `

    const text = `
Password Changed

Dear ${firstName},

Your password has been successfully changed.

If you did not make this change, please contact the system administrator immediately.

---
This is an automated message from SIRTIS. Please do not reply to this email.
    `

    return await this.sendEmail({ to, subject, html, text })
  }

  /**
   * Send account locked notification
   */
  async sendAccountLockedEmail(
    to: string,
    firstName: string,
    unlockUrl?: string
  ): Promise<{ success: boolean; error?: string }> {
    const subject = 'SIRTIS - Account Temporarily Locked'

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Account Locked</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #dc3545; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Account Temporarily Locked</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Dear ${firstName},</p>
            <p>Your account has been temporarily locked due to multiple failed login attempts.</p>
            <p>For security reasons, your account will remain locked for 15 minutes.</p>
            <p>After this period, you can try logging in again.</p>
            ${unlockUrl ? `<p>If you need immediate assistance, please contact the system administrator or visit: <a href="${unlockUrl}">${unlockUrl}</a></p>` : ''}
            <p>If you did not attempt to log in, please contact the system administrator immediately as your account may have been compromised.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">This is an automated message from SIRTIS. Please do not reply to this email.</p>
          </div>
        </body>
      </html>
    `

    const text = `
Account Temporarily Locked

Dear ${firstName},

Your account has been temporarily locked due to multiple failed login attempts.

For security reasons, your account will remain locked for 15 minutes.
After this period, you can try logging in again.

If you did not attempt to log in, please contact the system administrator immediately as your account may have been compromised.

---
This is an automated message from SIRTIS. Please do not reply to this email.
    `

    return await this.sendEmail({ to, subject, html, text })
  }

  /**
   * Send notification email (generic)
   */
  async sendNotificationEmail(
    to: string | string[],
    subject: string,
    message: string,
    actionUrl?: string,
    actionText?: string
  ): Promise<{ success: boolean; error?: string }> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">SIRTIS Notification</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <div style="white-space: pre-wrap;">${message.replace(/\n/g, '<br>')}</div>
            ${actionUrl && actionText ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${actionUrl}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">${actionText}</a>
              </div>
            ` : ''}
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">This is an automated message from SIRTIS. Please do not reply to this email.</p>
          </div>
        </body>
      </html>
    `

    const text = `
${subject}

${message}

${actionUrl ? `${actionText || 'Click here'}: ${actionUrl}` : ''}

---
This is an automated message from SIRTIS. Please do not reply to this email.
    `

    return await this.sendEmail({ to, subject, html, text })
  }
}

// Create singleton instance
const emailService = new EmailService()

// Initialize on module load if environment variables are set
if (process.env.SMTP_HOST && process.env.SMTP_USERNAME && process.env.SMTP_PASSWORD) {
  emailService.initialize()
}

export default emailService

