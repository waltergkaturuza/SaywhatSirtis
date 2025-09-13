Write-Host "Fixing prisma.department to prisma.departments..."

# Get the specific file with department issues
$file = "src\app\api\hr\department\[id]\route.ts"

if (Test-Path $file) {
    Write-Host "Processing $file"
    $content = [System.IO.File]::ReadAllText($file)
    $originalContent = $content
    
    # Fix all prisma.department references
    $content = $content -replace 'prisma\.department\.', 'prisma.departments.'
    $content = $content -replace 'prisma\.department\b', 'prisma.departments'
    
    # Write back if changed
    if ($content -ne $originalContent) {
        [System.IO.File]::WriteAllText($file, $content)
        Write-Host "Fixed department references in $file"
    }
} else {
    Write-Host "File $file not found"
}

# Also fix the platform-metrics file
$file2 = "src\lib\platform-metrics.ts"
if (Test-Path $file2) {
    Write-Host "Processing $file2"
    $content2 = [System.IO.File]::ReadAllText($file2)
    $originalContent2 = $content2
    
    # Fix the optional chaining issue
    $content2 = $content2 -replace 'prisma\.department\?\.count\(\)', 'prisma.departments.count()'
    
    if ($content2 -ne $originalContent2) {
        [System.IO.File]::WriteAllText($file2, $content2)
        Write-Host "Fixed department reference in $file2"
    }
}

Write-Host "Department fixes complete!"
