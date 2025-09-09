const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllTables() {
  try {
    console.log('Checking all database tables for data...');
    
    // Check users
    const users = await prisma.user.count().catch(() => 0);
    console.log('User count:', users);
    
    // Check call records
    const callRecords = await prisma.callRecord.count().catch(() => 0);
    console.log('Call record count:', callRecords);
    
    // Check projects
    const projects = await prisma.project.count().catch(() => 0);
    console.log('Project count:', projects);
    
    // Check audit logs
    const auditLogs = await prisma.auditLog.count().catch(() => 0);
    console.log('Audit log count:', auditLogs);
    
    // Check employees
    const employees = await prisma.employee.count().catch(() => 0);
    console.log('Employee count:', employees);
    
    // Check departments
    const departments = await prisma.department.count().catch(() => 0);
    console.log('Department count:', departments);
    
    // Check events/trainings
    const events = await prisma.event.count().catch(() => 0);
    console.log('Event count:', events);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Database check error:', error.message);
  }
}

checkAllTables();
