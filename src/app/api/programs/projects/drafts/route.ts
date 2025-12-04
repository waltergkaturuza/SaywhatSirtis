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

    let draft = null
    try {
      draft = await prisma.projectDraft.findFirst({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          updatedAt: 'desc'
        }
      })
    } catch (error: any) {
      // If table doesn't exist (P2021), return null draft
      if (error?.code === 'P2021') {
        console.log('ProjectDraft table does not exist, returning null draft')
        return NextResponse.json({ 
          success: true, 
          data: null 
        })
      }
      throw error // Re-throw other errors
    }

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

    try {
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
    } catch (error: any) {
      // If table doesn't exist (P2021), return a graceful error
      if (error?.code === 'P2021') {
        console.log('ProjectDraft table does not exist, draft saving is not available')
        return NextResponse.json({ 
          success: false, 
          error: "Draft functionality is not available. The ProjectDraft table does not exist in the database." 
        }, { status: 503 }) // 503 Service Unavailable
      }
      throw error // Re-throw other errors
    }
  } catch (error) {
    console.error("Draft creation error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to create draft" 
    }, { status: 500 })
  }
}
