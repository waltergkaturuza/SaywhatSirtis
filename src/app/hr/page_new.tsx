"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HRPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/hr/dashboard")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to HR Dashboard...</p>
      </div>
    </div>
  )
}
