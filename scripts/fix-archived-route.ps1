Write-Host "Fixing archived employees route..."

$file = "src\app\api\hr\employees\archived\route.ts"

if (Test-Path $file) {
    $content = [System.IO.File]::ReadAllText($file)
    $originalContent = $content
    
    # Fix all prisma.users references to prisma.employees
    $content = $content -replace 'prisma\.users\.', 'prisma.employees.'
    
    if ($content -ne $originalContent) {
        [System.IO.File]::WriteAllText($file, $content)
        Write-Host "Fixed users -> employees in $file"
    } else {
        Write-Host "No changes needed in $file"
    }
} else {
    Write-Host "File not found: $file"
}

Write-Host "Complete!"
