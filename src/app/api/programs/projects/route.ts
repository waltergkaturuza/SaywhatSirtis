import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"



export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    
    // Basic validation
    if (!body.name || !body.description || !body.startDate || !body.endDate || !body.country) {
      return NextResponse.json({ 
        success: false,
        error: "Missing required fields: name, description, startDate, endDate, and country are required" 
      }, { status: 400 })
    }

    // Create the project in the database
    const project = await prisma.project.create({
      data: {
        name: body.name,
        description: body.description,
        timeframe: body.timeframe || `${body.startDate} to ${body.endDate}`,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        country: body.country,
        province: body.province || null,
        objectives: JSON.stringify(body.objectives || []),
        budget: body.budget ? parseFloat(body.budget) : null,
        actualSpent: 0
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: "Project created successfully",
      data: project
    }, { status: 201 })

  } catch (error) {
    console.error('Project creation error:', error)
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
