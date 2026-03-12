FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install ALL dependencies (including devDependencies for build)
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Generate Prisma client
RUN ./node_modules/.bin/prisma generate

# Build the application
# DATABASE_URL is passed as a build secret so Next.js can collect page data
# It is NOT baked into the image - only used during build
ARG DATABASE_URL
ARG DIRECT_URL
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL="https://saywhatsirtis.fly.dev"
ENV DATABASE_URL=$DATABASE_URL
ENV DIRECT_URL=$DIRECT_URL
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Add non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080

ENV PORT=8080
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV="production"

CMD ["node", "server.js"]
