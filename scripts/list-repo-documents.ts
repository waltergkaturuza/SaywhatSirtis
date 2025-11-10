import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const documents = await prisma.documents.findMany({
    where: {
      isDeleted: false,
    },
    select: {
      id: true,
      originalName: true,
      department: true,
      departmentId: true,
      category: true,
      folderPath: true,
      isPersonalRepo: true,
      uploadedBy: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 25,
  });

  if (documents.length === 0) {
    console.log('No documents found.');
    return;
  }

  console.table(
    documents.map((doc) => ({
      id: doc.id,
      name: doc.originalName,
      dept: doc.department,
      deptId: doc.departmentId,
      category: doc.category,
      folderPath: doc.folderPath,
      personal: doc.isPersonalRepo,
      uploadedBy: doc.uploadedBy,
      createdAt: doc.createdAt.toISOString(),
    })),
  );
}

main()
  .catch((error) => {
    console.error('Failed to list documents', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

