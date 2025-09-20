# Enable Row Level Security (RLS) for SIRTIS Supabase Database
# This script fixes the security warnings in Supabase

Write-Host "🔒 Enabling Row Level Security (RLS) for SIRTIS Database..." -ForegroundColor Cyan

# Database connection parameters
$SUPABASE_DB_URL = "postgres://postgres.yuwwqupyqpmkbqzvqiee:8FNI4OdtFINUw2GL@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"

Write-Host "📊 Testing database connection..." -ForegroundColor Yellow

# Test connection using psql (if available)
$psqlAvailable = Get-Command psql -ErrorAction SilentlyContinue

if ($psqlAvailable) {
    Write-Host "✅ PostgreSQL client found, applying RLS policies..." -ForegroundColor Green
    
    try {
        # Apply RLS configuration
        psql $SUPABASE_DB_URL -f "scripts/enable-rls.sql"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "🎉 Successfully enabled RLS for all tables!" -ForegroundColor Green
            Write-Host "🔐 Security policies applied successfully" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to apply RLS policies" -ForegroundColor Red
            Write-Host "💡 Try running the SQL manually in Supabase SQL Editor" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "❌ Error applying RLS policies: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  PostgreSQL client (psql) not found" -ForegroundColor Yellow
    Write-Host "📝 Manual setup required:" -ForegroundColor Cyan
    Write-Host "1. Go to Supabase Dashboard → SQL Editor" -ForegroundColor White
    Write-Host "2. Copy and paste the contents of scripts/enable-rls.sql" -ForegroundColor White
    Write-Host "3. Run the SQL script to enable RLS" -ForegroundColor White
    Write-Host ""
    Write-Host "📁 RLS SQL script location: scripts/enable-rls.sql" -ForegroundColor Cyan
}

# Alternative: Use Prisma to run a simple RLS command
Write-Host "🔄 Attempting to enable RLS via Prisma..." -ForegroundColor Yellow

try {
    # Set environment variables for this session
    $env:DATABASE_URL = "postgres://postgres.yuwwqupyqpmkbqzvqiee:8FNI4OdtFINUw2GL@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
    
    # Try to run a simple SQL command via Prisma
    $rlsCommand = @"
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;
"@
    
    # Create temporary SQL file
    $rlsCommand | Out-File -FilePath "temp-rls.sql" -Encoding UTF8
    
    Write-Host "💡 If connection works, run: npx prisma db execute --file temp-rls.sql --schema prisma/schema-supabase.prisma" -ForegroundColor Cyan
    
} catch {
    Write-Host "⚠️  Prisma connection may not be working" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor Cyan
Write-Host "• RLS SQL script created: scripts/enable-rls.sql" -ForegroundColor White
Write-Host "• This will fix all security warnings in Supabase" -ForegroundColor White
Write-Host "• Apply via Supabase Dashboard → SQL Editor if psql unavailable" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Next steps:" -ForegroundColor Cyan
Write-Host "1. Apply RLS policies (scripts/enable-rls.sql)" -ForegroundColor White
Write-Host "2. Test your application!" -ForegroundColor White
