const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCaseStatusMapping() {
  try {
    // Fetch the same data as the API
    const calls = await prisma.call_records.findMany({
      where: {
        assignedOfficer: { not: null }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100
    });

    console.log('=== RAW DATABASE DATA ===');
    calls.forEach((call, index) => {
      console.log(`${index + 1}. Case: ${call.caseNumber}, Raw Status: "${call.status}", Officer: ${call.assignedOfficer}`);
    });

    // Apply the same transformation as the API
    const cases = calls.map(call => {
      const now = new Date();
      const createdDate = new Date(call.createdAt);
      const dueDate = new Date(createdDate);
      dueDate.setDate(dueDate.getDate() + 7);
      
      // Normalize status to lowercase with hyphens for frontend
      const normalizedStatus = (call.status || 'OPEN').toLowerCase().replace('_', '-');
      
      return {
        id: call.id,
        caseNumber: call.caseNumber,
        status: normalizedStatus,
        originalStatus: call.status, // Keep for comparison
        officer: call.assignedOfficer,
        isOverdue: now > dueDate && (call.status || '').toUpperCase() !== 'CLOSED',
      };
    });

    console.log('\n=== AFTER API TRANSFORMATION ===');
    cases.forEach((c, index) => {
      console.log(`${index + 1}. Case: ${c.caseNumber}, Transformed Status: "${c.status}", Original: "${c.originalStatus}", Officer: ${c.officer}`);
    });

    // Count statuses
    const statusCounts = {};
    cases.forEach(c => {
      statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
    });

    console.log('\n=== STATUS BREAKDOWN (what frontend should see) ===');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`${status}: ${count} cases`);
    });

    console.log('\n=== SUMMARY ===');
    console.log(`Total cases: ${cases.length}`);
    console.log(`Open cases: ${statusCounts['open'] || 0}`);
    console.log(`In-progress cases: ${statusCounts['in-progress'] || 0}`);
    console.log(`Pending cases: ${statusCounts['pending'] || 0}`);
    console.log(`Closed cases: ${statusCounts['closed'] || 0}`);
    console.log(`Overdue cases: ${cases.filter(c => c.isOverdue).length}`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

testCaseStatusMapping();