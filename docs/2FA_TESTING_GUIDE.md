# Two-Factor Authentication (2FA) Testing Guide

This guide provides step-by-step instructions for testing the 2FA implementation end-to-end.

## Prerequisites

1. **Database Migration**: Ensure 2FA fields are added to the `users` table
   - Run the SQL script: `prisma/migrations/add_2fa_fields.sql`
   - Or use: `npx prisma db push` (if no schema conflicts)

2. **Dependencies**: Verify all packages are installed
   ```bash
   npm install otplib qrcode @types/qrcode
   ```

3. **Authenticator App**: Install a TOTP authenticator app on your mobile device:
   - Google Authenticator
   - Authy
   - Microsoft Authenticator
   - Any TOTP-compatible app

## Test Scenarios

### 1. Enable 2FA for a User

**Steps:**
1. Log in to the application with a user account
2. Navigate to **Employee Profile** → **Security Settings**
3. Click **"Enable 2FA"** button
4. A QR code should appear on the screen
5. Open your authenticator app and scan the QR code
6. The app should add a new account entry
7. Enter the 6-digit code from your authenticator app
8. Save the backup codes (copy or download)
9. Check the "I have saved my backup codes" checkbox
10. Click **"Verify & Enable 2FA"**

**Expected Results:**
- ✅ QR code displays correctly
- ✅ Authenticator app successfully adds the account
- ✅ Verification code is accepted
- ✅ Backup codes are displayed and can be copied/downloaded
- ✅ 2FA status shows as "Enabled" after successful setup
- ✅ Success message appears
- ✅ User is redirected or sees confirmation

**API Endpoints Tested:**
- `POST /api/auth/2fa/setup` - Generates secret and QR code
- `POST /api/auth/2fa/verify` - Verifies token and enables 2FA
- `GET /api/auth/2fa/status` - Checks 2FA status

---

### 2. Login with 2FA Enabled (TOTP Token)

**Steps:**
1. Ensure 2FA is enabled for your test user (from Test 1)
2. Log out of the application
3. Go to the sign-in page
4. Enter email and password
5. Click **"Sign In"**
6. After password verification, a 2FA verification screen should appear
7. Open your authenticator app
8. Enter the current 6-digit code
9. Click **"Verify"**

**Expected Results:**
- ✅ After password verification, 2FA screen appears
- ✅ Code input field accepts 6 digits
- ✅ Valid code from authenticator app is accepted
- ✅ User is successfully logged in
- ✅ User is redirected to dashboard/home

**Error Cases to Test:**
- ❌ Invalid code (wrong digits) → Error message shown
- ❌ Expired code (code from 30+ seconds ago) → Error message shown
- ❌ Empty code → Button disabled or error shown

---

### 3. Login with 2FA Enabled (Backup Code)

**Steps:**
1. Ensure 2FA is enabled and you have backup codes saved
2. Log out of the application
3. Go to the sign-in page
4. Enter email and password
5. Click **"Sign In"**
6. After password verification, 2FA verification screen appears
7. Click **"Use backup code instead"**
8. Enter one of your saved backup codes
9. Click **"Verify"**

**Expected Results:**
- ✅ Toggle between authenticator and backup code works
- ✅ Backup code input accepts the code
- ✅ Valid backup code is accepted
- ✅ User is successfully logged in
- ✅ Used backup code is consumed (cannot be reused)

**Error Cases to Test:**
- ❌ Invalid backup code → Error message shown
- ❌ Already used backup code → Error message shown
- ❌ Empty backup code → Button disabled or error shown

---

### 4. Login without 2FA Enabled

**Steps:**
1. Use a user account that does NOT have 2FA enabled
2. Go to the sign-in page
3. Enter email and password
4. Click **"Sign In"**

**Expected Results:**
- ✅ User logs in immediately after password verification
- ✅ No 2FA verification screen appears
- ✅ User is redirected to dashboard/home

---

### 5. Disable 2FA (Future Feature)

**Note**: Currently, disabling 2FA requires administrator intervention. This test is for when the feature is implemented.

**Steps:**
1. Log in with a user that has 2FA enabled
2. Navigate to **Employee Profile** → **Security Settings**
3. Click **"Disable 2FA"** (or similar button)
4. Confirm the action
5. Verify 2FA is disabled

**Expected Results:**
- ✅ 2FA can be disabled
- ✅ Status updates to "Disabled"
- ✅ User can log in without 2FA after disabling

---

### 6. Check 2FA Status API

**Steps:**
1. Log in to the application
2. Open browser developer tools (F12)
3. Go to **Network** tab
4. Navigate to profile page
5. Look for request to `/api/auth/2fa/status`

**Expected Results:**
- ✅ API returns `{ success: true, twoFactorEnabled: true/false }`
- ✅ Status matches the actual 2FA state

---

### 7. Error Handling Tests

**Test Invalid Setup:**
1. Try to enable 2FA without scanning QR code
2. Enter invalid verification code
3. Try to verify without saving backup codes

**Expected Results:**
- ✅ Appropriate error messages are shown
- ✅ User cannot enable 2FA with invalid data
- ✅ Form validation prevents submission

**Test Invalid Login:**
1. Try to log in with 2FA enabled
2. Enter wrong verification code multiple times
3. Check if account gets locked (brute force protection)

**Expected Results:**
- ✅ Invalid codes are rejected
- ✅ Error messages are clear
- ✅ Account lockout works after multiple failures (if implemented)

---

## Manual API Testing

### Test Setup Endpoint

```bash
# Get session token first (from browser cookies or login)
curl -X POST http://localhost:3000/api/auth/2fa/setup \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "qrCodeDataURL": "data:image/png;base64,...",
  "secret": "JBSWY3DPEHPK3PXP",
  "message": "2FA setup initiated. Scan QR code or enter secret."
}
```

### Test Verify Endpoint

```bash
curl -X POST http://localhost:3000/api/auth/2fa/verify \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "123456",
    "secret": "JBSWY3DPEHPK3PXP"
  }'
```

**Expected Response (Success):**
```json
{
  "success": true,
  "message": "2FA enabled successfully!",
  "backupCodes": ["ABC12345", "DEF67890", ...]
}
```

**Expected Response (Failure):**
```json
{
  "success": false,
  "error": "Invalid 2FA token",
  "code": "TWO_FACTOR_INVALID"
}
```

### Test Status Endpoint

```bash
curl -X GET http://localhost:3000/api/auth/2fa/status \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "twoFactorEnabled": true
}
```

---

## Database Verification

### Check 2FA Fields in Database

```sql
-- Check if fields exist
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'users' 
  AND column_name IN ('twoFactorSecret', 'twoFactorBackupCodes', 'twoFactorEnabled');

-- Check user's 2FA status
SELECT 
  id,
  email,
  "twoFactorEnabled",
  CASE 
    WHEN "twoFactorSecret" IS NOT NULL THEN 'Secret exists'
    ELSE 'No secret'
  END as secret_status,
  array_length("twoFactorBackupCodes", 1) as backup_codes_count
FROM users
WHERE email = 'test@example.com';
```

---

## Troubleshooting

### Issue: QR Code Not Displaying
- **Check**: Browser console for errors
- **Check**: API response from `/api/auth/2fa/setup`
- **Fix**: Ensure `qrcode` package is installed correctly

### Issue: Verification Code Always Fails
- **Check**: Time sync between server and device
- **Check**: Secret is correctly stored in database
- **Fix**: Ensure device time is accurate (TOTP is time-based)

### Issue: Backup Codes Not Working
- **Check**: Codes are hashed correctly in database
- **Check**: Code format matches (uppercase, length)
- **Fix**: Verify backup code verification logic

### Issue: 2FA Not Required During Login
- **Check**: `twoFactorEnabled` is `true` in database
- **Check**: Auth flow checks 2FA status
- **Fix**: Verify `src/lib/auth.ts` integration

---

## Test Checklist

- [ ] Enable 2FA for a user
- [ ] Login with TOTP token (authenticator app)
- [ ] Login with backup code
- [ ] Login without 2FA (user without 2FA enabled)
- [ ] Test invalid verification codes
- [ ] Test expired codes
- [ ] Test used backup codes
- [ ] Verify backup codes are consumed after use
- [ ] Check 2FA status API
- [ ] Test error handling
- [ ] Verify audit logging (check logs for 2FA events)
- [ ] Test on different browsers
- [ ] Test on mobile devices

---

## Security Considerations

1. **Backup Codes**: Ensure backup codes are hashed before storage
2. **Secret Storage**: Verify secrets are stored securely (not in plain text logs)
3. **Rate Limiting**: Check if brute force protection works for 2FA codes
4. **Audit Logging**: Verify all 2FA events are logged
5. **Session Management**: Ensure 2FA verification happens before session creation

---

## Notes

- TOTP codes are valid for 30 seconds (configurable in `src/lib/two-factor-auth.ts`)
- Backup codes are single-use and consumed after verification
- 2FA can only be enabled by the user themselves (or admin, if implemented)
- All 2FA events are logged for security auditing

