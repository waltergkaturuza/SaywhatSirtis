# 🚀 SIRTIS Supabase PostgreSQL Setup Guide

## Current Status: ⚠️ NETWORK CONNECTIVITY ISSUE

We've successfully created all the necessary files for Supabase deployment, but there's currently a network connectivity issue with the provided Supabase project.

## ✅ What We've Accomplished

### 1. **Complete Supabase Schema Ready**
- **File**: `prisma/schema-supabase.prisma`
- **Status**: ✅ Complete PostgreSQL schema with all SIRTIS models
- **Features**: All enums, relationships, indexes, and constraints defined

### 2. **Automated Deployment Scripts**
- **Unix**: `scripts/deploy-supabase.sh`
- **Windows**: `scripts/deploy-supabase.ps1`
- **Status**: ✅ Ready for deployment with error handling

### 5. **NPM Scripts Integration**
- **Package.json**: Updated with Supabase commands
- **Status**: ✅ `npm run supabase:*` commands available

## 🔧 Environment Variables Configured

```bash
# Your current .env.local has:
DATABASE_URL="postgres://postgres.yuwwqupyqpmkbqzvqiee:8FNI4OdtFINUw2GL@db.yuwwqupyqpmkbqzvqiee.supabase.co:5432/postgres?sslmode=require"
SUPABASE_URL="https://yuwwqupyqpmkbqzvqiee.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## ⚠️ Current Issue: Network Connectivity

### Problem
```
❌ Connection failed: Can't reach database server at db.yuwwqupyqpmkbqzvqiee.supabase.co:5432
❌ Name resolution of db.yuwwqupyqpmkbqzvqiee.supabase.co failed
```

### Possible Causes
1. **Supabase Project Paused**: Free tier projects pause after inactivity
2. **Incorrect Project ID**: The project ID `yuwwqupyqpmkbqzvqiee` might be incorrect
3. **Region Issues**: Database might be in different region
4. **Network/Firewall**: Local network blocking Supabase connections

## 🛠️ Troubleshooting Steps

### Step 1: Verify Supabase Project Status
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Check if project `yuwwqupyqpmkbqzvqiee` exists and is active
3. If paused, click "Resume" to restart the project
4. Verify the connection strings in Settings → Database

### Step 2: Get Fresh Connection Strings
If project exists but connection fails:
```bash
# Go to Supabase Dashboard → Settings → Database
# Copy the new connection strings:
# - URI (for DATABASE_URL)
# - Connection Pooling URI (for production)
```

### Step 3: Test New Connection
Replace the URLs in `.env.local` and test:
```bash
node test-supabase-connection.js
```

### Step 4: Deploy Schema (Once Connected)
```bash
# Deploy database schema
npm run supabase:push

# Run migrations
npm run supabase:migrate

# Seed database
npm run supabase:seed
```

## 🚀 Quick Deploy Commands (When Connection Works)

```bash
# Complete Supabase setup in one command
npm run supabase:deploy-all

# Or step by step:
npm run supabase:generate  # Generate Prisma client
npm run supabase:push      # Push schema to database
npm run supabase:seed      # Seed with sample data
```
- **File**: `.github/workflows/supabase-deploy.yml`
- **Status**: ✅ Automatic deployment on git push to main branch
- **Features**: Test → Deploy → Notify workflow

### 4. **Seeding System**
- **File**: `prisma/seed-supabase.ts`
- **Status**: ✅ Complete seed data for all modules
- **Features**: Sample users, projects, employees, assets, documents

### 5. **NPM Scripts Integration**
- **Package.json**: Updated with Supabase commands
- **Status**: ✅ `npm run supabase:*` commands available
4. Notify deployment status

## 📋 Prerequisites

### 1. Supabase Project Setup
1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Note down your project details:
   - Project ID
   - Database URL
   - Direct URL (for connection pooling bypass)
   - Service Role Key

### 2. GitHub Repository Secrets
Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

```
SUPABASE_ACCESS_TOKEN=your_supabase_access_token
SUPABASE_PROJECT_ID=your_project_id
SUPABASE_DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
SUPABASE_DIRECT_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
```

### 3. Supabase Access Token
1. Go to https://supabase.com/dashboard/account/tokens
2. Generate a new access token
3. Add it as `SUPABASE_ACCESS_TOKEN` in GitHub secrets

## 🔧 Configuration Files

### Database Schema
- **Development**: `prisma/schema.prisma` (SQLite)
- **Supabase**: `prisma/schema-supabase.prisma` (PostgreSQL)

### Deployment Scripts
- **Unix/Linux**: `scripts/deploy-supabase.sh`
- **Windows**: `scripts/deploy-supabase.ps1`

### GitHub Actions
- **Workflow**: `.github/workflows/supabase-deploy.yml`

## 🎯 How It Works

### Automatic Deployment Trigger
```yaml
on:
  push:
    branches: [ main ]
    paths:
      - 'prisma/**'
      - 'src/**'
```

### Deployment Process
1. **Test Phase**:
   - Runs linting
   - Type checking
   - Build verification

2. **Deploy Phase** (only on main branch):
   - Switches to PostgreSQL schema
   - Generates Prisma client
   - Deploys migrations
   - Seeds database
   - Deploys Supabase functions (if any)

3. **Notification Phase**:
   - Reports deployment status
   - Provides deployment URLs

## 🛠️ Manual Deployment

### Using NPM Scripts
```bash
# Deploy to Supabase (Unix/Linux)
npm run supabase:deploy

# Deploy to Supabase (Windows)
npm run supabase:deploy-windows

# Just switch schema
npm run supabase:schema

# Setup database only
npm run supabase:db-setup
```

### Using Scripts Directly
```bash
# Unix/Linux
chmod +x scripts/deploy-supabase.sh
./scripts/deploy-supabase.sh

# Windows PowerShell
.\scripts\deploy-supabase.ps1
```

## 🌐 Environment Variables

### Required for Deployment
```env
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
```

### Optional for Enhanced Features
```env
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📊 Database Features

### Optimized for Supabase
- **Connection Pooling**: Direct URL for migrations
- **RLS Ready**: Row Level Security compatible
- **Indexes**: Optimized for performance
- **JSON Storage**: Complex data in JSONB columns

### Supported Modules
- ✅ User Management & Authentication
- ✅ Programs & Project Management
- ✅ Call Centre Records
- ✅ HR Management
- ✅ Inventory & Asset Tracking
- ✅ Document Management
- ✅ Events & Registration
- ✅ Audit Logging
- ✅ System Configuration

## 🔍 Monitoring & Debugging

### GitHub Actions Logs
1. Go to your repository
2. Click "Actions" tab
3. Select "Deploy SIRTIS to Supabase" workflow
4. View deployment logs

### Supabase Dashboard
1. Monitor database activity
2. Check migration status
3. View real-time logs

### Local Testing
```bash
# Test migration locally
npm run supabase:schema
npx prisma migrate dev
npx prisma db seed
```

## 🚨 Troubleshooting

### Common Issues

1. **Migration Failures**
   - Check database connection
   - Verify environment variables
   - Check for conflicting schema changes

2. **Schema Conflicts**
   - Ensure Supabase schema is up to date
   - Run `prisma migrate reset` if needed
   - Check for manual database changes

3. **Authentication Errors**
   - Verify Supabase access token
   - Check project ID is correct
   - Ensure database URLs are valid

### Recovery Steps
```bash
# Reset local schema
git checkout prisma/schema.prisma

# Force deploy
gh workflow run supabase-deploy.yml

# Check deployment status
supabase projects list
```

## 📈 Next Steps

1. **Set up Row Level Security (RLS)**
2. **Configure Supabase Auth integration**
3. **Add real-time subscriptions**
4. **Set up Edge Functions**
5. **Configure automated backups**

## 🔗 Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [Prisma with Supabase](https://supabase.com/docs/guides/integrations/prisma)
- [GitHub Actions for Supabase](https://github.com/supabase/setup-cli)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
