"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { EnhancedLayout } from "@/components/layout/enhanced-layout"
import { AdminUserManagement } from "@/components/admin/admin-user-management"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { useRouter } from "next/navigation"

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/signin")
      return
    }

    // Standardized admin access: by permissions or elevated roles
    const roles = (session.user?.roles || []).map(r => r.toLowerCase())
    const permissions = session.user?.permissions || []
    const isAdmin =
      permissions.includes("admin.access") ||
      permissions.includes("full_access") ||
      roles.some(r => [
        "system_administrator",
        "system administrator",
        "administrator",
        "admin",
        "superuser",
        "manager",
        "advance_user_1",
        "advance_user_2"
      ].includes(r))

    if (!isAdmin) {
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
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        </div>
        <AdminUserManagement />
      </div>
    </EnhancedLayout>
  )
}
