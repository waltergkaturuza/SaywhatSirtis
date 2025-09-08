import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

// Create a stable Prisma client with proper Supabase pooler configuration
const createPrismaClient = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  // Use Supabase pooler connection (more stable for production)
  let connectionUrl = process.env.DATABASE_URL
  
  // Ensure we're using the pooler connection for Supabase (port 6543)
  if (connectionUrl.includes('supabase.com') && !connectionUrl.includes('pooler')) {
    connectionUrl = connectionUrl.replace('.co', '.pooler.supabase.co')
  }
  
  // Ensure correct port for pooler
  if (connectionUrl.includes('pooler.supabase.com') && connectionUrl.includes(':5432')) {
    connectionUrl = connectionUrl.replace(':5432', ':6543')
  }

  // Fix query parameter concatenation - check if URL already has parameters
  const separator = connectionUrl.includes('?') ? '&' : '?'
  const connectionString = connectionUrl + `${separator}pgbouncer=true&prepared_statements=false&connection_limit=1&pool_timeout=20`

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    errorFormat: 'pretty',
    datasources: {
      db: {
        url: connectionString
      }
    }
  })
}

// Use a singleton pattern to ensure only one Prisma client instance
export const prisma = globalThis.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
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
