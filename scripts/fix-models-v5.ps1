# PowerShell v5.1 compatible script to fix Prisma model naming issues
Write-Host "Starting Prisma model fixes (PowerShell v5.1 compatible)..."

# Get all TypeScript files in the src directory
$files = Get-ChildItem -Path "src" -Recurse -Filter "*.ts" -File
Write-Host "Found $($files.Count) files to process"

$fixCount = 0

foreach ($file in $files) {
    try {
        # Read file content (PowerShell v5.1 compatible)
        $content = [System.IO.File]::ReadAllText($file.FullName)
        $originalContent = $content
        
        # Apply fixes
        $content = $content -replace 'prisma\.user\.', 'prisma.users.'
        $content = $content -replace 'prisma\.user\b', 'prisma.users'
        $content = $content -replace 'prisma\.qualification\.', 'prisma.qualifications.'
        $content = $content -replace 'prisma\.qualification\b', 'prisma.qualifications'
        $content = $content -replace 'prisma\.performance\.', 'prisma.performances.'
        $content = $content -replace 'prisma\.performance\b', 'prisma.performances'
        $content = $content -replace 'prisma\.project\.', 'prisma.projects.'
        $content = $content -replace 'prisma\.project\b', 'prisma.projects'
        $content = $content -replace 'prisma\.task\.', 'prisma.tasks.'
        $content = $content -replace 'prisma\.task\b', 'prisma.tasks'
        $content = $content -replace 'prisma\.asset\.', 'prisma.assets.'
        $content = $content -replace 'prisma\.asset\b', 'prisma.assets'
        $content = $content -replace 'prisma\.event\.', 'prisma.events.'
        $content = $content -replace 'prisma\.event\b', 'prisma.events'
        $content = $content -replace 'prisma\.activity\.', 'prisma.activities.'
        $content = $content -replace 'prisma\.activity\b', 'prisma.activities'
        
        # Write back if changed
        if ($content -ne $originalContent) {
            [System.IO.File]::WriteAllText($file.FullName, $content)
            Write-Host "Fixed: $($file.Name)"
            $fixCount++
        }
    }
    catch {
        Write-Host "Error processing $($file.FullName): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "Completed! Fixed $fixCount files" -ForegroundColor Green
