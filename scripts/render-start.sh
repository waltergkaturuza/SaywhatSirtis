#!/bin/bash

# Render startup script for SIRTIS
echo "🚀 Starting SIRTIS on Render..."

# Check if database URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL is not set"
    exit 1
fi

# Check if NEXTAUTH_SECRET is set
if [ -z "$NEXTAUTH_SECRET" ]; then
    echo "❌ ERROR: NEXTAUTH_SECRET is not set"
    exit 1
fi

# Set default port if not provided
export PORT=${PORT:-10000}
echo "📡 Server will bind to 0.0.0.0:$PORT"

# Run pre-startup verification
echo "🔍 Running pre-startup verification..."
node scripts/verify-startup.js

if [ $? -ne 0 ]; then
    echo "❌ Pre-startup verification failed"
    exit 1
fi

# Run database migrations first
echo "🔄 Running database migrations..."
npx prisma migrate deploy

if [ $? -ne 0 ]; then
    echo "❌ Database migration failed"
    exit 1
fi

echo "✅ Database migrations completed"

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Prisma client generation failed"
    exit 1
fi

echo "✅ Prisma client generated"

# Start the application
echo "🚀 Starting Next.js application..."
exec next start -H 0.0.0.0 -p $PORT