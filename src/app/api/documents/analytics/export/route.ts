import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ExcelJS from 'exceljs';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'xlsx';
    const period = searchParams.get('period') || '12months';
    const departmentFilter = searchParams.get('department') || 'all';

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '1month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '24months':
        startDate.setFullYear(now.getFullYear() - 2);
        break;
      default:
        startDate.setFullYear(now.getFullYear() - 1);
    }

    const baseFilter: any = {
      isDeleted: false,
      isPersonalRepo: false,
      createdAt: {
        gte: startDate
      }
    };

    if (departmentFilter !== 'all') {
      baseFilter.department = departmentFilter;
    }

    // Fetch documents for export
    const documents = await prisma.documents.findMany({
      where: baseFilter,
      select: {
        id: true,
        originalName: true,
        category: true,
        classification: true,
        size: true,
        department: true,
        uploadedBy: true,
        viewCount: true,
        downloadCount: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Category summary
    const categoryGroups = await prisma.documents.groupBy({
      by: ['category'],
      where: baseFilter,
      _count: { category: true },
      _sum: { size: true }
    });

    // Department summary
    const departmentGroups = await prisma.documents.groupBy({
      by: ['department'],
      where: baseFilter,
      _count: { department: true },
      _sum: { size: true, viewCount: true, downloadCount: true }
    });

    if (format === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'SAYWHAT SIRTIS';
      workbook.created = new Date();

      // Summary Sheet
      const summarySheet = workbook.addWorksheet('Summary');
      summarySheet.columns = [
        { header: 'Metric', key: 'metric', width: 30 },
        { header: 'Value', key: 'value', width: 20 }
      ];

      summarySheet.addRows([
        { metric: 'Total Documents', value: documents.length },
        { metric: 'Total Size (GB)', value: (documents.reduce((sum, doc) => sum + doc.size, 0) / 1024 / 1024 / 1024).toFixed(2) },
        { metric: 'Average File Size (MB)', value: documents.length > 0 ? ((documents.reduce((sum, doc) => sum + doc.size, 0) / documents.length) / 1024 / 1024).toFixed(2) : 0 },
        { metric: 'Total Views', value: documents.reduce((sum, doc) => sum + (doc.viewCount || 0), 0) },
        { metric: 'Total Downloads', value: documents.reduce((sum, doc) => sum + (doc.downloadCount || 0), 0) },
        { metric: 'Period', value: period },
        { metric: 'Department Filter', value: departmentFilter },
        { metric: 'Generated', value: new Date().toISOString() }
      ]);

      summarySheet.getRow(1).font = { bold: true };
      summarySheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFf97316' }
      };

      // Documents Sheet
      const docsSheet = workbook.addWorksheet('Documents');
      docsSheet.columns = [
        { header: 'ID', key: 'id', width: 36 },
        { header: 'File Name', key: 'name', width: 40 },
        { header: 'Category', key: 'category', width: 20 },
        { header: 'Classification', key: 'classification', width: 15 },
        { header: 'Size (MB)', key: 'size', width: 12 },
        { header: 'Department', key: 'department', width: 30 },
        { header: 'Uploaded By', key: 'uploadedBy', width: 30 },
        { header: 'Views', key: 'views', width: 10 },
        { header: 'Downloads', key: 'downloads', width: 12 },
        { header: 'Created', key: 'created', width: 20 },
        { header: 'Updated', key: 'updated', width: 20 }
      ];

      docsSheet.addRows(
        documents.map(doc => ({
          id: doc.id,
          name: doc.originalName,
          category: doc.category || 'OTHER',
          classification: doc.classification || 'PUBLIC',
          size: (doc.size / 1024 / 1024).toFixed(2),
          department: doc.department || 'Unknown',
          uploadedBy: doc.uploadedBy || 'Unknown',
          views: doc.viewCount || 0,
          downloads: doc.downloadCount || 0,
          created: doc.createdAt.toISOString(),
          updated: doc.updatedAt.toISOString()
        }))
      );

      docsSheet.getRow(1).font = { bold: true };
      docsSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFf97316' }
      };

      // Categories Sheet
      const categoriesSheet = workbook.addWorksheet('Categories');
      categoriesSheet.columns = [
        { header: 'Category', key: 'category', width: 30 },
        { header: 'Document Count', key: 'count', width: 15 },
        { header: 'Total Size (MB)', key: 'size', width: 15 },
        { header: 'Percentage', key: 'percentage', width: 12 }
      ];

      categoriesSheet.addRows(
        categoryGroups.map(group => ({
          category: group.category || 'OTHER',
          count: group._count.category,
          size: ((group._sum.size || 0) / 1024 / 1024).toFixed(2),
          percentage: documents.length > 0 ? ((group._count.category / documents.length) * 100).toFixed(1) + '%' : '0%'
        }))
      );

      categoriesSheet.getRow(1).font = { bold: true };
      categoriesSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFf97316' }
      };

      // Departments Sheet
      const departmentsSheet = workbook.addWorksheet('Departments');
      departmentsSheet.columns = [
        { header: 'Department', key: 'department', width: 30 },
        { header: 'Document Count', key: 'count', width: 15 },
        { header: 'Total Size (MB)', key: 'size', width: 15 },
        { header: 'Total Views', key: 'views', width: 12 },
        { header: 'Total Downloads', key: 'downloads', width: 15 }
      ];

      departmentsSheet.addRows(
        departmentGroups.map(group => ({
          department: group.department || 'Unknown',
          count: group._count.department,
          size: ((group._sum.size || 0) / 1024 / 1024).toFixed(2),
          views: group._sum.viewCount || 0,
          downloads: group._sum.downloadCount || 0
        }))
      );

      departmentsSheet.getRow(1).font = { bold: true };
      departmentsSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFf97316' }
      };

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="document-analytics-${period}-${new Date().toISOString().split('T')[0]}.xlsx"`
        }
      });
    }

    return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });

  } catch (error) {
    console.error('Error exporting analytics:', error);
    return NextResponse.json(
      { error: 'Failed to export analytics' },
      { status: 500 }
    );
  }
}

