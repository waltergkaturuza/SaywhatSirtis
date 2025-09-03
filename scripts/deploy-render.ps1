# Render Deployment Script for SAYWHAT SIRTIS (PowerShell)
# This script handles the complete deployment process for Render.com

Write-Host "🚀 Starting SAYWHAT SIRTIS deployment on Render..." -ForegroundColor Green

# Set environment
$env:NODE_ENV = "production"

# Install dependencies with legacy peer deps support
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
npm ci --legacy-peer-deps --registry https://registry.npmjs.org/

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Verify critical environment variables
Write-Host "🔍 Checking environment variables..." -ForegroundColor Blue

$requiredVars = @(
    "DATABASE_URL",
    "NEXTAUTH_SECRET", 
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY"
)

foreach ($var in $requiredVars) {
    if (-not (Get-ChildItem env: | Where-Object Name -eq $var)) {
        Write-Host "❌ $var is not set" -ForegroundColor Red
        Write-Host "Please set this environment variable before deployment" -ForegroundColor Yellow
    } else {
        Write-Host "✅ $var is configured" -ForegroundColor Green
    }
}

# Generate Prisma client
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Blue
npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma client" -ForegroundColor Red
    exit 1
}

# Build the application
Write-Host "🏗️ Building Next.js application..." -ForegroundColor Blue
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed successfully!" -ForegroundColor Green

# Display next steps
Write-Host "`n🎉 Deployment preparation complete!" -ForegroundColor Green
Write-Host "📝 Next steps:" -ForegroundColor Blue
Write-Host "   1. Push this code to your GitHub repository" -ForegroundColor White
Write-Host "   2. Go to https://render.com and create a new Web Service" -ForegroundColor White
Write-Host "   3. Connect your GitHub repository" -ForegroundColor White
Write-Host "   4. Use these settings:" -ForegroundColor White
Write-Host "      - Build Command: npm run render:build" -ForegroundColor Cyan
Write-Host "      - Start Command: npm run render:start" -ForegroundColor Cyan
Write-Host "      - Health Check Path: /api/test/hello" -ForegroundColor Cyan
Write-Host "   5. Add all environment variables from .env.local" -ForegroundColor White
Write-Host "   6. Deploy the service" -ForegroundColor White

Write-Host "`n🌐 Environment Variables to add in Render:" -ForegroundColor Yellow
Write-Host "   - DATABASE_URL" -ForegroundColor Cyan
Write-Host "   - NEXTAUTH_URL (your Render app URL)" -ForegroundColor Cyan
Write-Host "   - NEXTAUTH_SECRET" -ForegroundColor Cyan
Write-Host "   - SUPABASE_URL" -ForegroundColor Cyan
Write-Host "   - SUPABASE_ANON_KEY" -ForegroundColor Cyan
Write-Host "   - SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Cyan
Write-Host "   - NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor Cyan
Write-Host "   - NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor Cyan
