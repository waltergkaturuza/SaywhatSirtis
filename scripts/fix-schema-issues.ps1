# PowerShell Script to Fix Prisma Model Name Issues
# This script will fix all the common model naming problems found in the analysis

Write-Host "🔧 Starting comprehensive Prisma model fixes..." -ForegroundColor Green

# Define all the model name corrections needed
$modelFixes = @{
    "prisma\.user\." = "prisma.users."
    "prisma\.qualification\." = "prisma.qualifications."
    "prisma\.document\." = "prisma.documents."
    "prisma\.callRecord\." = "prisma.call_records."
    "prisma\.performancePlan\." = "prisma.performance_plans."
    "prisma\.auditLog\." = "prisma.audit_logs."
    "prisma\.event\." = "prisma.events."
    "prisma\.department\." = "prisma.departments."
    "prisma\.asset\." = "prisma.assets."
    "prisma\.risk\." = "prisma.risks."
    "prisma\.performanceReview\." = "prisma.performance_reviews."
    "prisma\.trainingProgram\." = "prisma.training_programs."
    "prisma\.trainingEnrollment\." = "prisma.training_enrollments."
    "prisma\.trainingCertificate\." = "prisma.training_certificates."
}

# Field name corrections
$fieldFixes = @{
    "employee\.employeeId" = "employee.id"
    "departmentRef" = "department"
}

# Get all TypeScript files in src directory
$files = Get-ChildItem -Path "src" -Filter "*.ts" -Recurse

Write-Host "📁 Found $($files.Count) TypeScript files to process" -ForegroundColor Yellow

$totalChanges = 0

foreach ($file in $files) {
    $filePath = $file.FullName
    $content = Get-Content $filePath -Raw
    $originalContent = $content
    $fileChanges = 0
    
    # Apply model name fixes
    foreach ($find in $modelFixes.Keys) {
        $replace = $modelFixes[$find]
        $newContent = $content -replace $find, $replace
        if ($newContent -ne $content) {
            $matchCount = ([regex]$find).Matches($content).Count
            $fileChanges += $matchCount
            $content = $newContent
            Write-Host "  ✓ Fixed $matchCount instances of '$find' in $($file.Name)" -ForegroundColor Cyan
        }
    }
    
    # Apply field name fixes
    foreach ($find in $fieldFixes.Keys) {
        $replace = $fieldFixes[$find]
        $newContent = $content -replace $find, $replace
        if ($newContent -ne $content) {
            $matchCount = ([regex]$find).Matches($content).Count
            $fileChanges += $matchCount
            $content = $newContent
            Write-Host "  ✓ Fixed $matchCount instances of '$find' in $($file.Name)" -ForegroundColor Cyan
        }
    }
    
    # Write back if changes were made
    if ($content -ne $originalContent) {
        Set-Content $filePath $content -NoNewline
        Write-Host "📝 Updated $($file.Name) - $fileChanges changes" -ForegroundColor Green
        $totalChanges += $fileChanges
    }
}

Write-Host "`n🎯 Phase 1 Complete: Fixed $totalChanges model/field references" -ForegroundColor Green

# Phase 2: Add missing randomUUID imports
Write-Host "`n🔧 Phase 2: Adding missing randomUUID imports..." -ForegroundColor Green

$importFixes = 0
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Check if file uses randomUUID but doesn't import it
    if ($content -match "randomUUID\(" -and $content -notmatch "import.*randomUUID") {
        $lines = $content -split "`r?`n"
        $importAdded = $false
        
        # Find the last import statement
        for ($i = 0; $i -lt $lines.Count; $i++) {
            if ($lines[$i] -match "^import.*from") {
                continue
            } elseif ($i -gt 0 -and $lines[$i-1] -match "^import.*from") {
                # Insert after the last import
                $lines = $lines[0..($i-1)] + "import { randomUUID } from 'crypto';" + $lines[$i..($lines.Count-1)]
                $importAdded = $true
                break
            }
        }
        
        if ($importAdded) {
            $newContent = $lines -join "`n"
            Set-Content $file.FullName $newContent -NoNewline
            Write-Host "  ✓ Added randomUUID import to $($file.Name)" -ForegroundColor Cyan
            $importFixes++
        }
    }
}

Write-Host "🎯 Phase 2 Complete: Added $importFixes randomUUID imports" -ForegroundColor Green

# Phase 3: Fix audit_logs entries missing ID fields
Write-Host "`n🔧 Phase 3: Fixing audit_logs entries..." -ForegroundColor Green

$auditFixes = 0
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Find audit_logs.create patterns without ID
    $pattern = "audit_logs\.create\(\s*\{\s*data:\s*\{\s*(?!.*id:)"
    if ($content -match $pattern) {
        # Replace the pattern to include ID
        $newContent = $content -replace "(audit_logs\.create\(\s*\{\s*data:\s*\{\s*)", "`$1`n        id: randomUUID(),"
        
        if ($newContent -ne $content) {
            Set-Content $file.FullName $newContent -NoNewline
            Write-Host "  ✓ Added ID field to audit_logs.create in $($file.Name)" -ForegroundColor Cyan
            $auditFixes++
        }
    }
}

Write-Host "🎯 Phase 3 Complete: Fixed $auditFixes audit_logs entries" -ForegroundColor Green

# Phase 4: Summary and Next Steps
Write-Host "`n📊 SUMMARY:" -ForegroundColor Yellow
Write-Host "✅ Model/Field fixes: $totalChanges" -ForegroundColor Green
Write-Host "✅ Import additions: $importFixes" -ForegroundColor Green  
Write-Host "✅ Audit log fixes: $auditFixes" -ForegroundColor Green
Write-Host "📋 Total changes: $($totalChanges + $importFixes + $auditFixes)" -ForegroundColor Yellow

Write-Host "`n🚀 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Run 'npx next build' to check for remaining issues" -ForegroundColor White
Write-Host "2. Review any remaining compilation errors" -ForegroundColor White
Write-Host "3. Test the application functionality" -ForegroundColor White

Write-Host "`n✅ Mass fixes complete!" -ForegroundColor Green
