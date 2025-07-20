# SIRTIS Vercel Database Configuration Guide

This guide helps you configure the database for your SIRTIS application on Vercel.

## Database Options for Vercel

### Option 1: Vercel Postgres (Recommended)
Vercel provides a built-in PostgreSQL database service that integrates seamlessly with your deployment.

#### Setup Steps:
1. Go to your Vercel dashboard
2. Navigate to your SIRTIS project
3. Go to the "Storage" tab
4. Click "Create Database"
5. Select "Postgres"
6. Choose your plan (Hobby is free for development)
7. Click "Create"

#### Environment Variables:
Once created, Vercel will automatically add these environment variables:
```
POSTGRES_URL
POSTGRES_PRISMA_URL
POSTGRES_URL_NON_POOLING
POSTGRES_USER
POSTGRES_HOST
POSTGRES_PASSWORD
POSTGRES_DATABASE
```

You only need to set:
```
DATABASE_URL=$POSTGRES_PRISMA_URL
```

### Option 2: External PostgreSQL Database

#### Popular Providers:
- **Neon** (Free tier available): https://neon.tech
- **Supabase** (Free tier available): https://supabase.com
- **PlanetScale** (MySQL): https://planetscale.com
- **Railway**: https://railway.app
- **Render**: https://render.com

#### Setup for External Database:
1. Create a database with your chosen provider
2. Get the connection string
3. Add it to Vercel environment variables

## Vercel Environment Variables Setup

### Required Variables:
```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# NextAuth.js (Authentication)
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="your-secret-key-here"

# Optional: OpenAI (for chatbot)
OPENAI_API_KEY="your-openai-api-key"

# Optional: Email (for notifications)
EMAIL_SERVER_HOST="smtp.office365.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@domain.com"
EMAIL_SERVER_PASSWORD="your-email-password"
EMAIL_FROM="noreply@yourdomain.com"
```

### Setting Environment Variables in Vercel:
1. Go to your Vercel project dashboard
2. Navigate to "Settings" → "Environment Variables"
3. Add each variable:
   - Name: `DATABASE_URL`
   - Value: Your database connection string
   - Environment: Production (and Preview if needed)

## Database Migration and Seeding

### Automatic Setup (Recommended):
The application is configured to automatically:
1. Generate Prisma client during build
2. Run migrations on deployment
3. Seed the database with initial data

### Manual Setup:
If you need to manually run database operations:

1. **Run Migrations:**
   ```bash
   vercel env pull .env.local
   npx prisma migrate deploy
   ```

2. **Seed Database:**
   ```bash
   npx prisma db seed
   ```

## Database Schema

The application uses a PostgreSQL-optimized schema (`prisma/schema-vercel.prisma`) for production that includes:

- **User Management**: Authentication, roles, permissions
- **Project Management**: Projects, activities, reports
- **Call Centre**: Call records, follow-ups, attachments
- **HR Management**: Employees, leave, performance, payroll
- **Inventory**: Assets, maintenance, audits
- **Document Management**: File storage and categorization

## Testing the Database Connection

After setup, test your database connection:

1. **Via Vercel Dashboard:**
   - Go to "Functions" → "View Function Logs"
   - Deploy and check for database connection errors

2. **Via API Route:**
   - Visit: `https://your-app.vercel.app/api/admin/database`
   - Should return database status information

## Troubleshooting

### Common Issues:

1. **Connection String Format:**
   ```bash
   # Correct format for PostgreSQL
   DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
   ```

2. **SSL Requirements:**
   Most cloud databases require SSL. Ensure your connection string includes `?sslmode=require`

3. **Connection Pooling:**
   For production, use connection pooling URLs when available

4. **Migration Errors:**
   - Ensure your database is empty for first migration
   - Use `npx prisma migrate reset` for development databases

### Environment-Specific Configuration:

The application automatically detects the environment:
- **Vercel**: Uses PostgreSQL schema and runs migrations
- **Local**: Uses SQLite for development

## Security Best Practices

1. **Environment Variables:**
   - Never commit `.env` files to git
   - Use strong, unique passwords
   - Rotate secrets regularly

2. **Database Access:**
   - Use least-privilege database users
   - Enable SSL/TLS encryption
   - Regularly backup your data

3. **Monitoring:**
   - Monitor database performance
   - Set up alerts for connection issues
   - Track query performance

## Production Checklist

Before going live:

- [ ] Database created and accessible
- [ ] All environment variables set
- [ ] Migrations run successfully
- [ ] Database seeded with initial data
- [ ] SSL/TLS enabled
- [ ] Backups configured
- [ ] Monitoring set up
- [ ] Connection limits appropriate for your plan

## Getting Help

If you encounter issues:

1. Check Vercel function logs
2. Verify environment variables
3. Test database connection locally
4. Check provider documentation
5. Contact support if needed

---

**Note**: This configuration provides a production-ready PostgreSQL setup optimized for the SIRTIS application on Vercel.
