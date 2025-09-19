import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

// Create a new Prisma client with better error handling and connection management
const createPrismaClient = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  let connectionUrl = process.env.DATABASE_URL.trim()

  // Ensure prepared_statements=false is set exactly once (needed for pgbouncer pooler)
  if (!/prepared_statements=false/.test(connectionUrl)) {
    connectionUrl += (connectionUrl.includes('?') ? '&' : '?') + 'prepared_statements=false'
  }

  // If multiple connection_limit params exist (from prior hot reloads), keep the first only.
  // Prefer small conservative pool size in serverless / edge-like environments.
  const parts = connectionUrl.split('?')
  if (parts[1]) {
    const params = new URLSearchParams(parts[1])
    // Increase connection pool for better concurrency
    if (!params.has('connection_limit')) {
      params.set('connection_limit', '10')
    }
    if (!params.has('pool_timeout')) {
      params.set('pool_timeout', '60')
    }
    // Remove any duplicate keys implicitly handled by URLSearchParams
    connectionUrl = parts[0] + '?' + params.toString()
  }

  const client = new PrismaClient({
    log: ['error', 'warn'],
    errorFormat: 'pretty',
    datasources: { db: { url: connectionUrl } },
    // Optimize for better connection handling
    __internal: {
      engine: {
        connectTimeout: 60000,  // 60 seconds
        acquireTimeout: 60000,  // 60 seconds
      }
    }
  })

  // Lightweight health flag
  ;(client as any)._healthy = false

  return client
}

// Use a singleton pattern to ensure only one Prisma client instance
export const prisma = globalThis.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

// Enhanced connection management with retry logic
export async function connectPrisma() {
  const maxAttempts = 4
  let attempt = 0
  while (attempt < maxAttempts) {
    attempt++
    try {
      await prisma.$connect()
      // Run a trivial query to confirm connectivity (avoids lazy connect edge cases)
      await prisma.$queryRaw`SELECT 1`
      ;(prisma as any)._healthy = true
      return true
    } catch (error: any) {
      const isInitErr = /P1001|ECONNREFUSED|timeout|Could not connect|Can't reach database/i.test(error?.message || '')
      console.error(`Prisma connect attempt ${attempt} failed`, error)
      if (attempt >= maxAttempts || !isInitErr) {
        return false
      }
      const backoff = 300 * Math.pow(2, attempt - 1)
      await new Promise(r => setTimeout(r, backoff))
    }
  }
  return false
}

// Safe query execution with automatic reconnection and prepared statement cleanup
export async function executeQuery<T>(queryFn: (prisma: PrismaClient) => Promise<T>): Promise<T> {
  const maxRetries = 4
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (!(prisma as any)._healthy) {
        await connectPrisma()
      }
      const result = await queryFn(prisma)
      return result
    } catch (error: any) {
      const transient = /P1001|P2024|timeout|ECONNRESET|ECONNREFUSED|read ECONNRESET|Could not connect|reset by peer|prepared statement/i.test(error?.message || '')
      if (attempt < maxRetries && transient) {
        const backoff = 250 * Math.pow(2, attempt - 1)
        console.warn(`Transient DB error (attempt ${attempt}/${maxRetries}), backing off ${backoff}ms`, error?.code || '')
        await new Promise(r => setTimeout(r, backoff))
        continue
      }
      console.error('Non-retryable or max attempts reached for DB query')
      throw error
    }
  }
  throw new Error('Unreachable code in executeQuery')
}

// Alternative safe query that uses the callback pattern
export async function safeQuery<T>(callback: (prisma: PrismaClient) => Promise<T>): Promise<T> {
  return executeQuery(callback)
}

// Ensure proper cleanup on hot reload
// Vite / Webpack HMR guard (Next.js App Router typically not using module.hot, but keep for safety)
if (process.env.NODE_ENV === 'development' && (module as any).hot) {
  try {
    (module as any).hot.dispose(() => {
      prisma.$disconnect().catch(() => {})
    })
  } catch {}
}

// Ensure clean disconnection
process.on('beforeExit', async () => {
  try { await prisma.$disconnect() } catch {}
})
