const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkType() {
  const e = await prisma.employees.findUnique({ where: { email: 'tatenda@saywhat.org' } })
  const j = await prisma.job_descriptions.findFirst({ where: { employeeId: e.id, isActive: true } })
  
  console.log('keyResponsibilities Type:', typeof j.keyResponsibilities)
  console.log('Is Array?:', Array.isArray(j.keyResponsibilities))
  console.log('Value:', j.keyResponsibilities)
  
  await prisma.$disconnect()
}

checkType()

