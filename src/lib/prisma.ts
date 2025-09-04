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
