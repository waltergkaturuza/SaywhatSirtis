#!/usr/bin/env node

/**
 * Authentication Reset Utility
 * Use this script to clear authentication-related issues
 */

const path = require('path');
const fs = require('fs');

console.log('🔧 SIRTIS Authentication Reset Utility');
console.log('=====================================\n');

// Check if we're in the correct directory
const projectRoot = process.cwd();
const packageJsonPath = path.join(projectRoot, 'package.json');

if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Error: package.json not found. Please run this from the project root directory.');
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
if (packageJson.name !== 'saywhat-sirtis') {
  console.error('❌ Error: This doesn\'t appear to be the SIRTIS project directory.');
  process.exit(1);
}

console.log('✅ Project directory verified\n');

// Check environment files
const envFiles = ['.env.local', '.env', '.env.development'];
let envFound = false;

for (const envFile of envFiles) {
  const envPath = path.join(projectRoot, envFile);
  if (fs.existsSync(envPath)) {
    console.log(`📄 Found environment file: ${envFile}`);
    envFound = true;
    
    // Check if NEXTAUTH_SECRET exists and is not a placeholder
    const envContent = fs.readFileSync(envPath, 'utf8');
    const secretMatch = envContent.match(/NEXTAUTH_SECRET="?([^"\n]+)"?/);
    
    if (!secretMatch) {
      console.log('⚠️  NEXTAUTH_SECRET not found in this file');
    } else if (secretMatch[1].includes('your-nextauth-secret-here') || secretMatch[1].length < 20) {
      console.log('⚠️  NEXTAUTH_SECRET appears to be a placeholder or too short');
    } else {
      console.log('✅ NEXTAUTH_SECRET looks valid');
    }
  }
}

if (!envFound) {
  console.log('⚠️  No environment files found');
}

console.log('\n📋 Authentication Troubleshooting Steps:');
console.log('1. If you see JWT_SESSION_ERROR or CLIENT_FETCH_ERROR:');
console.log('   - Visit http://localhost:3000/auth/clear to clear cookies');
console.log('   - Or clear browser data for localhost:3000');
console.log('');
console.log('2. If NEXTAUTH_SECRET is missing or invalid:');
console.log('   - Generate a new secret: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"');
console.log('   - Add it to your .env.local file');
console.log('');
console.log('3. Restart the development server after any environment changes');
console.log('');

// Test current NextAuth configuration
console.log('🔍 Testing NextAuth configuration...');

try {
  // Try to load the auth configuration
  const authConfigPath = path.join(projectRoot, 'src/lib/auth.ts');
  if (fs.existsSync(authConfigPath)) {
    console.log('✅ Auth configuration file found');
    
    // Basic syntax check
    const authContent = fs.readFileSync(authConfigPath, 'utf8');
    if (authContent.includes('authOptions') && authContent.includes('NextAuthOptions')) {
      console.log('✅ Auth configuration appears valid');
    } else {
      console.log('⚠️  Auth configuration may have issues');
    }
  } else {
    console.log('❌ Auth configuration file not found');
  }
} catch (error) {
  console.log('❌ Error checking auth configuration:', error.message);
}

console.log('\n🎯 Quick Actions:');
console.log('- Clear auth cookies: Visit /auth/clear in your browser');
console.log('- Sign in page: Visit /auth/signin');
console.log('- Test login: admin@saywhat.org / admin123');
console.log('');
console.log('💡 For persistent issues, check the browser console for detailed error messages.');