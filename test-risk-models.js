// Test script to verify Risk models are available in Prisma client
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testRiskModels() {
  try {
    console.log('Testing Risk models...');
    
    // Try to access the Risk model
    const riskCount = await prisma.risk.count();
    console.log('Risk model accessible, count:', riskCount);
    
    const mitigationCount = await prisma.riskMitigation.count();
    console.log('RiskMitigation model accessible, count:', mitigationCount);
    
    console.log('All Risk models are working!');
  } catch (error) {
    console.error('Error accessing Risk models:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRiskModels();
