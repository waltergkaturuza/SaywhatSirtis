import { PrismaClient } from '@prisma/client';

// Global Prisma instance with connection pooling
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'], // Reduced logging to prevent memory issues
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Increase max listeners to prevent warning
process.setMaxListeners(15);

// Database connection retry utility
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      console.warn(`Database operation failed on attempt ${attempt}/${maxRetries}:`, error.message);
      
      // Check if it's a connection error that might be retryable
      if (
        error.code === 'P1001' || // Can't reach database server
        error.code === 'P1017' || // Server has closed the connection
        error.message?.includes('Can\'t reach database server') ||
        error.message?.includes('Connection terminated unexpectedly') ||
        error.message?.includes('timeout')
      ) {
        if (attempt < maxRetries) {
          console.log(`Retrying database operation in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
          continue;
        }
      }
      
      // If it's not a retryable error or we've exhausted retries, throw
      throw error;
    }
  }
  
  throw lastError!;
}

// Health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Graceful disconnect
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error disconnecting from database:', error);
  }
}