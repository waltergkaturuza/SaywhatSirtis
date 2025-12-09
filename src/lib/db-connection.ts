// Database connection with retry logic and proper error handling for Render deployment
// Import from the optimized prisma.ts to ensure single instance
import { prisma as optimizedPrisma } from './prisma';

// Re-export the optimized Prisma client to ensure single instance
export const prisma = optimizedPrisma;

// Connection health check function with timeout and retry logic
export async function checkDatabaseConnection() {
  const maxAttempts = 3;
  let attempt = 0;
  
  while (attempt < maxAttempts) {
    attempt++;
    try {
      // Use a timeout to prevent hanging
      const connectPromise = prisma.$connect();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 10000)
      );
      
      await Promise.race([connectPromise, timeoutPromise]);
      
      // Quick health check query
      await prisma.$queryRaw`SELECT 1`.catch(() => {
        throw new Error('Health check query failed');
      });
      
      console.log('✅ Database connected successfully');
      return true;
    } catch (error: any) {
      const isPoolError = error?.code === 'P2024' || /connection pool|timeout/i.test(error?.message || '');
      
      if (attempt >= maxAttempts) {
        console.error('❌ Database connection failed after', maxAttempts, 'attempts:', error?.code || error?.message);
        return false;
      }
      
      if (isPoolError) {
        console.warn(`⚠️ Connection pool issue (attempt ${attempt}/${maxAttempts}), retrying...`);
        // Wait before retrying, with exponential backoff
        await new Promise(r => setTimeout(r, 1000 * attempt));
        continue;
      }
      
      // For other errors, log and return false
      console.error('❌ Database connection failed:', error?.code || error?.message);
      return false;
    }
  }
  
  return false;
}

// Graceful shutdown
export async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected successfully');
  } catch (error) {
    console.error('❌ Database disconnection failed:', error);
  }
}

// Handle process termination
if (typeof window === 'undefined') {
  process.on('SIGINT', async () => {
    console.log('Received SIGINT, disconnecting database...');
    await disconnectDatabase();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, disconnecting database...');
    await disconnectDatabase();
    process.exit(0);
  });
}