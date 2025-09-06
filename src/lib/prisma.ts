import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

// Create a new Prisma client with better error handling and connection management
const createPrismaClient = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  // Convert pooler URL to direct connection URL automatically
  let connectionUrl = process.env.DIRECT_URL || process.env.DATABASE_URL
  
  // If using Supabase pooler (port 6543), convert to direct connection (port 5432)
  if (connectionUrl.includes(':6543') && connectionUrl.includes('pooler.supabase.com')) {
    connectionUrl = connectionUrl
      .replace(':6543', ':5432')
      .replace('pooler.supabase.com', 'compute.amazonaws.com')
    console.log('🔄 Automatically converted pooler URL to direct connection')
  }

  return new PrismaClient({
    log: ['error', 'warn'],
    errorFormat: 'pretty',
    datasources: {
      db: {
        url: connectionUrl + '&prepared_statements=false&connection_limit=1'
      }
    }
  })
}

// Use a singleton pattern to ensure only one Prisma client instance
export const prisma = globalThis.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

// Enhanced connection management with retry logic
export async function connectPrisma() {
  try {
    await prisma.$connect()
    return true
  } catch (error) {
    console.error('Failed to connect to database:', error)
    return false
  }
}

// Safe query execution with automatic reconnection and prepared statement cleanup
export async function executeQuery<T>(queryFn: (prisma: PrismaClient) => Promise<T>): Promise<T> {
  let retries = 3
  
  while (retries > 0) {
    try {
      // Handle Supabase database URL - use pooler connection as it's more reliable in production
      let connectionUrl = process.env.DIRECT_URL || process.env.DATABASE_URL
      
      // For Supabase, if we have a direct URL that's failing, fall back to pooler
      if (connectionUrl && connectionUrl.includes('compute.amazonaws.com')) {
        // Convert back to pooler for better reliability
        connectionUrl = connectionUrl
          .replace(':5432', ':6543')
          .replace('compute.amazonaws.com', 'pooler.supabase.com')
        console.log('🔄 Using Supabase pooler connection for better reliability')
      }
      
      // Ensure we have the pooler URL format for Supabase
      if (connectionUrl && connectionUrl.includes('pooler.supabase.com') && !connectionUrl.includes(':6543')) {
        connectionUrl = connectionUrl.replace(':5432', ':6543')
        console.log('🔄 Corrected port for Supabase pooler connection')
      }
      
      const freshPrisma = new PrismaClient({
        log: ['error'],
        errorFormat: 'pretty',
        datasources: {
          db: {
            url: connectionUrl + '&prepared_statements=false&connection_limit=1'
          }
        }
      })
      
      try {
        await freshPrisma.$connect()
        const result = await queryFn(freshPrisma)
        return result
      } finally {
        // Ensure immediate cleanup
        await freshPrisma.$disconnect().catch(() => {})
      }
    } catch (error: any) {
      console.error(`Query failed (${retries} retries left):`, error)
      
      // Check if it's a connection-related error
      if (
        error?.code === '26000' || 
        error?.code === '42P05' || 
        error?.message?.includes('prepared statement') || 
        error?.message?.includes('connection') ||
        error?.message?.includes('already exists')
      ) {
        retries--
        if (retries > 0) {
          console.log('Attempting to retry with fresh connection...')
          await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds
          continue
        }
      }
      
      throw error
    }
  }
  
  throw new Error('Max retries reached')
}

// Alternative safe query that uses the callback pattern
export async function safeQuery<T>(callback: (prisma: PrismaClient) => Promise<T>): Promise<T> {
  return executeQuery(callback)
}

// Ensure proper cleanup on hot reload
if (process.env.NODE_ENV === 'development' && (module as any).hot) {
  (module as any).hot.dispose(() => {
    prisma.$disconnect()
  })
}

// Ensure clean disconnection
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})
