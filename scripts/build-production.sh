#!/bin/bash
set -e

echo "🚀 Starting SIRTIS production build..."

# Function to retry npm install with exponential backoff
retry_npm_install() {
    local max_attempts=3
    local delay=1
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo "📦 Attempt $attempt: Installing dependencies..."
        
        if npm ci --legacy-peer-deps 2>/dev/null || npm install --legacy-peer-deps; then
            echo "✅ Dependencies installed successfully"
            return 0
        else
            echo "❌ Attempt $attempt failed"
            if [ $attempt -lt $max_attempts ]; then
                echo "⏳ Retrying in ${delay} seconds..."
                sleep $delay
                delay=$((delay * 2))
            fi
            attempt=$((attempt + 1))
        fi
    done
    
    echo "❌ Failed to install dependencies after $max_attempts attempts"
    return 1
}

# Retry npm install
retry_npm_install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Build the application
echo "🏗️ Building Next.js application..."
npm run build

echo "🎉 Build completed successfully!"
