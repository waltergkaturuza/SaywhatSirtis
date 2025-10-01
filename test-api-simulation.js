// Direct test of the API endpoint logic without HTTP calls
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testApiLogic() {
  try {
    console.log('=== TESTING API LOGIC ===');
    
    // Simulate the session user (this is what will be in the session after login)
    const mockSession = {
      user: {
        permissions: [],
        roles: ['ADMIN', 'SUPER_USER'],
        role: 'SYSTEM_ADMINISTRATOR'
      }
    };

    // Test permission check
    const hasPermission = mockSession.user.permissions?.includes('calls.view') ||
      mockSession.user.permissions?.includes('calls.full_access') ||
      mockSession.user.roles?.some(role => ['admin', 'manager', 'super_user'].includes(role.toLowerCase())) ||
      ['system_administrator', 'admin', 'manager'].includes(mockSession.user.role?.toLowerCase());

    console.log('Permission check result:', hasPermission);

    if (!hasPermission) {
      console.log('❌ Would return 403 Forbidden');
      await prisma.$disconnect();
      return;
    }

    // Test database query
    console.log('✅ Permission granted, querying database...');
    
    const calls = await prisma.call_records.findMany({
      where: {
        assignedOfficer: {
          not: null
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5 // Just get a few for testing
    });

    console.log(`Found ${calls.length} call records`);
    
    // Test transformation logic
    const cases = calls.map(call => ({
      id: call.id,
      caseNumber: call.caseNumber || `CASE-${new Date().getFullYear()}-${String(call.id).padStart(8, '0')}`,
      caller: call.callerName || 'Unknown',
      category: call.category || 'General',
      priority: call.priority || 'medium',
      status: call.status?.toLowerCase() || 'open',
      description: call.summary || call.notes || 'No description available',
      assignedTo: call.assignedOfficer || 'Unassigned',
      createdAt: call.createdAt,
      updatedAt: call.updatedAt
    }));

    console.log('Transformed cases:');
    cases.forEach((case_, index) => {
      console.log(`${index + 1}. ${case_.caseNumber} - Status: ${case_.status} - Officer: ${case_.assignedTo}`);
    });

    // Test statistics calculation (same as frontend)
    const stats = {
      total: cases.length,
      open: cases.filter(c => c.status === 'open').length,
      inProgress: cases.filter(c => c.status === 'in-progress').length,
      pending: cases.filter(c => c.status === 'pending').length,
      closed: cases.filter(c => c.status === 'closed').length,
      overdue: cases.filter(c => {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        return new Date(c.createdAt) < threeDaysAgo && ['open', 'in-progress'].includes(c.status);
      }).length
    };

    console.log('\n=== EXPECTED STATISTICS ===');
    console.log('Total:', stats.total);
    console.log('Open:', stats.open);
    console.log('In Progress:', stats.inProgress);
    console.log('Pending:', stats.pending);
    console.log('Closed:', stats.closed);
    console.log('Overdue:', stats.overdue);

    await prisma.$disconnect();
    
  } catch (error) {
    console.error('Error testing API logic:', error);
    await prisma.$disconnect();
  }
}

testApiLogic();