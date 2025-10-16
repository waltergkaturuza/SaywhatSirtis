const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkAllJDs() {
  const emp = await prisma.employees.findUnique({ where: { email: 'tatenda@saywhat.org' } })
  const jds = await prisma.job_descriptions.findMany({ where: { employeeId: emp.id } })
  console.log('Job Descriptions for Tatenda:')
  jds.forEach(jd => {
    console.log(`  - ID: ${jd.id}`)
    console.log(`    isActive: ${jd.isActive}`)
    console.log(`    jobTitle: ${jd.jobTitle}`)
    console.log(`    keyResponsibilities: ${jd.keyResponsibilities ? 'EXISTS' : 'NULL'}`)
    console.log(`    createdAt: ${jd.createdAt}`)
    console.log('')
  })
  await prisma.$disconnect()
}

checkAllJDs()

