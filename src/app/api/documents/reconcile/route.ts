import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const GENERAL_DEPARTMENT = 'General';
const GENERAL_CATEGORY_ENUM = 'OTHER';
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
  OTHER: 'General Document'
};

function normalizeString(value?: string | null) {
  return value ? value.trim().toLowerCase() : '';
}

function buildFolderPath(department: string, subunit: string | null, categoryDisplay: string) {
  const parts = [department];
  if (subunit) parts.push(subunit);
  parts.push(categoryDisplay);
  return parts.join('/');
}

function mergeMetadata(base: any, patch: Record<string, any>) {
  const parsed = typeof base === 'object' && base !== null ? base : {};
  return { ...parsed, ...patch };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const roles = Array.isArray(session.user.roles) ? session.user.roles : [];
    const isAdmin = roles.includes('admin') || session.user.role === 'admin';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin permissions required' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const dryRun = Boolean(body?.dryRun);

    const [documents, departments, users, employees, auditLogs] = await Promise.all([
      prisma.documents.findMany({
        select: {
          id: true,
          department: true,
          departmentId: true,
          category: true,
          folderPath: true,
          customMetadata: true,
          uploadedBy: true
        }
      }),
      prisma.departments.findMany({
        select: { id: true, name: true, parentId: true }
      }),
      prisma.users.findMany({
        select: { id: true, email: true, firstName: true, lastName: true, department: true }
      }),
      prisma.employees.findMany({
        select: { userId: true, email: true, department: true, departmentId: true, firstName: true, lastName: true }
      }),
      prisma.document_audit_logs.findMany({
        where: {
          action: { in: ['CREATED', 'UPLOADED'] as any }
        },
        select: {
          documentId: true,
          userId: true,
          action: true
        }
      })
    ]);

    const auditByDocumentId = new Map<string, string>();
    auditLogs.forEach((log) => {
      if (!auditByDocumentId.has(log.documentId) && log.userId) {
        auditByDocumentId.set(log.documentId, log.userId);
      }
    });

    const departmentById = new Map<string, { id: string; name: string; parentId: string | null }>();
    const mainDepartmentByName = new Map<string, { id: string; name: string }>();
    const subunitByName = new Map<string, { id: string; name: string; parentName?: string }>();

    departments.forEach((dept) => {
      departmentById.set(dept.id, dept);
      if (!dept.parentId) {
        mainDepartmentByName.set(normalizeString(dept.name), { id: dept.id, name: dept.name });
      } else {
        const parent = departments.find((p) => p.id === dept.parentId);
        subunitByName.set(normalizeString(dept.name), {
          id: dept.id,
          name: dept.name,
          parentName: parent?.name
        });
      }
    });

    const userByEmail = new Map<string, (typeof users)[number]>();
    const userByName = new Map<string, (typeof users)[number]>();
    users.forEach((user) => {
      if (user.email) {
        userByEmail.set(normalizeString(user.email), user);
      }
      if (user.firstName || user.lastName) {
        const full = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        if (full) {
          userByName.set(normalizeString(full), user);
        }
      }
    });

    const employeeByEmail = new Map<string, (typeof employees)[number]>();
    const employeeByName = new Map<string, (typeof employees)[number]>();
    const employeeByUserId = new Map<string, (typeof employees)[number]>();
    employees.forEach((employee) => {
      if (employee.email) {
        employeeByEmail.set(normalizeString(employee.email), employee);
      }
      if (employee.firstName || employee.lastName) {
        const full = `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
        if (full) {
          employeeByName.set(normalizeString(full), employee);
        }
      }
      if (employee.userId) {
        employeeByUserId.set(employee.userId, employee);
      }
    });

    const categoryFolderMap = CATEGORY_DISPLAY_MAP;

    const reconcileRecords: Array<{
      id: string;
      finalDepartment: string;
      finalDepartmentId: string | null;
      finalSubunit: string | null;
      finalCategoryEnum: string;
      finalCategoryDisplay: string;
      finalFolderPath: string;
      finalMetadata: Record<string, any>;
      changed: boolean;
    }> = [];

    documents.forEach((doc) => {
      let departmentName = doc.department && doc.department !== 'Unknown Department' ? doc.department : null;
      let categoryEnum = doc.category || GENERAL_CATEGORY_ENUM;
      let subunitName: string | null = null;
      let departmentId: string | null = doc.departmentId || null;

      const normalizedUploadedBy = normalizeString(doc.uploadedBy);
      let matchedUser = normalizedUploadedBy.includes('@') ? userByEmail.get(normalizedUploadedBy) : undefined;
      if (!matchedUser && normalizedUploadedBy) {
        matchedUser = userByName.get(normalizedUploadedBy);
      }

      let matchedEmployee: (typeof employees)[number] | undefined;
      if (matchedUser && employeeByUserId.has(matchedUser.id)) {
        matchedEmployee = employeeByUserId.get(matchedUser.id);
      }
      if (!matchedEmployee && normalizedUploadedBy.includes('@')) {
        matchedEmployee = employeeByEmail.get(normalizedUploadedBy);
      }
      if (!matchedEmployee && normalizedUploadedBy) {
        matchedEmployee = employeeByName.get(normalizedUploadedBy);
      }

      if (!matchedUser) {
        const auditUserId = auditByDocumentId.get(doc.id);
        if (auditUserId) {
          matchedUser = users.find((user) => user.id === auditUserId) || matchedUser;
        }
      }
      if (!matchedEmployee) {
        const auditUserId = auditByDocumentId.get(doc.id);
        if (auditUserId) {
          matchedEmployee = employeeByUserId.get(auditUserId) || matchedEmployee;
        }
      }

      if (!departmentName && matchedUser?.department) {
        departmentName = matchedUser.department;
      }
      if (!departmentName && matchedEmployee?.department) {
        departmentName = matchedEmployee.department;
      }

      if (departmentName) {
        const normalizedDeptName = normalizeString(departmentName);
        const mainDept = mainDepartmentByName.get(normalizedDeptName);
        const subunitDept = subunitByName.get(normalizedDeptName);
        if (subunitDept) {
          subunitName = subunitDept.name;
          departmentName = subunitDept.parentName || departmentName;
          departmentId = subunitDept.id;
        } else if (mainDept) {
          departmentId = mainDept.id;
        }
      }

      if (!departmentName && departmentId) {
        const deptRecord = departmentById.get(departmentId);
        if (deptRecord) {
          if (deptRecord.parentId) {
            const parent = departmentById.get(deptRecord.parentId);
            subunitName = deptRecord.name;
            departmentName = parent?.name || deptRecord.name;
            departmentId = deptRecord.id;
          } else {
            departmentName = deptRecord.name;
          }
        }
      }

      if (!departmentName && matchedEmployee?.departmentId) {
        const deptRecord = departmentById.get(matchedEmployee.departmentId);
        if (deptRecord) {
          if (deptRecord.parentId) {
            const parent = departmentById.get(deptRecord.parentId);
            subunitName = deptRecord.name;
            departmentName = parent?.name || deptRecord.name;
            departmentId = deptRecord.id;
          } else {
            departmentName = deptRecord.name;
            departmentId = deptRecord.id;
          }
        }
      }

      if (!departmentName) {
        departmentName = GENERAL_DEPARTMENT;
      }

      if (!categoryEnum) {
        categoryEnum = GENERAL_CATEGORY_ENUM;
      }

      const customCategoryDisplay = (doc.customMetadata as any)?.categoryDisplay as string | undefined;
      const categoryDisplay = customCategoryDisplay || categoryFolderMap[categoryEnum] || categoryEnum || CATEGORY_DISPLAY_MAP[GENERAL_CATEGORY_ENUM];
      const folderPath = buildFolderPath(departmentName, subunitName, categoryDisplay);
      const metadataPatch = {
        reconciledAt: new Date().toISOString(),
        department: departmentName,
        subunit: subunitName,
        categoryDisplay
      };
      const finalMetadata = mergeMetadata(doc.customMetadata, metadataPatch);

      const changed =
        departmentName !== doc.department ||
        categoryEnum !== (doc.category || GENERAL_CATEGORY_ENUM) ||
        folderPath !== (doc.folderPath || '') ||
        JSON.stringify(finalMetadata) !== JSON.stringify(doc.customMetadata || {});

      reconcileRecords.push({
        id: doc.id,
        finalDepartment: departmentName,
        finalDepartmentId: departmentId,
        finalSubunit: subunitName,
        finalCategoryEnum: categoryEnum,
        finalCategoryDisplay: categoryDisplay,
        finalFolderPath: folderPath,
        finalMetadata,
        changed
      });
    });

    if (!dryRun) {
      const updates = reconcileRecords.filter((record) => record.changed);
      if (updates.length > 0) {
        await prisma.$transaction(
          updates.map((record) =>
            prisma.documents.update({
              where: { id: record.id },
              data: {
                department: record.finalDepartment,
                departmentId: record.finalDepartmentId || undefined,
                category: record.finalCategoryEnum as any,
                folderPath: record.finalFolderPath,
                customMetadata: record.finalMetadata,
                isPersonalRepo: false
              }
            })
          )
        );
      }

      const aggregates = new Map<string, { department: string; category: string; metadata: Record<string, any>; count: number }>();
      reconcileRecords.forEach((record) => {
        const path = record.finalFolderPath;
        const key = path;
        const existing = aggregates.get(key);
        const categoryLabel = record.finalSubunit
          ? `${record.finalSubunit} / ${record.finalCategoryDisplay}`
          : record.finalCategoryDisplay;
        if (existing) {
          existing.count += 1;
        } else {
          aggregates.set(key, {
            department: record.finalDepartment,
            category: categoryLabel,
            metadata: {
              subunit: record.finalSubunit,
              categoryDisplay: record.finalCategoryDisplay
            },
            count: 1
          });
        }
      });

      await prisma.$transaction(
        Array.from(aggregates.entries()).map(([path, info]) =>
          prisma.document_category_folders.upsert({
            where: { path },
            update: {
              department: info.department,
              category: info.category,
              documentCount: info.count,
              metadata: info.metadata,
              isActive: true
            },
            create: {
              path,
              department: info.department,
              category: info.category,
              documentCount: info.count,
              metadata: info.metadata
            }
          })
        )
      );
    }

    const totalDocuments = documents.length;
    const updatedDocuments = reconcileRecords.filter((record) => record.changed).length;

    return NextResponse.json({
      success: true,
      dryRun,
      totalDocuments,
      updatedDocuments,
      examples: reconcileRecords.slice(0, 5)
    });
  } catch (error) {
    console.error('Error reconciling documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
