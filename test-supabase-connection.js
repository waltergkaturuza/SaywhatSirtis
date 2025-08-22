// Test Supabase connection
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://postgres.yuwwqupyqpmkbqzvqiee:8FNI4OdtFINUw2GL@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
    }
  }
});

async function testConnection() {
  try {
    console.log('🔗 Testing Supabase connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Successfully connected to Supabase!');
    
    // Test query
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('📊 Database version:', result);
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
