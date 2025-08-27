import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

// Extend the module interface to include hot module replacement
declare const module: {
  hot?: {
    dispose(callback: () => void): void
  }
} & NodeModule

// Create a new Prisma client with better error handling and connection management
const createPrismaClient = () => {
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
if (typeof module !== 'undefined' && module.hot) {
  module.hot.dispose(() => {
    prisma.$disconnect()
  })
}

// Ensure clean disconnection
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})
