# SIRTIS Supabase Database Deployment Script (PowerShell)
# This script deploys database changes to Supabase PostgreSQL

Write-Host "🚀 SIRTIS Supabase Database Deployment" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green

# Check if running in GitHub Actions
if ($env:GITHUB_ACTIONS -eq "true") {
    Write-Host "✅ Running in GitHub Actions environment" -ForegroundColor Green
} else {
    Write-Host "💻 Running in local environment" -ForegroundColor Blue
}

# Check required environment variables
if (-not $env:DATABASE_URL) {
    Write-Host "❌ DATABASE_URL environment variable is required" -ForegroundColor Red
    exit 1
}

if (-not $env:DIRECT_URL) {
    Write-Host "⚠️  DIRECT_URL not set, using DATABASE_URL for direct connections" -ForegroundColor Yellow
    $env:DIRECT_URL = $env:DATABASE_URL
}

try {
    Write-Host "📦 Switching to Supabase PostgreSQL schema..." -ForegroundColor Yellow
    Copy-Item "prisma/schema-supabase.prisma" "prisma/schema.prisma" -Force

    Write-Host "🔄 Generating Prisma client..." -ForegroundColor Yellow
    npx prisma generate
    if ($LASTEXITCODE -ne 0) { throw "Prisma generate failed" }

    Write-Host "🗄️  Deploying database migrations..." -ForegroundColor Yellow
    npx prisma migrate deploy
    if ($LASTEXITCODE -ne 0) { throw "Migration deployment failed" }

    Write-Host "🌱 Seeding database with initial data..." -ForegroundColor Yellow
    npx prisma db seed
    if ($LASTEXITCODE -ne 0) { 
        Write-Host "⚠️  Database seeding failed, but continuing..." -ForegroundColor Yellow
    }

    Write-Host "✅ Supabase database deployment complete!" -ForegroundColor Green

    # Reset schema back to development version for local work
    if ($env:GITHUB_ACTIONS -ne "true") {
        Write-Host "🔄 Resetting to development schema..." -ForegroundColor Yellow
        git checkout prisma/schema.prisma
    }
}
catch {
    Write-Host "❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    
    # Reset schema on failure
    if ($env:GITHUB_ACTIONS -ne "true") {
        git checkout prisma/schema.prisma
    }
    
    exit 1
}
