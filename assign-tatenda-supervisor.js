const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function assignSupervisor() {
  try {
    // Get Tatenda
    const tatenda = await prisma.employees.findUnique({
      where: { email: 'tatenda@saywhat.org' },
      select: { id: true, firstName: true, lastName: true, supervisor_id: true }
    });

    // Get Isabella
    const isabella = await prisma.employees.findUnique({
      where: { email: 'isabella@saywhat.org' },
      select: { id: true, firstName: true, lastName: true }
    });

    console.log('Tatenda:', tatenda);
    console.log('Isabella:', isabella);

    if (tatenda && isabella) {
      const updated = await prisma.employees.update({
        where: { id: tatenda.id },
        data: { supervisor_id: isabella.id }
      });

      console.log(`\n✅ Assigned ${isabella.firstName} ${isabella.lastName} as supervisor for ${tatenda.firstName} ${tatenda.lastName}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignSupervisor();

