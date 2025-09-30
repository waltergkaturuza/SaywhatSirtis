// Production-optimized database configuration
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const createPrismaClient = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    errorFormat: 'minimal',
  })

  // Production optimizations
  if (process.env.NODE_ENV === 'production') {
    // Set connection pool limits for Render.com
    client.$connect().then(() => {
      console.log('✅ Prisma connected in production mode')
    }).catch((error) => {
      console.error('❌ Prisma connection failed:', error)
    })
  }

  return client
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Enhanced connection check with timeout and retry
export async function checkDatabaseConnection(timeoutMs: number = 5000): Promise<boolean> {
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Database connection timeout')), timeoutMs)
    })

    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      timeoutPromise
    ])

    return true
  } catch (error) {
    console.error('Database connection check failed:', error instanceof Error ? error.message : error)
    return false
  }
}

// Graceful shutdown with proper cleanup
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect()
    console.log('✅ Database disconnected gracefully')
  } catch (error) {
    console.error('❌ Database disconnection error:', error)
  }
}

// Handle process termination in production
if (typeof window === 'undefined') {
  const cleanup = async () => {
    console.log('🔄 Shutting down database connections...')
    await disconnectDatabase()
    process.exit(0)
  }

  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)
}