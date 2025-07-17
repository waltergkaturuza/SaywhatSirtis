"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { NewProjectForm } from "../../../components/programs/new-project-form"

export default function NewProjectPage() {
  const router = useRouter()

  const handleCancel = () => {
    router.push('/programs')
  }

  const handleSuccess = () => {
    // Show success message and redirect
    router.push('/programs?success=project-created')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NewProjectForm onCancel={handleCancel} onSuccess={handleSuccess} />
    </div>
  )
}
