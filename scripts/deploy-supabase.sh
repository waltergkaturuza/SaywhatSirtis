#!/bin/bash
# SIRTIS Supabase Database Deployment Script

set -e

echo "🚀 SIRTIS Supabase Database Deployment"
echo "======================================"

# Check if running in GitHub Actions
if [ "$GITHUB_ACTIONS" = "true" ]; then
    echo "✅ Running in GitHub Actions environment"
else
    echo "💻 Running in local environment"
fi

# Check required environment variables
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is required"
    exit 1
fi

if [ -z "$DIRECT_URL" ]; then
    echo "⚠️  DIRECT_URL not set, using DATABASE_URL for direct connections"
    export DIRECT_URL="$DATABASE_URL"
fi

echo "📦 Switching to Supabase PostgreSQL schema..."
cp prisma/schema-supabase.prisma prisma/schema.prisma

echo "🔄 Generating Prisma client..."
npx prisma generate

echo "🗄️  Deploying database migrations..."
npx prisma migrate deploy

echo "🌱 Seeding database with initial data..."
npx prisma db seed --preview-feature

echo "✅ Supabase database deployment complete!"

# Reset schema back to development version for local work
if [ "$GITHUB_ACTIONS" != "true" ]; then
    echo "🔄 Resetting to development schema..."
    git checkout prisma/schema.prisma
fi
