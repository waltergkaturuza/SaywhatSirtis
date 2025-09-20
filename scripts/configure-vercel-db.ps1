# SIRTIS Vercel Database Configuration Script (PowerShell)
# This script helps configure the database for Vercel deployment

Write-Host "🚀 SIRTIS Vercel Database Configuration" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Check if we're running on Vercel
if ($env:VERCEL -eq "1") {
    Write-Host "✅ Running on Vercel environment" -ForegroundColor Green
    
    # Use PostgreSQL schema for production
    Write-Host "📦 Using PostgreSQL schema for production..." -ForegroundColor Yellow
    Copy-Item "prisma/schema-vercel.prisma" "prisma/schema.prisma" -Force
    
    # Generate Prisma client
    Write-Host "🔄 Generating Prisma client..." -ForegroundColor Yellow
    npx prisma generate
    
    # Run database migrations (if DATABASE_URL is set)
    if ($env:DATABASE_URL) {
        Write-Host "🗄️  Running database migrations..." -ForegroundColor Yellow
        npx prisma migrate deploy
    }
    else {
        Write-Host "⚠️  DATABASE_URL not set - skipping migrations" -ForegroundColor Red
    }
}
else {
    Write-Host "💻 Running in local development environment" -ForegroundColor Blue
    Write-Host "Using SQLite for local development..." -ForegroundColor Blue
}

Write-Host "✅ Database configuration complete!" -ForegroundColor Green
