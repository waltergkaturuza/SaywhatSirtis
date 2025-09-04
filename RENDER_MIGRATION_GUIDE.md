# 🚀 Vercel to Render Migration Guide

## Overview
This guide helps you migrate your SAYWHAT SIRTIS application from Vercel to Render due to service reliability issues.

## ⚠️ Migration Checklist

### 1. Pre-Migration Preparation

- [ ] **Backup current data** from Supabase database
- [ ] **Document all environment variables** from Vercel dashboard
- [ ] **Test application locally** with current configuration
- [ ] **Create Render account** at https://render.com

### 2. Environment Variables Migration

Copy these variables from Vercel to Render:

```bash
# Database Configuration
DATABASE_URL=your_supabase_connection_string
DIRECT_URL=your_supabase_direct_connection_string

# Supabase Configuration  
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret

# Public Environment Variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# NextAuth Configuration
NEXTAUTH_URL=https://your-render-app.onrender.com
NEXTAUTH_SECRET=your_nextauth_secret

# Production Settings
NODE_ENV=production
```

### 3. Render Deployment Steps

#### Step 1: Connect Repository
1. Go to https://render.com/dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `waltergkaturuza/SaywhatSirtis`
4. Select the `main` branch

#### Step 2: Configure Build Settings
```yaml
Name: saywhat-sirtis
Runtime: Node
Region: Oregon (or closest to your users)
Branch: main
Build Command: npm run render:build
Start Command: npm run render:start
Health Check Path: /api/test/hello
```

#### Step 3: Add Environment Variables
Copy all environment variables from your current Vercel deployment.

**Critical Variables:**
- `DATABASE_URL` - Your Supabase PostgreSQL connection string
- `NEXTAUTH_URL` - Update to your new Render URL
- `NEXTAUTH_SECRET` - Keep the same value for session continuity
- All Supabase configuration variables

#### Step 4: Deploy
1. Click "Create Web Service"
2. Wait for the build to complete (5-10 minutes)
3. Test the deployment at your new Render URL

### 4. DNS and Domain Migration

#### Option A: Update DNS Records
If you have a custom domain:
1. Update your DNS A record to point to Render's IP
2. Add CNAME record for www subdomain
3. Configure custom domain in Render dashboard

#### Option B: Use Render Subdomain
Your app will be available at: `https://saywhat-sirtis.onrender.com`

### 5. Database Considerations

✅ **Good News**: Your Supabase database doesn't need migration since it's independent of the hosting platform.

**Steps:**
1. Keep existing Supabase project
2. Update `NEXTAUTH_URL` in Supabase Auth settings
3. Update CORS settings if needed
4. Test database connectivity from Render

### 6. Post-Migration Tasks

- [ ] **Update NEXTAUTH_URL** in all environment variables
- [ ] **Test all authentication flows**
- [ ] **Verify admin dashboard** displays real metrics
- [ ] **Test file uploads** and document management
- [ ] **Check API endpoints** functionality
- [ ] **Monitor application performance**
- [ ] **Update any external integrations** with new URL

### 7. Performance Comparison

| Feature | Vercel | Render |
|---------|--------|--------|
| Build Time | ~2-3 min | ~3-5 min |
| Cold Start | ~100-200ms | ~200-500ms |
| Uptime | 99.9% (recent issues) | 99.9% |
| Free Tier | 100GB bandwidth | 750 hours/month |
| Custom Domains | ✅ | ✅ |
| Auto-scaling | ✅ | ✅ |

### 8. Rollback Plan

If needed, you can quickly rollback to Vercel:
1. Keep Vercel deployment active during testing
2. Switch DNS back to Vercel
3. Update `NEXTAUTH_URL` back to Vercel URL

## 🔧 Troubleshooting

### Common Issues:

**Build Failures:**
- Check Node.js version (use Node 18+)
- Verify all environment variables are set
- Check for missing dependencies
- **CRITICAL**: Ensure CSS build tools (`tailwindcss`, `postcss`, `autoprefixer`) are in `dependencies`, not `devDependencies` - Render production builds don't install devDependencies by default
- **Tailwind CSS Version**: Use Tailwind CSS v3.x for traditional PostCSS configuration. Tailwind v4+ requires `@tailwindcss/postcss` plugin with different setup

**Database Connection Issues:**
- Verify `DATABASE_URL` format
- Check Supabase project status
- Confirm IP allowlisting if required

**Authentication Problems:**
- Update `NEXTAUTH_URL` to new Render domain
- Clear browser cookies/sessions
- Verify callback URLs in NextAuth config

### Support Resources:
- Render Documentation: https://render.com/docs
- Render Community: https://community.render.com
- Supabase Status: https://status.supabase.com

## 📈 Benefits of Migration

1. **Better Reliability**: Avoid current Vercel service issues
2. **Consistent Performance**: Render's infrastructure stability
3. **Cost Effective**: Render's pricing model
4. **Easy Monitoring**: Built-in metrics and logging
5. **Database Independence**: Supabase continues to work seamlessly

## 🎯 Success Metrics

After migration, monitor:
- Application uptime (target: >99.9%)
- Response times (target: <500ms average)
- Error rates (target: <1%)
- User authentication success rate (target: >99%)

---

Need help? The migration preserves all your data and configurations while moving to a more reliable hosting platform.
