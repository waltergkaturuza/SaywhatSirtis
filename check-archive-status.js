// Check employee archive status and audit log issues
const { PrismaClient } = require('@prisma/client')

async function checkArchiveStatus() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🗂️ Checking Employee Archive Status...')
    console.log('=' .repeat(45))
    
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Check all employees (active and archived)
    console.log('\n📋 All Employees Status:')
    console.log('-' .repeat(30))
    
    const allEmployees = await prisma.employees.findMany({
      select: {
        id: true,
        employeeId: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
        archived_at: true,
        archive_reason: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`Total employees found: ${allEmployees.length}`)
    console.log('')
    
    allEmployees.forEach((emp, index) => {
      const statusIcon = emp.status === 'ACTIVE' ? '✅' : emp.status === 'ARCHIVED' ? '📦' : '❓'
      const archivedInfo = emp.archived_at ? `(Archived: ${emp.archived_at.toISOString().split('T')[0]})` : ''
      
      console.log(`${index + 1}. ${statusIcon} ${emp.employeeId} - ${emp.firstName} ${emp.lastName}`)
      console.log(`   Email: ${emp.email}`)
      console.log(`   Status: ${emp.status} ${archivedInfo}`)
      console.log(`   Archive Reason: ${emp.archive_reason || 'N/A'}`)
      console.log(`   Created: ${emp.createdAt.toISOString().split('T')[0]}`)
      console.log(`   Updated: ${emp.updatedAt.toISOString().split('T')[0]}`)
      console.log('')
    })
    
    // Check specifically for archived employees
    const archivedEmployees = allEmployees.filter(emp => emp.status === 'ARCHIVED')
    const activeEmployees = allEmployees.filter(emp => emp.status === 'ACTIVE')
    
    console.log('📊 Summary:')
    console.log(`   Active Employees: ${activeEmployees.length}`)
    console.log(`   Archived Employees: ${archivedEmployees.length}`)
    console.log(`   Total: ${allEmployees.length}`)
    
    if (archivedEmployees.length > 0) {
      console.log('\n📦 Archived Employees Details:')
      console.log('-' .repeat(35))
      
      archivedEmployees.forEach((emp, index) => {
        console.log(`${index + 1}. ${emp.employeeId} - ${emp.firstName} ${emp.lastName}`)
        console.log(`   Archived At: ${emp.archived_at}`)
        console.log(`   Archive Reason: ${emp.archive_reason}`)
        console.log('')
      })
    }
    
    // Check audit logs issue
    console.log('🔍 Checking Audit Log Issue:')
    console.log('-' .repeat(30))
    
    try {
      const recentAuditLogs = await prisma.audit_logs.findMany({
        where: {
          action: 'ARCHIVE_EMPLOYEE'
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
      
      console.log(`Found ${recentAuditLogs.length} archive audit logs`)
      
      if (recentAuditLogs.length > 0) {
        recentAuditLogs.forEach((log, index) => {
          console.log(`${index + 1}. Action: ${log.action} | User: ${log.userId} | Resource: ${log.resourceId}`)
        })
      }
      
    } catch (auditError) {
      console.log('❌ Audit log check failed:', auditError.message)
      
      // Check if audit_logs table exists and userId field
      try {
        const auditLogCount = await prisma.audit_logs.count()
        console.log(`Audit logs table accessible, total records: ${auditLogCount}`)
      } catch (tableError) {
        console.log('❌ Audit logs table issue:', tableError.message)
      }
    }
    
    // Check users table for valid user IDs
    console.log('\n👤 Checking Valid User IDs:')
    console.log('-' .repeat(30))
    
    try {
      const users = await prisma.users.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true
        },
        take: 10
      })
      
      console.log(`Found ${users.length} users:`)
      users.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id} | ${user.firstName} ${user.lastName} (${user.email})`)
      })
      
    } catch (userError) {
      console.log('❌ Users check failed:', userError.message)
    }
    
    // Test specific employee ID from logs
    console.log('\n🎯 Checking Specific Employee from Logs:')
    console.log('-' .repeat(40))
    
    const targetEmployeeId = 'emp-1757860677238-3'
    
    try {
      const targetEmployee = await prisma.employees.findFirst({
        where: { id: targetEmployeeId },
        select: {
          id: true,
          employeeId: true,
          firstName: true,
          lastName: true,
          status: true,
          archived_at: true,
          archive_reason: true
        }
      })
      
      if (targetEmployee) {
        console.log(`✅ Found employee: ${targetEmployee.employeeId}`)
        console.log(`   Name: ${targetEmployee.firstName} ${targetEmployee.lastName}`)
        console.log(`   Status: ${targetEmployee.status}`)
        console.log(`   Archived: ${targetEmployee.archived_at ? 'Yes' : 'No'}`)
        console.log(`   Archive Reason: ${targetEmployee.archive_reason || 'N/A'}`)
      } else {
        console.log('❌ Target employee not found')
      }
      
    } catch (targetError) {
      console.log('❌ Target employee check failed:', targetError.message)
    }
    
  } catch (error) {
    console.error('❌ Check Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkArchiveStatus()
