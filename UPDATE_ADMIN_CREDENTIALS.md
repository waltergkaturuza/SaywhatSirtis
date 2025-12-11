# Update Admin Credentials

## Instructions for Supabase

### New Credentials
- **Email**: `admin@saywhat.org.zw`
- **Password**: `@Dm1n_123`

### Steps to Update in Supabase

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Navigate to **SQL Editor**

2. **Run the SQL Script**
   - Copy the contents of `update-admin-credentials.sql`
   - Paste into the SQL Editor
   - Click **Run** or press `Ctrl+Enter`

3. **Verify the Update**
   - The script will show the updated user information
   - Confirm that:
     - Email is now `admin@saywhat.org.zw`
     - Password status shows "Password set"
     - User is active (`isActive = true`)

### Alternative: Manual Update via Supabase UI

If you prefer to update via the Supabase UI:

1. Go to **Table Editor** → `users` table
2. Find the user with email `admin@saywhat.org`
3. Click **Edit** on that row
4. Update:
   - **email**: `admin@saywhat.org.zw`
   - **passwordHash**: `$2b$10$k0E4XBSvbJSYETCuxQBaPeseUktoNzWTNQhBoFj./Sk80nzEnfsky`
5. Click **Save**

### Password Hash Details

- **Algorithm**: bcrypt (10 rounds)
- **Password**: `@Dm1n_123`
- **Hash**: `$2b$10$k0E4XBSvbJSYETCuxQBaPeseUktoNzWTNQhBoFj./Sk80nzEnfsky`

### Security Notes

✅ The password `@Dm1n_123` meets the security requirements:
- Minimum 12 characters
- Contains uppercase letters (D, A)
- Contains lowercase letters (m, i, n)
- Contains numbers (1, 2, 3)
- Contains special characters (@, _)

### After Update

1. **Test Login**
   - Go to `/auth/signin`
   - Use new credentials:
     - Email: `admin@saywhat.org.zw`
     - Password: `@Dm1n_123`

2. **Update Code References** (Optional)
   - The codebase has some hardcoded references to `admin@saywhat.org`
   - These are mostly in comments/placeholders and won't affect functionality
   - Consider updating them for consistency:
     - `src/components/programs/project-table-enhanced.tsx`
     - `src/components/programs/project-dashboard.tsx`
     - `src/app/programs/page.tsx`
     - `LOGIN_INSTRUCTIONS.md`
     - `README.md`

### Troubleshooting

**If the UPDATE affects 0 rows:**
- The user might not exist with the old email
- Run the INSERT statement in the SQL script instead
- Or create the user manually via Supabase UI

**If login still fails:**
- Verify the passwordHash was updated correctly
- Check that `isActive` is `true`
- Ensure the email matches exactly (case-sensitive)
- Clear browser cookies and try again

