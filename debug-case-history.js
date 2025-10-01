const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCaseHistory() {
  try {
    const caseId = '08c8908b-df2c-400a-bb51-934ed08bc0cd';
    
    console.log('Checking case ID:', caseId);
    
    // Check if case exists
    const caseRecord = await prisma.call_records.findFirst({
      where: {
        OR: [
          { id: caseId },
          { caseNumber: caseId }
        ]
      },
      select: {
        id: true,
        caseNumber: true,
        callerName: true,
        status: true,
        createdAt: true
      }
    });
    
    console.log('Case found:', caseRecord ? 'YES' : 'NO');
    if (caseRecord) {
      console.log('Case details:', JSON.stringify(caseRecord, null, 2));
      
      // Check audit logs for this case
      const auditLogs = await prisma.audit_logs.findMany({
        where: {
          resource: 'CASE',
          resourceId: caseRecord.id
        },
        orderBy: {
          timestamp: 'desc'
        },
        take: 5
      });
      
      console.log('\nAudit logs found:', auditLogs.length);
      auditLogs.forEach((log, i) => {
        console.log(`Log ${i+1}:`, {
          action: log.action,
          timestamp: log.timestamp,
          userId: log.userId,
          details: typeof log.details === 'object' ? JSON.stringify(log.details) : log.details
        });
      });
    } else {
      console.log('Case not found. Let\'s check all cases to see available IDs...');
      
      const allCases = await prisma.call_records.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          caseNumber: true,
          callerName: true,
          status: true
        }
      });
      
      console.log('\nRecent cases:');
      allCases.forEach((c, i) => {
        console.log(`${i+1}. ID: ${c.id}, Case#: ${c.caseNumber}, Caller: ${c.callerName}`);
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCaseHistory();