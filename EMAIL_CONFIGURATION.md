# Email Configuration Guide

This guide explains how to configure SMTP email functionality for the SIRTIS system.

## Overview

The SIRTIS system uses **nodemailer** to send emails via SMTP. Currently configured for **Office365/Outlook** email servers.

## Environment Variables

Add the following environment variables to your deployment platform (Vercel, Render, etc.):

### Required Variables

```bash
# SMTP Server Configuration
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false   # false for TLS on port 587, true for SSL on port 465
SMTP_USERNAME=sirtis@saywhat.org.zw
SMTP_PASSWORD=C@mmsA0f25

# Email From Address
EMAIL_FROM="SIRTIS Notifications <sirtis@saywhat.org.zw>"
```

### Optional Variables

```bash
# Application URL (used in email links)
NEXTAUTH_URL=https://your-domain.com
```

## Configuration Details

### Office365 SMTP Settings

- **Host**: `smtp.office365.com`
- **Port**: `587` (TLS) or `465` (SSL)
- **Security**: `false` for port 587 (TLS), `true` for port 465 (SSL)
- **Authentication**: Required (username and password)

### Email Account Setup

1. **Email Account**: `sirtis@saywhat.org.zw`
2. **Password**: Use the current password for this email account
3. **From Name**: "SIRTIS Notifications"

## Setting Environment Variables

### Vercel

1. Go to your project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable listed above
4. Select the environments (Production, Preview, Development)
5. Click **Save**

### Render

1. Go to your service dashboard
2. Navigate to **Environment** tab
3. Add each variable listed above
4. Click **Save Changes**
5. Redeploy your service

### Local Development (.env.local)

Create or update `.env.local` file in the project root:

```bash
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USERNAME=sirtis@saywhat.org.zw
SMTP_PASSWORD=your_password_here
EMAIL_FROM="SIRTIS Notifications <sirtis@saywhat.org.zw>"
NEXTAUTH_URL=http://localhost:3000
```

**Important**: Never commit `.env.local` to version control. It's already in `.gitignore`.

## Email Features

The system sends emails for the following events:

### 1. Welcome Email
- **Trigger**: When a new user/employee is created
- **Content**: Account details, login instructions, temporary password (if provided)

### 2. Password Changed Notification
- **Trigger**: When a user successfully changes their password
- **Content**: Confirmation that password was changed, security reminder

### 3. Password Reset Email
- **Trigger**: When a user requests a password reset
- **Content**: Reset link with expiration time

### 4. Account Locked Notification
- **Trigger**: When an account is locked due to failed login attempts
- **Content**: Lock duration, security information

### 5. Generic Notifications
- **Trigger**: System notifications, alerts, etc.
- **Content**: Customizable message with optional action button

## Testing Email Configuration

### Verify SMTP Connection

The email service automatically verifies the SMTP connection on initialization. Check your application logs for:

- ✅ `Email service initialized successfully`
- ✅ `SMTP connection verified`

If you see errors:
- ❌ `Email service not fully configured` - Check environment variables
- ❌ `SMTP verification failed` - Check credentials and server settings

### Test Email Sending

You can test email functionality by:

1. **Creating a new user** - Should receive welcome email
2. **Changing password** - Should receive password changed notification
3. **Requesting password reset** - Should receive reset email

## Troubleshooting

### Emails Not Sending

1. **Check Environment Variables**
   - Verify all SMTP variables are set correctly
   - Ensure no extra spaces or quotes in values
   - Check that `SMTP_PASSWORD` matches the email account password

2. **Check SMTP Settings**
   - Verify Office365 account credentials
   - Ensure the email account allows SMTP access
   - Check if 2FA is enabled (may require app-specific password)

3. **Check Application Logs**
   - Look for email service initialization messages
   - Check for SMTP connection errors
   - Review email sending error messages

### Common Errors

**Error: "Email service not initialized"**
- **Solution**: Set all required SMTP environment variables

**Error: "SMTP verification failed"**
- **Solution**: Verify credentials and SMTP server settings

**Error: "Authentication failed"**
- **Solution**: Check username and password, ensure account allows SMTP

**Error: "Connection timeout"**
- **Solution**: Check firewall settings, verify SMTP port is accessible

### Office365 Specific Issues

1. **App Passwords**: If 2FA is enabled, you may need to use an app-specific password instead of the regular password

2. **SMTP Auth**: Ensure SMTP authentication is enabled for the account

3. **Rate Limits**: Office365 may have rate limits on email sending

## Security Considerations

1. **Never commit passwords** to version control
2. **Use environment variables** for all sensitive configuration
3. **Rotate passwords** regularly
4. **Monitor email logs** for suspicious activity
5. **Use app-specific passwords** if 2FA is enabled

## Email Templates

Email templates are defined in `src/lib/email-service.ts`. You can customize:

- HTML styling
- Email content
- Branding colors
- Action buttons
- Footer information

## Support

If you encounter issues with email configuration:

1. Check the troubleshooting section above
2. Review application logs for specific error messages
3. Verify SMTP settings with your email provider
4. Test SMTP connection using a mail client (e.g., Outlook, Thunderbird)

## Next Steps

After configuring email:

1. ✅ Test welcome email by creating a new user
2. ✅ Test password change notification
3. ✅ Verify email delivery and formatting
4. ✅ Monitor email sending logs
5. ✅ Set up email monitoring/alerts if needed

