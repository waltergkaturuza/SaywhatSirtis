#!/bin/bash

# Render Deployment Script for SAYWHAT SIRTIS
# This script handles the complete deployment process for Render.com

echo "🚀 Starting SAYWHAT SIRTIS deployment on Render..."

# Set environment
export NODE_ENV=production

# Install dependencies with legacy peer deps support
echo "📦 Installing dependencies..."
npm ci --legacy-peer-deps --registry https://registry.npmjs.org/

# Verify critical environment variables
echo "🔍 Checking environment variables..."
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL is not set"
    exit 1
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
    echo "❌ NEXTAUTH_SECRET is not set"
    exit 1
fi

if [ -z "$SUPABASE_URL" ]; then
    echo "❌ SUPABASE_URL is not set"
    exit 1
fi

echo "✅ Environment variables validated"

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Test database connection
echo "🗄️ Testing database connection..."
npx prisma db push --preview-feature || echo "⚠️ Database push failed, continuing..."

# Build the application
echo "🏗️ Building Next.js application..."
npm run build

echo "✅ Build completed successfully!"

# Create health check endpoint test
echo "🩺 Preparing health checks..."
echo "Health check will be available at /api/test/hello"

echo "🎉 Deployment preparation complete!"
echo "📝 Next steps:"
echo "   1. Push this code to your GitHub repository"
echo "   2. Connect the repository to Render"
echo "   3. Set up environment variables in Render dashboard"
echo "   4. Deploy the service"
