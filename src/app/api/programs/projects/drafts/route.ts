import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Fetch user's latest draft
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const draft = await prisma.projectDraft.findFirst({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json({ 
      success: true, 
      data: draft 
    })
  } catch (error) {
    console.error("Draft fetch error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch draft" 
    }, { status: 500 })
  }
}

// POST - Create new draft
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    // Delete any existing draft for this user first
    await prisma.projectDraft.deleteMany({
      where: {
        userId: session.user.id
      }
    })

    const draft = await prisma.projectDraft.create({
      data: {
        userId: session.user.id,
        projectCode: body.projectCode,
        projectTitle: body.projectTitle,
        projectGoal: body.projectGoal,
        description: body.description,
        projectLead: body.projectLead,
        projectTeam: body.projectTeam,
        selectedCategories: body.selectedCategories,
        startDate: body.startDate,
        endDate: body.endDate,
        selectedCountries: body.selectedCountries,
        selectedProvinces: body.selectedProvinces,
        uploadedDocuments: body.uploadedDocuments,
        implementingOrganizations: body.implementingOrganizations,
        selectedFrequencies: body.selectedFrequencies,
        frequencyDates: body.frequencyDates,
        selectedMethodologies: body.selectedMethodologies,
        totalBudget: body.totalBudget,
        fundingSource: body.fundingSource,
        resultsFramework: body.resultsFramework,
        currentStep: body.currentStep || 1
      }
    })

    return NextResponse.json({ 
      success: true, 
      data: draft 
    })
  } catch (error) {
    console.error("Draft creation error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to create draft" 
    }, { status: 500 })
  }
}
