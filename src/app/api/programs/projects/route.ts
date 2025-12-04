import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ 
        success: false,
        error: "Authentication required", 
        message: "Please log in to view projects. Visit /auth/signin to authenticate.",
        code: "UNAUTHORIZED"
      }, { status: 401 })
    }

    // Fetch projects from database with related data
    const projects = await prisma.projects.findMany({
      include: {
        users_projects_creatorIdTousers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        users_projects_managerIdTousers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: {
            activities: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Fetch draft projects and convert them to project-like format
    const drafts = await prisma.projectDraft.findMany({
      where: {
        userId: session.user.id // Only show drafts for the current user
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Transform drafts to match project format
    const draftProjects = drafts.map(draft => ({
      id: draft.id,
      name: draft.projectTitle || draft.projectCode || 'Untitled Draft',
      description: draft.description || '',
      projectGoal: draft.projectGoal || '',
      status: 'DRAFT',
      priority: 'MEDIUM',
      progress: 0,
      startDate: draft.startDate ? new Date(draft.startDate).toISOString() : null,
      endDate: draft.endDate ? new Date(draft.endDate).toISOString() : null,
      budget: draft.totalBudget ? parseFloat(draft.totalBudget.toString()) : null,
      actualSpent: 0,
      country: draft.selectedCountries && draft.selectedCountries.length > 0 ? draft.selectedCountries[0] : null,
      province: draft.selectedProvinces && Object.keys(draft.selectedProvinces).length > 0 
        ? Object.values(draft.selectedProvinces)[0]?.join(', ') || null 
        : null,
      objectives: JSON.stringify({
        categories: draft.selectedCategories || [],
        projectLead: draft.projectLead || null,
        projectTeam: draft.projectTeam || [],
        implementingOrganizations: draft.implementingOrganizations || [],
        evaluationFrequency: draft.selectedFrequencies || [],
        frequencyDates: draft.frequencyDates || {},
        methodologies: draft.selectedMethodologies || [],
        fundingSource: draft.fundingSource || null,
        resultsFramework: draft.resultsFramework || { objectives: [], projectDuration: 3 },
        countries: draft.selectedCountries || [],
        provinces: draft.selectedProvinces || {},
        uploadedDocuments: draft.uploadedDocuments || []
      }),
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
      creatorId: draft.userId,
      managerId: null,
      isDraft: true, // Flag to identify drafts
      draftId: draft.id,
      users_projects_creatorIdTousers: null,
      users_projects_managerIdTousers: null,
      _count: {
        activities: 0
      }
    }))

    // Combine projects and drafts, with drafts appearing first
    const allProjects = [...draftProjects, ...projects]

    return NextResponse.json({ 
      success: true,
      data: allProjects,
      count: allProjects.length,
      draftsCount: drafts.length
    })

  } catch (error) {
    console.error('Projects fetch error:', error)
    return NextResponse.json({ 
      success: false,
      error: "Failed to fetch projects",
      message: error instanceof Error ? error.message : "Unknown error occurred"
    }, { status: 500 })
  }
}



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

    const body = await request.json()
    
    // Basic validation
    const hasCountryData = body.country || (body.countries && body.countries.length > 0)
    if (!body.name || !body.description || !body.startDate || !body.endDate || !hasCountryData) {
      return NextResponse.json({ 
        success: false,
        error: "Missing required fields: name, description, startDate, endDate, and country/countries are required" 
      }, { status: 400 })
    }

    // Create the project in the database
    const project = await prisma.projects.create({
      data: {
        id: crypto.randomUUID(),
        name: body.name,
        projectGoal: body.projectGoal,
        description: body.description,
        timeframe: body.timeframe || `${body.startDate} to ${body.endDate}`,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        country: body.countries ? body.countries[0] : body.country || "Zimbabwe", // Use first country for backward compatibility
        province: body.provinces && body.countries ? 
          (body.provinces[body.countries[0]] || []).join(", ") : 
          body.province || null,
        objectives: JSON.stringify({
          categories: body.categories || [],
          projectLead: body.projectLead || null,
          projectTeam: body.projectTeam || [],
          implementingOrganizations: body.implementingOrganizations || [],
          evaluationFrequency: body.evaluationFrequency || [],
          frequencyDates: body.frequencyDates || {},
          methodologies: body.methodologies || [],
          fundingSource: body.fundingSource || null,
          resultsFramework: body.resultsFramework || { objectives: [], projectDuration: 3 },
          // Enhanced location data
          countries: body.countries || [],
          provinces: body.provinces || {},
          // Document management
          uploadedDocuments: body.uploadedDocuments || []
        }),
        budget: body.budget ? parseFloat(body.budget) : null,
        actualSpent: 0,
        updatedAt: new Date()
      }
    })

    // Link uploaded documents to this project
    if (body.uploadedDocuments && body.uploadedDocuments.length > 0) {
      try {
        for (const doc of body.uploadedDocuments) {
          if (doc.documentId) {
            await prisma.documents.update({
              where: { id: doc.documentId },
              data: { 
                projectId: project.id,
                customMetadata: { 
                  projectId: project.id,
                  projectName: project.name 
                }
              }
            })
          }
        }
      } catch (docError) {
        console.error('Error linking documents to project:', docError)
        // Don't fail project creation if document linking fails
      }
    }

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
