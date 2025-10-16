const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getReviewerUserId() {
  try {
    // Get Nontsikelelo's employee record to find their userId
    const reviewer = await prisma.employees.findUnique({
      where: { email: 'nontsikelelo@saywhat.org' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        userId: true,
        users: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    console.log('Reviewer (Nontsikelelo):', reviewer);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getReviewerUserId();

