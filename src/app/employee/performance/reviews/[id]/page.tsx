'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function EmployeeReviewPage() {
  const params = useParams()
  const router = useRouter()
  const reviewId = params.id as string

  useEffect(() => {
    // Redirect to the appraisal form with the review ID
    // The appraisal form will load the data using the ID
    router.replace(`/hr/performance/appraisals/create?mode=self&appraisalId=${reviewId}`)
  }, [reviewId, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        <p className="mt-4 text-gray-600">Loading your appraisal...</p>
      </div>
    </div>
  )
}

