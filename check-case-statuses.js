const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCaseStatuses() {
  try {
    const cases = await prisma.call_records.findMany({
      where: { 
        assignedOfficer: { not: null } 
      },
      select: { 
        id: true, 
        caseNumber: true, 
        status: true, 
        assignedOfficer: true, 
        resolvedAt: true,
        createdAt: true
      },
      take: 20
    });
    
    console.log('=== CASE DATA ANALYSIS ===');
    console.log(`Found ${cases.length} cases with assigned officers:`);
    console.log('');
    
    const statusCounts = {};
    
    cases.forEach((c, index) => {
      console.log(`${index + 1}. ID: ${c.id.substring(0, 8)}... Case: ${c.caseNumber}, Status: "${c.status}", Officer: ${c.assignedOfficer}, Resolved: ${c.resolvedAt ? 'YES' : 'NO'}`);
      
      // Count statuses
      const status = c.status || 'NULL';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    console.log('\n=== STATUS BREAKDOWN ===');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`${status}: ${count} cases`);
    });
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkCaseStatuses();