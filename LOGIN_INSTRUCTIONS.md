# SIRTIS Authentication Instructions

## Current Issue
When trying to create a project, you're getting a 500 error because the user is not authenticated.

## Solution
You need to log in to the system first before you can create projects or access protected features.

## How to Log In

1. **Go to the Sign In Page**
   - Visit: `http://localhost:3000/auth/signin` (or your deployed URL + `/auth/signin`)

2. **Use Default Admin Credentials**
   - Email: `admin@saywhat.org`
   - Password: `admin123`

3. **After Login**
   - You'll be redirected to the dashboard
   - You can now create projects and access all features

## Default User Accounts
The system currently has these development users:

### Admin User
- **Email**: `admin@saywhat.org`
- **Password**: `admin123`
- **Role**: System Administrator
- **Permissions**: Full access to all modules

### HR Manager
- **Email**: `hr@saywhat.org`
- **Password**: `hr123`
- **Role**: HR Manager
- **Permissions**: Full HR access, basic programs access

### Program Manager
- **Email**: `programs@saywhat.org`
- **Password**: `programs123`
- **Role**: Program Manager
- **Permissions**: Full programs access, basic HR access

### Call Centre Supervisor
- **Email**: `callcentre@saywhat.org`
- **Password**: `callcentre123`
- **Role**: Call Centre Supervisor
- **Permissions**: Full call centre access

## Security Note
⚠️ **Important**: These are development credentials. In production, these should be changed and proper user management should be implemented.

## Next Steps
1. Log in using the admin credentials
2. Try creating a project again
3. The project creation should now work successfully

---
*Last Updated: July 18, 2025*
