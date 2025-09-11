const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkRisks() {
  try {
    const riskCount = await prisma.risk.count();
    console.log('Risks in database:', riskCount);
    
    if (riskCount === 0) {
      console.log('No risks found. Need to seed risk data.');
    } else {
      const risks = await prisma.risk.findMany({
        select: {
          riskId: true,
          title: true,
          status: true,
          riskScore: true
        }
      });
      console.log('Existing risks:', risks);
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    await prisma.$disconnect();
  }
}

checkRisks();
