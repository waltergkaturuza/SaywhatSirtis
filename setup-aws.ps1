# AWS Setup Script for SIRTIS Deployment
# Run this after configuring AWS CLI with valid admin credentials

# Add AWS CLI to PATH for this session
$env:PATH += ";C:\Program Files\Amazon\AWSCLIV2"

Write-Host "🔧 Setting up AWS resources for SIRTIS deployment..." -ForegroundColor Cyan

# Verify current identity
Write-Host "`n1. Verifying AWS credentials..." -ForegroundColor Yellow
try {
    $identity = aws sts get-caller-identity --output json | ConvertFrom-Json
    Write-Host "✅ Connected as: $($identity.Arn)" -ForegroundColor Green
    Write-Host "✅ Account: $($identity.Account)" -ForegroundColor Green
}
catch {
    Write-Host "❌ AWS credentials not configured properly" -ForegroundColor Red
    Write-Host "Please run: aws configure" -ForegroundColor Yellow
    Write-Host "You need:" -ForegroundColor Yellow
    Write-Host "- AWS Access Key ID (starts with AKIA)" -ForegroundColor Yellow
    Write-Host "- AWS Secret Access Key" -ForegroundColor Yellow
    Write-Host "- Region: eu-west-1" -ForegroundColor Yellow
    exit 1
}

# Create IAM user for GitHub Actions
Write-Host "`n2. Creating IAM user for GitHub Actions..." -ForegroundColor Yellow
$userName = "github-actions-sirtis"

# Check if user already exists
$userExists = aws iam get-user --user-name $userName 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "⚠️  User $userName already exists" -ForegroundColor Yellow
} else {
    aws iam create-user --user-name $userName
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Created IAM user: $userName" -ForegroundColor Green
    }
}

# Attach necessary policies
Write-Host "`n3. Attaching policies..." -ForegroundColor Yellow
$policies = @(
    "arn:aws:iam::aws:policy/AmazonEC2FullAccess",
    "arn:aws:iam::aws:policy/AmazonS3FullAccess",
    "arn:aws:iam::aws:policy/AmazonRDSFullAccess",
    "arn:aws:iam::aws:policy/CloudWatchFullAccess"
)

foreach ($policy in $policies) {
    aws iam attach-user-policy --user-name $userName --policy-arn $policy
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Attached: $($policy.Split('/')[-1])" -ForegroundColor Green
    }
}

# Create access keys
Write-Host "`n4. Creating access keys..." -ForegroundColor Yellow
$accessKeysJson = aws iam create-access-key --user-name $userName --output json
if ($LASTEXITCODE -eq 0) {
    $accessKeys = $accessKeysJson | ConvertFrom-Json
    Write-Host "`n🔑 GitHub Secrets Configuration:" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host "Go to: https://github.com/waltergkaturuza/SaywhatSirtis/settings/secrets/actions" -ForegroundColor White
    Write-Host "`nAdd these secrets:" -ForegroundColor White
    Write-Host "AWS_ACCESS_KEY_ID: $($accessKeys.AccessKey.AccessKeyId)" -ForegroundColor Yellow
    Write-Host "AWS_SECRET_ACCESS_KEY: $($accessKeys.AccessKey.SecretAccessKey)" -ForegroundColor Yellow
    Write-Host "`nOther required secrets:" -ForegroundColor White
    Write-Host "DATABASE_URL: [Your database connection string]" -ForegroundColor Yellow
    Write-Host "NEXTAUTH_SECRET: e503c1465ec8f9dacb90c6264d5b90f00bdb0159825fb6bb8d993da84ad333fd" -ForegroundColor Yellow
} else {
    Write-Host "❌ Failed to create access keys" -ForegroundColor Red
}

Write-Host "`n✅ AWS setup complete!" -ForegroundColor Green
