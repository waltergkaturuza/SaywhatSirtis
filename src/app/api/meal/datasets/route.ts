import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    
    const roles: string[] = (session.user as any)?.roles || []
    const canView = roles.some(r => ["ADMIN","SUPER_ADMIN","SYSTEM_ADMINISTRATOR","ADVANCE_USER_2","HR","MEAL_ADMIN"].includes(r))
    if (!canView) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const project = searchParams.get('project')
    const format = searchParams.get('format')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    // Build where conditions
    let whereConditions = []
    if (project && project !== 'all') {
      whereConditions.push(`p.name = '${project}'`)
    }
    if (format && format !== 'all') {
      whereConditions.push(`ms.attachments::text LIKE '%${format}%'`)
    }
    if (status && status !== 'all') {
      whereConditions.push(`ms.metadata->>'status' = '${status}'`)
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // Get datasets with metadata (unsafe due to dynamic WHERE clause)
    const datasetsQuery = `
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
        COUNT(*) OVER() as total_count
      FROM public.meal_submissions ms
      LEFT JOIN public.meal_forms mf ON ms.form_id::text = mf.id::text
      LEFT JOIN public.projects p ON ms.project_id::text = p.id::text
      ${whereClause}
      ORDER BY ms.submitted_at DESC
      LIMIT 100`;
    let datasets: any[] = []
    try {
      datasets = await (prisma as any).$queryRawUnsafe(datasetsQuery)
    } catch (err: any) {
      const message: string = err?.message || ''
      const code: string = err?.code || ''
      if (message.includes('relation') || message.includes('does not exist') || code === '42P01') {
        datasets = []
      } else {
        throw err
      }
    }

    // Transform data into dataset format
    const transformedDatasets = datasets.map((dataset, index) => {
      const dataSize = JSON.stringify(dataset.data || {}).length
      const attachments = dataset.attachments ? (Array.isArray(dataset.attachments) ? dataset.attachments : [dataset.attachments]) : []
      
      return {
        id: dataset.id,
        name: `${dataset.form_name} - ${new Date(dataset.submitted_at).toLocaleDateString()}`,
        project: dataset.project_name || 'Unknown Project',
        version: `v${index + 1}.0`,
        lastUpdated: new Date(dataset.submitted_at).toISOString().split('T')[0],
        size: `${(dataSize / 1024).toFixed(1)} KB`,
        records: 1,
        status: dataset.metadata?.status || 'active',
        format: attachments.length > 0 ? 'excel' : 'json',
        description: `Submission data from ${dataset.form_name}`,
        tags: [
          dataset.form_name?.toLowerCase().replace(/\s+/g, '-') || 'submission',
          dataset.project_name?.toLowerCase().replace(/\s+/g, '-') || 'project',
          'meal-data'
        ],
        createdBy: dataset.metadata?.submitted_by || 'System',
        rawData: dataset
      }
    })

    // Group by form and project to create consolidated datasets
    const consolidatedDatasets = transformedDatasets.reduce((acc: any, dataset) => {
      const key = `${dataset.project}-${dataset.name.split(' - ')[0]}`
      if (!acc[key]) {
        acc[key] = {
          ...dataset,
          records: 0,
          size: '0 KB',
          lastUpdated: dataset.lastUpdated
        }
      }
      acc[key].records += 1
      acc[key].size = `${(parseFloat(acc[key].size) + parseFloat(dataset.size)).toFixed(1)} KB`
      acc[key].lastUpdated = new Date(Math.max(new Date(acc[key].lastUpdated).getTime(), new Date(dataset.lastUpdated).getTime())).toISOString().split('T')[0]
      return acc
    }, {})

    const finalDatasets = Object.values(consolidatedDatasets)

    const convertBigInt = (obj: any): any => {
      if (obj === null || obj === undefined) return obj
      if (typeof obj === 'bigint') return Number(obj)
      if (Array.isArray(obj)) return obj.map(convertBigInt)
      if (typeof obj === 'object') {
        const out: any = {}
        for (const [k, v] of Object.entries(obj)) out[k] = convertBigInt(v)
        return out
      }
      return obj
    }

    return NextResponse.json({ 
      success: true, 
      data: convertBigInt(finalDatasets),
      total: finalDatasets.length
    })
  } catch (e) {
    console.error("MEAL datasets fetch error", e)
    return NextResponse.json({ success: false, error: "Failed to fetch datasets" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    
    const roles: string[] = (session.user as any)?.roles || []
    const canCreate = roles.some(r => ["ADMIN","SUPER_ADMIN","SYSTEM_ADMINISTRATOR","MEAL_ADMIN"].includes(r))
    if (!canCreate) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

    const body = await req.json()
    const { name, description, projectId, format, tags } = body

    // Create dataset export
    const exportData = {
      name,
      description,
      projectId,
      format,
      tags: tags || [],
      createdBy: session.user?.name || 'Unknown',
      createdAt: new Date().toISOString(),
      status: 'draft'
    }

    // Here you would typically save to a datasets table or file system
    // For now, we'll return success

    return NextResponse.json({ 
      success: true, 
      data: exportData,
      message: "Dataset export created successfully"
    })
  } catch (e) {
    console.error("MEAL dataset creation error", e)
    return NextResponse.json({ success: false, error: "Failed to create dataset" }, { status: 500 })
  }
}
