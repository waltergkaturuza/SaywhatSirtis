const { PrismaClient } = require('@prisma/client');

async function testModelNames() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing model accessibility...');
    
    // Test users variations
    try {
      const usersCount = await prisma.users.count();
      console.log('✅ prisma.users works - count:', usersCount);
    } catch (err) {
      console.log('❌ prisma.users failed:', err.message);
    }
    
    // Test projects variations  
    try {
      const projectsCount = await prisma.projects.count();
      console.log('✅ prisma.projects works - count:', projectsCount);
    } catch (err) {
      console.log('❌ prisma.projects failed:', err.message);
    }
    
    // Test call_records variations
    try {
      const callRecordsCount = await prisma.call_records.count();
      console.log('✅ prisma.call_records works - count:', callRecordsCount);
    } catch (err) {
      console.log('❌ prisma.call_records failed:', err.message);
    }
    
    console.log('\nAll available models:');
    const models = Object.keys(prisma).filter(key => 
      typeof prisma[key] === 'object' && 
      prisma[key] && 
      typeof prisma[key].findMany === 'function'
    );
    models.forEach(model => console.log(`- ${model}`));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testModelNames();
