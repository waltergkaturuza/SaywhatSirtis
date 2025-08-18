import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"



export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ 
        success: false,
        error: "Authentication required", 
        message: "Please log in to create projects. Visit /auth/signin to authenticate.",
        code: "UNAUTHORIZED"
      }, { status: 401 })
    }

    // Check if request is FormData (from enhanced form) or JSON (legacy)
    const contentType = request.headers.get('content-type')
    let body: any
    
    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData()
      
      // Parse enhanced form data
      body = {
        projectCode: formData.get('projectCode') as string,
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        projectLead: formData.get('projectLead') as string,
        categories: JSON.parse(formData.get('categories') as string || '[]'),
        startDate: formData.get('startDate') as string,
        endDate: formData.get('endDate') as string,
        country: formData.get('country') as string,
        province: formData.get('province') as string || '',
        fundingSource: formData.get('fundingSource') as string,
        grantsERequisiteIntegration: formData.get('grantsERequisiteIntegration') === 'true',
        objectives: JSON.parse(formData.get('objectives') as string || '[]'),
        implementingOrganizations: JSON.parse(formData.get('implementingOrganizations') as string || '[]'),
        reportingFrequencies: JSON.parse(formData.get('reportingFrequencies') as string || '[]'),
        methodologies: JSON.parse(formData.get('methodologies') as string || '[]'),
        budgetBreakdownFile: formData.get('budgetBreakdownFile') as File | null
      }
    } else {
      body = await request.json()
    }
    
    // Enhanced validation for new form fields
    if (!body.name || !body.description || !body.startDate || !body.endDate || !body.country) {
      return NextResponse.json({ 
        success: false,
        error: "Missing required fields: name, description, startDate, endDate, and country are required" 
      }, { status: 400 })
    }

    // Additional validation for enhanced form
    if (body.projectCode && !body.projectLead) {
      return NextResponse.json({ 
        success: false,
        error: "Project lead is required when project code is provided" 
      }, { status: 400 })
    }

    if (body.categories && body.categories.length === 0) {
      return NextResponse.json({ 
        success: false,
        error: "At least one project category must be selected" 
      }, { status: 400 })
    }

    // Handle budget file info
    let budgetFileInfo = null
    if (body.budgetBreakdownFile) {
      budgetFileInfo = {
        name: body.budgetBreakdownFile.name,
        size: body.budgetBreakdownFile.size,
        type: body.budgetBreakdownFile.type
      }
    }

    // Create the project in the database with available fields
    const project = await prisma.project.create({
      data: {
        name: body.name,
        description: body.description,
        timeframe: body.timeframe || `${body.startDate} to ${body.endDate}`,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        country: body.country,
        province: body.province || null,
        objectives: JSON.stringify({
          // Store enhanced objectives structure in the existing JSON field
          projectCode: body.projectCode || null,
          projectLead: body.projectLead || null,
          categories: body.categories || [],
          fundingSource: body.fundingSource || null,
          grantsERequisiteIntegration: body.grantsERequisiteIntegration || false,
          implementingOrganizations: body.implementingOrganizations || [],
          reportingFrequencies: body.reportingFrequencies || [],
          methodologies: body.methodologies || [],
          budgetFileInfo: budgetFileInfo,
          objectives: body.objectives || []
        }),
        budget: body.budget ? parseFloat(body.budget) : null,
        actualSpent: 0,
        status: 'PLANNING'
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: "Project created successfully",
      data: project
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Project creation error:', error)
    return NextResponse.json({ 
      success: false,
      error: "Failed to create project",
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: projects
    })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch projects',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
