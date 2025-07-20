#!/bin/bash

# SIRTIS Vercel Database Configuration Script
# This script helps configure the database for Vercel deployment

echo "🚀 SIRTIS Vercel Database Configuration"
echo "======================================="

# Check if we're running on Vercel
if [ "$VERCEL" = "1" ]; then
    echo "✅ Running on Vercel environment"
    
    # Use PostgreSQL schema for production
    echo "📦 Using PostgreSQL schema for production..."
    cp prisma/schema-vercel.prisma prisma/schema.prisma
    
    # Generate Prisma client
    echo "🔄 Generating Prisma client..."
    npx prisma generate
    
    # Run database migrations (if DATABASE_URL is set)
    if [ ! -z "$DATABASE_URL" ]; then
        echo "🗄️  Running database migrations..."
        npx prisma migrate deploy
        
        echo "🌱 Seeding database..."
        npx prisma db seed
    else
        echo "⚠️  DATABASE_URL not set - skipping migrations"
    fi
else
    echo "💻 Running in local development environment"
    echo "Using SQLite for local development..."
fi

echo "✅ Database configuration complete!"
