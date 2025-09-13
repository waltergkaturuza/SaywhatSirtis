# Simple PowerShell Script to Fix Critical Prisma Model Issues
Write-Host "Starting Prisma model fixes..." -ForegroundColor Green

# Get all TypeScript files
$files = Get-ChildItem -Path "src" -Filter "*.ts" -Recurse
Write-Host "Found $($files.Count) files to process"

$totalFixes = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $original = $content
    
    # Fix the most critical model naming issues
    $content = $content -replace "prisma\.user\.", "prisma.users."
    $content = $content -replace "prisma\.qualification\.", "prisma.qualifications."
    $content = $content -replace "prisma\.auditLog\.", "prisma.audit_logs."
    $content = $content -replace "prisma\.department\.", "prisma.departments."
    $content = $content -replace "prisma\.event\.", "prisma.events."
    $content = $content -replace "prisma\.asset\.", "prisma.assets."
    $content = $content -replace "prisma\.risk\.", "prisma.risks."
    $content = $content -replace "prisma\.performanceReview\.", "prisma.performance_reviews."
    
    # Fix training models
    $content = $content -replace "prisma\.trainingProgram\.", "prisma.training_programs."
    $content = $content -replace "prisma\.trainingEnrollment\.", "prisma.training_enrollments."
    $content = $content -replace "prisma\.trainingCertificate\.", "prisma.training_certificates."
    
    if ($content -ne $original) {
        Set-Content $file.FullName $content -NoNewline
        Write-Host "Fixed: $($file.Name)" -ForegroundColor Cyan
        $totalFixes++
    }
}

Write-Host "Completed! Fixed $totalFixes files" -ForegroundColor Green
