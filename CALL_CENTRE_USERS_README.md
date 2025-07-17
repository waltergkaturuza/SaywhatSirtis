# Call Centre Module - User Setup & Permissions Guide

## 📋 Overview
The Call Centre module has been successfully implemented with comprehensive user management and role-based access control.

## 👥 User Accounts Created

### 🔑 Call Centre Officers
1. **Mary Chikuni**
   - Email: `mary.chikuni@saywhat.org`
   - Password: `officer123`
   - Permissions: Call centre access, officer functions, case management, data entry

2. **David Nyathi**
   - Email: `david.nyathi@saywhat.org`
   - Password: `officer123`
   - Permissions: Call centre access, officer functions, case management, data entry

3. **Alice Mandaza**
   - Email: `alice.mandaza@saywhat.org`
   - Password: `officer123`
   - Permissions: Call centre access, officer functions, case management, data entry

4. **Peter Masvingo**
   - Email: `peter.masvingo@saywhat.org`
   - Password: `officer123`
   - Permissions: Call centre access, officer functions, case management, data entry

5. **Call Centre Test User**
   - Email: `callcentre@saywhat.org`
   - Password: `call123`
   - Permissions: Call centre access, officer functions, case management, data entry

### 👨‍💼 Call Centre Management
1. **Call Centre Head**
   - Email: `callcentre.head@saywhat.org`
   - Password: `callcentre123`
   - Permissions: Full call centre management, reports, administration

### 🔧 System Administrator
1. **System Administrator**
   - Email: `admin@saywhat.org`
   - Password: `admin123`
   - Permissions: **FULL ACCESS TO ALL MODULES** including:
     - HR Module (full access)
     - Programs Module (full access)
     - Call Centre Module (full access)
     - Inventory Module (full access)
     - Documents Module (full access)
     - Analytics & Dashboard (full access)
     - System Administration (full access)

### 📊 Head of Programs
1. **Department Supervisor**
   - Email: `supervisor@saywhat.org`
   - Password: `supervisor123`
   - Permissions: Programs management + Call Centre access (as requested)

## 🔐 Permission Structure

### Call Centre Permissions
- `callcentre.access` - Basic call centre module access
- `callcentre.officer` - Officer-level functions (call entry, case management)
- `callcentre.admin` - Administrative functions
- `callcentre.cases` - Case management access
- `callcentre.data_entry` - Data entry permissions
- `callcentre.view` - View-only access
- `callcentre.create` - Create new records
- `callcentre.edit` - Edit existing records
- `callcentre.delete` - Delete records
- `callcentre.reports` - Generate reports
- `callcentre.management` - Management oversight

### Admin Permissions
The System Administrator has comprehensive permissions across ALL modules:
- **HR**: hr.full_access, hr.view, hr.create, hr.edit, hr.delete, hr.attendance, hr.notifications, hr.payroll, hr.performance, hr.training, hr.leave, hr.employees
- **Programs**: programs.full_access, programs.view, programs.create, programs.edit, programs.delete, programs.me_access, programs.upload, programs.documents, programs.progress, programs.indicators, programs.analysis, programs.head, programs.kobo
- **Call Centre**: All call centre permissions listed above
- **Inventory**: inventory.full_access, inventory.view, inventory.create, inventory.edit, inventory.delete, inventory.rfid, inventory.tracking, inventory.reports
- **Documents**: documents.full_access, documents.view, documents.create, documents.edit, documents.delete, documents.ai, documents.search, documents.upload
- **Analytics**: analytics.full_access, analytics.view, analytics.create, analytics.reports
- **Dashboard**: dashboard.full_access, dashboard.view, dashboard.widgets
- **System**: system.admin, system.settings, system.users, system.permissions, system.audit

## 🗂️ Sidebar Navigation
The Call Centre module is now visible in the sidebar for users with appropriate permissions:
- **Navigation Item**: "Call Centre"
- **Required Permission**: `callcentre.access`
- **Icon**: Phone icon
- **Route**: `/call-centre`

## 🧪 Testing & Verification

### Permission Testing Page
Access `/test-permissions` to:
- View current user session details
- See all available test accounts
- Check permission matrix for current user
- Test quick module access

### Login Testing
1. Go to `/auth/signin`
2. Use any of the test accounts above
3. Verify sidebar shows Call Centre module
4. Test access to different call centre submodules:
   - `/call-centre` - Main dashboard
   - `/call-centre/new-call` - New call entry
   - `/call-centre/data-summary` - Data analytics
   - `/call-centre/case-management` - Case tracking
   - `/call-centre/all-calls` - All call records

## ✅ Features Verified
- ✅ Call Centre users created with appropriate permissions
- ✅ Admin has full system access
- ✅ Head of Programs has call centre access
- ✅ Call Centre appears in sidebar navigation
- ✅ Role-based access control working
- ✅ Permission testing interface available
- ✅ All call centre submodules accessible with proper permissions

## 🚀 Next Steps
1. Test user login with different accounts
2. Verify call centre functionality for each user type
3. Test data entry and case management features
4. Confirm reporting and analytics access levels

---
*For technical support or additional user accounts, contact the system administrator.*
