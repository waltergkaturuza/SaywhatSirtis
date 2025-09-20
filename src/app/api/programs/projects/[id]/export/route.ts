import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: projectId } = await params

    // Get the project
    const project = await prisma.projects.findUnique({
      where: { id: projectId },
      include: {
        activities: true
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Create Excel workbook
    const workbook = XLSX.utils.book_new()

    // Project Overview Sheet
    const projectData = [
      ['Project Name', project.name],
      ['Description', project.description || ''],
      ['Status', project.status],
      ['Created At', project.createdAt.toISOString().split('T')[0]],
      ['Updated At', project.updatedAt.toISOString().split('T')[0]]
    ]
    const projectSheet = XLSX.utils.aoa_to_sheet(projectData)
    XLSX.utils.book_append_sheet(workbook, projectSheet, 'Project Overview')

    // Activities Sheet (if available)
    if (project.activities && project.activities.length > 0) {
      const activitiesData = [
        ['Activity', 'Description', 'Status', 'Date'],
        ...project.activities.map(activity => [
          activity.title || 'Activity',
          activity.description || '',
          activity.status || '',
          activity.createdAt ? activity.createdAt.toISOString().split('T')[0] : ''
        ])
      ]
      const activitiesSheet = XLSX.utils.aoa_to_sheet(activitiesData)
      XLSX.utils.book_append_sheet(workbook, activitiesSheet, 'Activities')
    }

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Set headers for file download
    const headers = new Headers()
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    headers.set('Content-Disposition', `attachment; filename="${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_export.xlsx"`)

    return new NextResponse(excelBuffer, {
      status: 200,
      headers
    })

  } catch (error) {
    console.error('Error exporting project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}