# 🚀 Quick Production Deployment Guide

## 🎯 **Option A: Deploy to Vercel (Fastest - Recommended First)**

### 1. **Setup Vercel Postgres**
```bash
# Install Vercel CLI
npm i -g vercel

# Link your project
cd /path/to/SaywhatSirtis
vercel link

# Login to Vercel dashboard and add Postgres integration
# https://vercel.com/dashboard → Your Project → Storage → Add → Postgres
```

### 2. **Update Database Configuration**
```bash
# Copy and update schema for production
cp prisma/schema-production.prisma prisma/schema.prisma

# Update datasource in schema.prisma:
datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING")
}
```

### 3. **Configure Environment Variables in Vercel**
```bash
# In Vercel Dashboard → Settings → Environment Variables, add:
NEXTAUTH_SECRET=your-super-secure-32-character-secret
NEXTAUTH_URL=https://your-app.vercel.app
OPENAI_API_KEY=your-openai-key
EMAIL_SERVER_PASSWORD=your-email-password
```

### 4. **Deploy**
```bash
# Generate Prisma client for PostgreSQL
npx prisma generate

# Deploy to production
vercel --prod

# Run database migrations
npx prisma db push
```

---

## 🏗️ **Option B: Deploy to AWS (Enterprise Scale)**

### 1. **Deploy Infrastructure**
```bash
# Navigate to terraform directory
cd terraform

# Initialize Terraform
terraform init

# Plan deployment
terraform plan

# Deploy infrastructure
terraform apply
```

### 2. **Configure Database Connection**
```bash
# Get RDS endpoint from AWS Console or Terraform output
# Update .env.production:
DATABASE_URL="postgresql://sirtis_admin:PASSWORD@sirtis-database.eu-west-1.rds.amazonaws.com:5432/sirtis_production"
```

### 3. **Deploy Application**
```bash
# Build Docker image
docker build -t sirtis:production .

# Push to ECR (configured in terraform)
# Deploy to ECS (configured in terraform)
```

---

## 🔄 **Database Migration Commands**

### **From SQLite to PostgreSQL:**
```bash
# 1. Backup current SQLite data
npx prisma db seed

# 2. Update schema for PostgreSQL
cp prisma/schema-production.prisma prisma/schema.prisma

# 3. Generate new client
npx prisma generate

# 4. Push schema to new database
npx prisma db push

# 5. Seed with sample data
npx tsx scripts/seed-assets.ts
```

### **Production Health Check:**
```bash
# Test database connection
npx prisma db seed

# Verify API endpoints
curl https://your-domain.com/api/inventory/assets
```

---

## 📊 **Monitoring & Maintenance**

### **Database Monitoring:**
- **Vercel**: Built-in metrics in dashboard
- **AWS RDS**: CloudWatch metrics and alarms

### **Application Monitoring:**
- **Vercel**: Analytics tab in dashboard  
- **AWS**: CloudWatch logs and X-Ray tracing

### **Backup Strategy:**
- **Vercel Postgres**: Automatic backups included
- **AWS RDS**: 7-day automated backups configured

---

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **Connection Pool Errors:**
   ```bash
   # Use connection pooling URL (Vercel provides this)
   POSTGRES_PRISMA_URL=postgresql://...?pgbouncer=true
   ```

2. **Migration Failures:**
   ```bash
   # Reset database (development only!)
   npx prisma migrate reset
   
   # For production, use:
   npx prisma db push
   ```

3. **Environment Variable Issues:**
   ```bash
   # Verify all required vars are set
   npm run build
   ```

---

## ✅ **Success Verification**

After deployment, verify:
- [ ] Application loads at production URL
- [ ] Database connection is working (check status indicator)
- [ ] User registration/login works
- [ ] Asset creation persists data
- [ ] Rich visualizations load properly
- [ ] File uploads work (if configured)

---

## 📞 **Quick Support**

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables are set
3. Test database connection locally first
4. Check prisma generate was run after schema changes

**For immediate deployment: Choose Vercel route - it's faster and handles infrastructure automatically!**
