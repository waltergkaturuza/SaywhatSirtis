import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    
    const roles: string[] = (session.user as any)?.roles || []
    const canExport = roles.some(r => ["ADMIN","SUPER_ADMIN","SYSTEM_ADMINISTRATOR","ADVANCE_USER_2","HR","MEAL_ADMIN"].includes(r))
    if (!canExport) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

    const body = await req.json()
    const { format, projectId, dateRange, includeMetadata } = body

    // Get submissions data
    const submissions = await prisma.$queryRaw<any[]>`
      SELECT 
        ms.id,
        ms.form_id,
        ms.project_id,
        ms.submitted_at,
        ms.latitude,
        ms.longitude,
        ms.attachments,
        ms.data,
        ms.metadata,
        ms.device_info,
        mf.name as form_name,
        p.name as project_name,
        ms.user_email,
        ms.submitted_by
      FROM public.meal_submissions ms
      LEFT JOIN public.meal_forms mf ON ms.form_id::text = mf.id::text
      LEFT JOIN public.projects p ON ms.project_id::text = p.id::text
      ${projectId && projectId !== 'all' ? `WHERE ms.project_id = '${projectId}'` : ''}
      ORDER BY ms.submitted_at DESC
      LIMIT 1000
    `

    // Transform data based on format
    let exportData
    let contentType
    let filename

    switch (format) {
      case 'excel':
        // For Excel, we'll return structured JSON that can be converted to Excel on the frontend
        exportData = submissions.map(sub => ({
          'Submission ID': sub.id,
          'Form Name': sub.form_name,
          'Project': sub.project_name,
          'Submitted At': new Date(sub.submitted_at).toLocaleString(),
          'Submitted By': sub.submitted_by,
          'Email': sub.user_email,
          'Latitude': sub.latitude,
          'Longitude': sub.longitude,
          'GPS Accuracy': sub.metadata?.gps_accuracy || 'N/A',
          'Device Platform': sub.device_info?.platform || 'N/A',
          'Device OS': sub.device_info?.os || 'N/A',
          'Device Browser': sub.device_info?.browser || 'N/A',
          'IP Address': sub.metadata?.ip_address || 'N/A',
          'Country': sub.metadata?.country || 'N/A',
          'Region': sub.metadata?.region || 'N/A',
          'City': sub.metadata?.city || 'N/A',
          'Status': sub.metadata?.status || 'completed',
          'Data Size': JSON.stringify(sub.data || {}).length,
          'Has Attachments': sub.attachments ? 'Yes' : 'No',
          ...(includeMetadata ? {
            'Raw Data': JSON.stringify(sub.data || {}),
            'Metadata': JSON.stringify(sub.metadata || {}),
            'Device Info': JSON.stringify(sub.device_info || {})
          } : {})
        }))
        contentType = 'application/json'
        filename = `meal-export-${new Date().toISOString().split('T')[0]}.json`
        break

      case 'csv':
        // Convert to CSV format
        const csvHeaders = [
          'Submission ID', 'Form Name', 'Project', 'Submitted At', 'Submitted By', 'Email',
          'Latitude', 'Longitude', 'GPS Accuracy', 'Device Platform', 'Device OS', 'Device Browser',
          'IP Address', 'Country', 'Region', 'City', 'Status', 'Data Size', 'Has Attachments'
        ]
        
        const csvRows = submissions.map(sub => [
          sub.id,
          sub.form_name || '',
          sub.project_name || '',
          new Date(sub.submitted_at).toLocaleString(),
          sub.submitted_by || '',
          sub.user_email || '',
          sub.latitude || '',
          sub.longitude || '',
          sub.metadata?.gps_accuracy || 'N/A',
          sub.device_info?.platform || 'N/A',
          sub.device_info?.os || 'N/A',
          sub.device_info?.browser || 'N/A',
          sub.metadata?.ip_address || 'N/A',
          sub.metadata?.country || 'N/A',
          sub.metadata?.region || 'N/A',
          sub.metadata?.city || 'N/A',
          sub.metadata?.status || 'completed',
          JSON.stringify(sub.data || {}).length,
          sub.attachments ? 'Yes' : 'No'
        ])

        const csvContent = [csvHeaders, ...csvRows]
          .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
          .join('\n')
        
        exportData = csvContent
        contentType = 'text/csv'
        filename = `meal-export-${new Date().toISOString().split('T')[0]}.csv`
        break

      case 'pdf':
        // For PDF, return structured data that can be converted to PDF on the frontend
        exportData = {
          title: 'MEAL Data Export Report',
          generatedAt: new Date().toLocaleString(),
          generatedBy: session.user?.name || 'Unknown',
          totalRecords: submissions.length,
          summary: {
            totalSubmissions: submissions.length,
            uniqueForms: [...new Set(submissions.map(s => s.form_name))].length,
            uniqueProjects: [...new Set(submissions.map(s => s.project_name))].length,
            dateRange: {
              from: submissions.length > 0 ? new Date(Math.min(...submissions.map(s => new Date(s.submitted_at).getTime()))).toLocaleDateString() : 'N/A',
              to: submissions.length > 0 ? new Date(Math.max(...submissions.map(s => new Date(s.submitted_at).getTime()))).toLocaleDateString() : 'N/A'
            }
          },
          submissions: submissions.map(sub => ({
            id: sub.id,
            formName: sub.form_name,
            project: sub.project_name,
            submittedAt: new Date(sub.submitted_at).toLocaleString(),
            submittedBy: sub.submitted_by,
            location: sub.latitude && sub.longitude ? `${sub.latitude}, ${sub.longitude}` : 'N/A',
            status: sub.metadata?.status || 'completed'
          }))
        }
        contentType = 'application/json'
        filename = `meal-export-${new Date().toISOString().split('T')[0]}.json`
        break

      default:
        return NextResponse.json({ success: false, error: "Unsupported format" }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      data: exportData,
      contentType,
      filename,
      totalRecords: submissions.length,
      message: "Export generated successfully"
    })
  } catch (e) {
    console.error("MEAL export error", e)
    return NextResponse.json({ success: false, error: "Failed to generate export" }, { status: 500 })
  }
}
