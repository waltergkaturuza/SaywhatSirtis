const { PrismaClient } = require('@prisma/client');

async function testDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing database connection...');
    const projects = await prisma.project.findMany();
    console.log('✅ Database connection successful!');
    console.log(`Found ${projects.length} projects`);
    
    // Test creating a project
    console.log('\nTesting project creation...');
    const testProject = await prisma.project.create({
      data: {
        name: 'Test Project',
        description: 'Test Description',
        timeframe: '2025-01-01 to 2025-12-31',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        country: 'Test Country',
        objectives: JSON.stringify(['Test Objective']),
        budget: 10000,
        actualSpent: 0
      }
    });
    
    console.log('✅ Project created successfully!');
    console.log('Project ID:', testProject.id);
    
    // Clean up test project
    await prisma.project.delete({
      where: { id: testProject.id }
    });
    
    console.log('✅ Test project cleaned up');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
