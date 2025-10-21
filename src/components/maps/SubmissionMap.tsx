"use client"

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import the entire map component to avoid SSR issues
const DynamicMap = dynamic(() => import('./DynamicMap'), { 
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  )
})

interface SubmissionLocation {
  id: string
  latitude: number
  longitude: number
  submittedAt: string
  formName: string
  submittedBy: string
  accuracy?: number
}

interface SubmissionMapProps {
  submissions: SubmissionLocation[]
  className?: string
}

export default function SubmissionMap({ submissions, className = '' }: SubmissionMapProps) {
  return (
    <div className={`h-96 rounded-lg overflow-hidden border border-gray-200 ${className}`}>
      <DynamicMap submissions={submissions} />
    </div>
  )
}
