"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { EnhancedLayout } from "@/components/layout/enhanced-layout"
import { AdminSettings } from "@/components/admin/admin-settings"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { useRouter } from "next/navigation"

export default function AdminSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/signin")
      return
    }

    // Check admin permissions
    if (!session.user?.email?.includes("admin") && !session.user?.email?.includes("john.doe")) {
      router.push("/dashboard")
      return
    }

    setLoading(false)
  }, [session, status, router])

  if (loading) {
    return (
      <EnhancedLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </EnhancedLayout>
    )
  }

  return (
    <EnhancedLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        </div>
        <AdminSettings />
      </div>
    </EnhancedLayout>
  )
}
