# RENDER DEPLOYMENT TROUBLESHOOTING GUIDE

## Summary of Changes Made

### 1. Fixed Port Binding Issue (502 Bad Gateway)
**Problem**: Next.js was binding to localhost (127.0.0.1) instead of 0.0.0.0
**Solution**: Updated start command to bind to all interfaces

```json
// Before
"render:start": "next start -p $PORT"

// After  
"render:start": "next start -H 0.0.0.0 -p ${PORT:-10000}"
```

### 2. Updated render.yaml Configuration
**Problem**: Build and start commands weren't optimized for production
**Solution**: Updated to use direct commands instead of npm scripts

```yaml
# Before
buildCommand: npm run render:build
startCommand: npm run render:start

# After
buildCommand: npm ci --legacy-peer-deps && npx prisma generate && NODE_ENV=production npm run build
startCommand: next start -H 0.0.0.0 -p $PORT
```

### 3. Enhanced Build Process
**Problem**: Build wasn't explicitly setting production environment
**Solution**: Added NODE_ENV=production to build commands

```json
"build": "npx prisma generate && NODE_ENV=production next build"
"render:build": "npm ci --legacy-peer-deps && npx prisma generate && NODE_ENV=production npm run build"
```

## Deployment Checklist

### Before Deploying
- [ ] Verify all environment variables are set in Render Dashboard
- [ ] Ensure database URL includes `?sslmode=require`
- [ ] Confirm NEXTAUTH_URL matches your Render app URL
- [ ] Check that NEXTAUTH_SECRET is set (32+ character random string)

### Required Environment Variables
```bash
NODE_ENV=production
DATABASE_URL=postgres://user:pass@host:port/db?sslmode=require
DIRECT_URL=postgres://user:pass@host:port/db?sslmode=require
NEXTAUTH_SECRET=your-32-character-secret
NEXTAUTH_URL=https://your-app.onrender.com
```

### Build Commands for Render
- **Build Command**: `npm ci --legacy-peer-deps && npx prisma generate && NODE_ENV=production npm run build`
- **Start Command**: `next start -H 0.0.0.0 -p $PORT`

### Health Check
- **Health Check Path**: `/api/health`
- Endpoint returns JSON with status information

## Common Issues and Solutions

### 502 Bad Gateway
- **Cause**: App not binding to 0.0.0.0
- **Solution**: Use `-H 0.0.0.0` flag in start command

### Build Failures
- **Cause**: Missing Prisma generation or environment variables
- **Solution**: Ensure `npx prisma generate` runs before build

### Database Connection Issues
- **Cause**: Missing SSL mode or incorrect connection string
- **Solution**: Add `?sslmode=require` to database URLs

### Authentication Issues
- **Cause**: NEXTAUTH_URL mismatch or invalid secret
- **Solution**: Verify NEXTAUTH_URL matches deployed URL

## Testing Your Deployment

1. **Health Check**: Visit `https://your-app.onrender.com/api/health`
2. **Home Page**: Visit `https://your-app.onrender.com`
3. **Login**: Test authentication flow
4. **Database**: Check if data loads correctly

## Next Steps After Deployment

1. Monitor logs in Render Dashboard
2. Test all major features
3. Set up monitoring and alerts
4. Configure custom domain if needed

## Support Resources

- [Render Documentation](https://render.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)

---

**Last Updated**: September 18, 2025
**Status**: Ready for deployment with fixes applied