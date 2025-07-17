import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    
    // Basic validation
    if (!body.name || !body.description) {
      return NextResponse.json({ 
        error: "Missing required fields: name and description are required" 
      }, { status: 400 })
    }

    // Generate project code if not provided
    const projectCode = body.projectCode || `PROJ-${Date.now()}`

    // For now, we'll just return a success response
    // In a real implementation, you'd save to database
    const projectData = {
      id: Date.now(),
      projectCode,
      name: body.name,
      description: body.description,
      category: body.category || 'development',
      priority: body.priority || 'medium',
      startDate: body.startDate,
      endDate: body.endDate,
      budget: body.budget,
      currency: body.currency || 'USD',
      country: body.country,
      province: body.province,
      manager: body.manager,
      status: 'draft',
      createdAt: new Date().toISOString(),
      createdBy: session.user?.email || 'system'
    }

    console.log('Project creation request:', projectData)

    return NextResponse.json({ 
      success: true, 
      message: "Project created successfully",
      project: projectData
    })

  } catch (error) {
    console.error('Project creation error:', error)
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Return mock projects for now
    const mockProjects = [
      {
        id: 1,
        projectCode: "PROJ-001",
        name: "Community Health Initiative",
        description: "Improving healthcare access in rural communities",
        category: "development",
        priority: "high",
        status: "active",
        progress: 65,
        budget: 150000,
        currency: "USD",
        startDate: "2024-01-15",
        endDate: "2024-12-15",
        country: "Afghanistan",
        province: "Kabul",
        manager: "John Doe"
      },
      {
        id: 2,
        projectCode: "PROJ-002", 
        name: "Education Support Program",
        description: "Supporting primary education in underserved areas",
        category: "development",
        priority: "medium",
        status: "planning",
        progress: 25,
        budget: 200000,
        currency: "USD",
        startDate: "2024-03-01",
        endDate: "2025-02-28",
        country: "Afghanistan",
        province: "Herat",
        manager: "Jane Smith"
      }
    ]

    return NextResponse.json({ 
      success: true,
      projects: mockProjects
    })

  } catch (error) {
    console.error('Projects fetch error:', error)
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 })
  }
}
