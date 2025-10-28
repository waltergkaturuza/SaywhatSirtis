import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// PUT - Update existing draft
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { id } = await params

    const draft = await prisma.projectDraft.update({
      where: {
        id: id,
        userId: session.user.id // Ensure user can only update their own drafts
      },
      data: {
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
    console.error("Draft update error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to update draft" 
    }, { status: 500 })
  }
}

// DELETE - Delete draft
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await prisma.projectDraft.delete({
      where: {
        id: id,
        userId: session.user.id // Ensure user can only delete their own drafts
      }
    })

    return NextResponse.json({ 
      success: true 
    })
  } catch (error) {
    console.error("Draft deletion error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to delete draft" 
    }, { status: 500 })
  }
}
