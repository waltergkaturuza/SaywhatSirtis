# Notification Email Integration Summary

## ✅ Completed

### 1. Email Integration into Notification Service
- ✅ Integrated email sending into `NotificationService.createNotification()`
- ✅ Emails are automatically sent when notifications are created
- ✅ Updated `/api/hr/notifications` endpoint to use `NotificationService` for automatic email sending

### 2. Email Templates for Performance Notifications

The system now sends formatted emails for the following notification types:

#### **Performance Plan** (`PERFORMANCE_PLAN`)
- **Subject**: "Performance Plan Required - [Employee Name]"
- **Content**: Includes employee details, deadline, and action instructions
- **Action Button**: "View Performance Plan"

#### **Performance Appraisal** (`APPRAISAL`)
- **Subject**: "Performance Appraisal Due - [Employee Name]"
- **Content**: Includes employee details, due date, and evaluation instructions
- **Action Button**: "Complete Appraisal"

#### **Training** (`TRAINING`)
- **Subject**: "Training Assignment - [Employee Name]"
- **Content**: Includes employee details, training deadline, and assignment instructions
- **Action Button**: "View Training"

#### **Deadline** (`DEADLINE`)
- **Subject**: "Deadline Reminder - [Employee Name]"
- **Content**: Includes related employee, deadline warning, and completion instructions
- **Action Button**: "View Details"

#### **Escalation** (`ESCALATION`)
- **Subject**: "🚨 Escalation Required - [Employee Name]"
- **Content**: Includes employee details, response deadline, and urgency notice
- **Action Button**: "Respond Now"

#### **Approval** (`APPROVAL`)
- **Subject**: "Approval Required - [Employee Name]"
- **Content**: Includes employee details, approval deadline, and review instructions
- **Action Button**: "Review & Approve"

#### **Generic Notifications** (All other types)
- **Subject**: Uses notification title
- **Content**: Includes message, related employee (if applicable), and deadline
- **Action Button**: "View Notification"

### 3. Email Features

- ✅ **Automatic Email Sending**: Emails are sent automatically when notifications are created
- ✅ **Employee Context**: Emails include relevant employee information
- ✅ **Deadline Information**: Formatted deadline dates included in emails
- ✅ **Priority Indicators**: High/Critical priority notifications are clearly marked
- ✅ **Action Links**: Direct links to relevant pages in the system
- ✅ **Graceful Failure**: Email failures don't break notification creation

## 📧 How It Works

### Notification Creation Flow

1. **Notification Created**: When `NotificationService.createNotification()` is called
2. **Recipient Lookup**: System fetches recipient user details (email, name)
3. **Employee Context**: If notification is related to an employee, fetches employee details
4. **Email Generation**: Creates formatted email based on notification type
5. **Email Sending**: Sends email via SMTP (if configured)
6. **Error Handling**: Logs errors but doesn't fail notification creation

### Email Content Structure

Each email includes:
- **Subject Line**: Type-specific subject with employee name
- **Greeting**: Personalized with recipient's first name
- **Message**: Original notification message
- **Context**: Employee details (if applicable)
- **Deadline**: Formatted deadline date (if applicable)
- **Priority**: Priority indicator for high/critical notifications
- **Action Button**: Direct link to relevant page
- **Footer**: Standard SIRTIS footer

## 🔧 Integration Points

### Automatic Email Sending

Emails are automatically sent when notifications are created through:

1. **NotificationService.createNotification()**
   - Used by routing rules
   - Used by default notification creation
   - Used by manual notification creation

2. **NotificationService.routeNotification()**
   - Creates multiple notifications based on routing rules
   - Each notification triggers an email

3. **API Endpoint: `/api/hr/notifications` (POST)**
   - Now uses `NotificationService.createNotification()`
   - Automatically sends emails when notifications are created

### Manual Notification Creation

When creating notifications manually via the API:

```typescript
import { NotificationService } from '@/lib/services/notificationService'

const notification = await NotificationService.createNotification({
  title: "Performance Plan Required",
  message: "A performance plan needs to be created...",
  type: "PERFORMANCE_PLAN",
  priority: "normal",
  recipientId: userId,
  employeeId: employeeId,
  senderId: "system",
  deadline: new Date(),
  actionUrl: "/hr/performance/plans/123"
})
// Email is automatically sent to recipient
```

## 📋 Notification Types Supported

| Type | Email Subject | Action Button |
|------|--------------|---------------|
| `PERFORMANCE_PLAN` | Performance Plan Required - [Name] | View Performance Plan |
| `APPRAISAL` | Performance Appraisal Due - [Name] | Complete Appraisal |
| `TRAINING` | Training Assignment - [Name] | View Training |
| `DEADLINE` | Deadline Reminder - [Name] | View Details |
| `ESCALATION` | 🚨 Escalation Required - [Name] | Respond Now |
| `APPROVAL` | Approval Required - [Name] | Review & Approve |
| `INFO` | [Title] | View Notification |
| `WARNING` | [Title] | View Notification |
| `ERROR` | [Title] | View Notification |

## 🎯 Use Cases

### Performance Management
- **Performance Plans**: Supervisors receive emails when plans need to be created
- **Appraisals**: Employees and supervisors receive emails when appraisals are due
- **Reviews**: Notification emails for performance review deadlines

### Training Management
- **Assignments**: Employees receive emails when training is assigned
- **Deadlines**: Reminder emails for training completion deadlines

### General Notifications
- **Deadlines**: Reminder emails for important deadlines
- **Escalations**: Urgent emails for escalated issues
- **Approvals**: Request emails for items requiring approval

## ⚙️ Configuration

### Environment Variables Required

```bash
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USERNAME=sirtis@saywhat.org.zw
SMTP_PASSWORD=your_password
EMAIL_FROM="SIRTIS Notifications <sirtis@saywhat.org.zw>"
NEXTAUTH_URL=https://your-domain.com
```

See `EMAIL_CONFIGURATION.md` for detailed setup instructions.

## 🔍 Testing

### Test Email Notifications

1. **Create a Performance Plan Notification**:
   ```typescript
   await NotificationService.createNotification({
     title: "Performance Plan Required",
     message: "A performance plan needs to be created...",
     type: "PERFORMANCE_PLAN",
     recipientId: supervisorUserId,
     employeeId: employeeId,
     senderId: "system"
   })
   ```

2. **Create an Appraisal Notification**:
   ```typescript
   await NotificationService.createNotification({
     title: "Performance Appraisal Due",
     message: "Performance appraisal is due...",
     type: "APPRAISAL",
     recipientId: employeeUserId,
     employeeId: employeeId,
     senderId: "system"
   })
   ```

3. **Check Email Delivery**:
   - Verify email appears in recipient's inbox
   - Check email formatting and links
   - Verify action button works correctly

## 📝 Notes

- **Email Failures**: If email sending fails, the notification is still created successfully. Errors are logged but don't break the notification flow.
- **Recipient Email**: Emails are only sent if the recipient user has an email address in the database.
- **Employee Context**: Employee information is included in emails when `employeeId` is provided.
- **Deadlines**: Deadline dates are formatted in a readable format (e.g., "January 15, 2025").
- **Priority**: High and critical priority notifications include priority indicators in the email.

## 🚀 Next Steps

1. ✅ Configure SMTP settings (see `EMAIL_CONFIGURATION.md`)
2. ✅ Test email delivery for each notification type
3. ✅ Verify email formatting and links
4. ✅ Monitor email sending logs
5. ✅ Set up email delivery monitoring/alerts if needed

## 📚 Related Documentation

- `EMAIL_CONFIGURATION.md` - Email service setup guide
- `EMAIL_SETUP_SUMMARY.md` - Quick reference for email setup
- `src/lib/email-service.ts` - Email service implementation
- `src/lib/services/notificationService.ts` - Notification service with email integration

---

**Status**: ✅ Email notifications are now fully integrated and will be sent automatically when notifications are created.

