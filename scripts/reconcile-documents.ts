import 'dotenv/config';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATEGORY_DISPLAY_MAP: Record<string, string> = {
  POLICY: 'Policies & Procedures',
  PROCEDURE: 'Policies & Procedures',
  FORM: 'Forms & Templates',
  REPORT: 'Reports',
  CONTRACT: 'Contracts & Agreements',
  INVOICE: 'Budget & Financial Documents',
  PRESENTATION: 'Presentations',
  SPREADSHEET: 'Data Collection & Analysis',
  IMAGE: 'Media & Creative Assets',
  VIDEO: 'Media & Creative Assets',
  AUDIO: 'Media & Creative Assets',
  ARCHIVE: 'Archived Records',
  OTHER: 'General Document',
};

const GENERAL_DEPARTMENT = 'General';

const normalize = (value?: string | null) => (value ? value.trim().toLowerCase() : '');

const toMetadataObject = (value: Prisma.JsonValue | null | undefined): Record<string, any> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return { ...(value as Record<string, any>) };
};

async function main() {
  const [documents, users, employees, departments, auditLogs] = await Promise.all([
    prisma.documents.findMany({
      where: {
        isDeleted: false,
      },
      include: {
        document_audit_logs: {
          where: {
            action: 'CREATED',
          },
          orderBy: {
            timestamp: 'asc',
          },
        },
      },
    }),
    prisma.users.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        department: true,
      },
    }),
    prisma.employees.findMany({
      select: {
        userId: true,
        email: true,
        department: true,
        departmentId: true,
        firstName: true,
        lastName: true,
      },
    }),
    prisma.departments.findMany({
      select: {
        id: true,
        name: true,
        parentId: true,
      },
    }),
    prisma.document_audit_logs.findMany({
      where: {
        action: 'CREATED',
      },
      select: {
        documentId: true,
        userId: true,
        timestamp: true,
      },
      orderBy: {
        timestamp: 'asc',
      },
    }),
  ]);

  const userById = new Map<string, (typeof users)[number]>();
  const userByEmail = new Map<string, (typeof users)[number]>();
  const userByName = new Map<string, (typeof users)[number]>();
  users.forEach((user) => {
    userById.set(user.id, user);
    if (user.email) {
      userByEmail.set(normalize(user.email), user);
    }
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    if (fullName) {
      userByName.set(normalize(fullName), user);
    }
  });

  const employeeByUserId = new Map<string, (typeof employees)[number]>();
  const employeeByEmail = new Map<string, (typeof employees)[number]>();
  const employeeByName = new Map<string, (typeof employees)[number]>();
  employees.forEach((employee) => {
    if (employee.userId) {
      employeeByUserId.set(employee.userId, employee);
    }
    if (employee.email) {
      employeeByEmail.set(normalize(employee.email), employee);
    }
    const fullName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
    if (fullName) {
      employeeByName.set(normalize(fullName), employee);
    }
  });

  const departmentById = new Map<string, (typeof departments)[number]>();
  const mainDepartmentByName = new Map<string, (typeof departments)[number]>();
  const subunitByName = new Map<string, { node: (typeof departments)[number]; parent: (typeof departments)[number] | null }>();

  departments.forEach((dept) => {
    departmentById.set(dept.id, dept);
    if (!dept.parentId) {
      mainDepartmentByName.set(normalize(dept.name), dept);
    } else {
      const parent = departments.find((candidate) => candidate.id === dept.parentId) || null;
      subunitByName.set(normalize(dept.name), { node: dept, parent });
    }
  });

  const auditByDocumentId = new Map<string, string>();
  auditLogs.forEach((log) => {
    if (log.userId && !auditByDocumentId.has(log.documentId)) {
      auditByDocumentId.set(log.documentId, log.userId);
    }
  });

  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
  let updatedCount = 0;
  let examinedCount = 0;

  for (const doc of documents) {
    examinedCount += 1;

    const metadata = toMetadataObject(doc.customMetadata);

    const originalDepartment = doc.department && doc.department !== 'Unknown Department' ? doc.department : null;
    const originalCategory = doc.category || (typeof metadata.category === 'string' ? metadata.category.toUpperCase() : null);

    let departmentName = originalDepartment;
    let departmentId = doc.departmentId || null;
    let subunitName: string | null = metadata.subunit || null;
    let categoryEnum = originalCategory || 'OTHER';

    const uploadedByRaw = typeof doc.uploadedBy === 'string' ? doc.uploadedBy : '';
    const normalizedUploadedBy = normalize(uploadedByRaw);

    let matchedUser: (typeof users)[number] | undefined;
    let matchedEmployee: (typeof employees)[number] | undefined;

    if (uploadedByRaw && uuidRegex.test(uploadedByRaw)) {
      matchedUser = userById.get(uploadedByRaw);
    }
    if (!matchedUser && normalizedUploadedBy.includes('@')) {
      matchedUser = userByEmail.get(normalizedUploadedBy);
    }
    if (!matchedUser && normalizedUploadedBy) {
      matchedUser = userByName.get(normalizedUploadedBy);
    }

    if (matchedUser) {
      matchedEmployee = employeeByUserId.get(matchedUser.id) || employeeByEmail.get(normalize(matchedUser.email || '')) || employeeByName.get(normalize(`${matchedUser.firstName || ''} ${matchedUser.lastName || ''}`));
    }

    if (!matchedEmployee && normalizedUploadedBy.includes('@')) {
      matchedEmployee = employeeByEmail.get(normalizedUploadedBy);
    }
    if (!matchedEmployee && normalizedUploadedBy) {
      matchedEmployee = employeeByName.get(normalizedUploadedBy);
    }

    if (!matchedUser || !matchedEmployee) {
      const auditUserId = auditByDocumentId.get(doc.id);
      if (auditUserId) {
        matchedUser = matchedUser || userById.get(auditUserId);
        matchedEmployee = matchedEmployee || employeeByUserId.get(auditUserId);
      }
    }

    if (!departmentName && matchedUser?.department) {
      departmentName = matchedUser.department;
    }

    if (!departmentName && matchedEmployee?.department) {
      departmentName = matchedEmployee.department;
    }

    if (!departmentId && matchedEmployee?.departmentId) {
      departmentId = matchedEmployee.departmentId;
    }

    if (!departmentName && departmentId) {
      const deptRecord = departmentById.get(departmentId);
      if (deptRecord) {
        if (deptRecord.parentId) {
          const parent = departmentById.get(deptRecord.parentId);
          departmentName = parent?.name || deptRecord.name;
          subunitName = deptRecord.name;
          departmentId = parent?.id || deptRecord.id;
        } else {
          departmentName = deptRecord.name;
        }
      }
    }

    if (!departmentName) {
      const normalizedName = matchedEmployee ? normalize(matchedEmployee.department) : matchedUser ? normalize(matchedUser.department) : null;
      if (normalizedName && subunitByName.has(normalizedName)) {
        const pair = subunitByName.get(normalizedName)!;
        departmentName = pair.parent?.name || pair.node.name;
        departmentId = pair.parent?.id || pair.node.id;
        subunitName = pair.parent ? pair.node.name : null;
      } else if (normalizedName && mainDepartmentByName.has(normalizedName)) {
        const mainDept = mainDepartmentByName.get(normalize(matchedEmployee?.department || matchedUser?.department || ''))!;
        departmentName = mainDept.name;
        departmentId = mainDept.id;
      }
    }

    if (!departmentName && uploadedByRaw) {
      const possible = normalize(uploadedByRaw);
      if (subunitByName.has(possible)) {
        const pair = subunitByName.get(possible)!;
        departmentName = pair.parent?.name || pair.node.name;
        departmentId = pair.parent?.id || pair.node.id;
        subunitName = pair.parent ? pair.node.name : null;
      } else if (mainDepartmentByName.has(possible)) {
        const dept = mainDepartmentByName.get(possible)!;
        departmentName = dept.name;
        departmentId = dept.id;
      }
    }

    if (!departmentName) {
      departmentName = GENERAL_DEPARTMENT;
    }

    if (!departmentId) {
      const normalizedDept = normalize(departmentName);
      if (mainDepartmentByName.has(normalizedDept)) {
        departmentId = mainDepartmentByName.get(normalizedDept)!.id;
      } else if (subunitByName.has(normalizedDept)) {
        const pair = subunitByName.get(normalizedDept)!;
        departmentId = pair.parent?.id || pair.node.id;
        if (!subunitName) {
          subunitName = pair.parent ? pair.node.name : null;
        }
      }
    }

    categoryEnum = categoryEnum || 'OTHER';
    if (!CATEGORY_DISPLAY_MAP[categoryEnum]) {
      categoryEnum = 'OTHER';
    }

    const categoryDisplay = metadata.categoryDisplay || CATEGORY_DISPLAY_MAP[categoryEnum] || categoryEnum;

    const folderSegments = [departmentName];
    if (subunitName) {
      folderSegments.push(subunitName);
    }
    folderSegments.push(categoryDisplay);
    const folderPath = folderSegments.join('/');

    const updatedMetadata = {
      ...metadata,
      department: departmentName,
      subunit: subunitName,
      categoryDisplay,
      reconciledAt: new Date().toISOString(),
      reconciledBy: 'scripts/reconcile-documents.ts',
    };

    const needsUpdate =
      doc.department !== departmentName ||
      doc.departmentId !== departmentId ||
      doc.folderPath !== folderPath ||
      doc.category !== categoryEnum ||
      doc.isPersonalRepo ||
      JSON.stringify(metadata) !== JSON.stringify(updatedMetadata);

    if (!needsUpdate) {
      continue;
    }

    await prisma.documents.update({
      where: { id: doc.id },
      data: {
        department: departmentName,
        departmentId: departmentId || undefined,
        category: categoryEnum as any,
        folderPath,
        customMetadata: updatedMetadata,
        isPersonalRepo: false,
      },
    });

    updatedCount += 1;
  }

  console.log(`Examined ${examinedCount} documents.`);
  console.log(`Updated ${updatedCount} documents with normalized department/category info.`);
}

main()
  .catch((error) => {
    console.error('Failed to reconcile documents:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

