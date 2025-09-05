import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

// Create a new Prisma client with better error handling and connection management
const createPrismaClient = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  return new PrismaClient({
    log: ['error', 'warn'],
    errorFormat: 'pretty',
    datasources: {
      db: {
        url: process.env.DATABASE_URL
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

// Safe query execution with automatic reconnection
export async function executeQuery<T>(queryFn: () => Promise<T>): Promise<T> {
  let retries = 3
  
  while (retries > 0) {
    try {
      // Ensure connection is active
      await prisma.$connect()
      return await queryFn()
    } catch (error: any) {
      console.error(`Query failed (${retries} retries left):`, error)
      
      // Check if it's a connection-related error
      if (error?.code === '26000' || error?.message?.includes('prepared statement') || error?.message?.includes('connection')) {
        retries--
        if (retries > 0) {
          console.log('Attempting to reconnect...')
          await prisma.$disconnect()
          await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
          continue
        }
      }
      
      throw error
    }
  }
  
  throw new Error('Max retries reached')
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
