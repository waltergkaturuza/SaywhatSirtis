"use client"

import { useSession } from "next-auth/react"
import { ReactNode } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import LoadingSpinner from "@/components/ui/loading-spinner"

interface AuthWrapperProps {
  children: ReactNode
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!session) {
    return null // This will be handled by the redirect in the page
  }

  return (
    <MainLayout>
      {children}
    </MainLayout>
  )
}
