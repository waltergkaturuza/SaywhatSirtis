'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function CaseViewPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)

  return (
    <div className="flex-1 overflow-auto">
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Case #{params.id}</h1>
              <p className="text-gray-600">Case details</p>
            </div>
          </div>
        </div>
      </div>
      <div className="px-6 py-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Case Information</h3>
          <p className="text-gray-700">Case view functionality will be implemented here.</p>
        </div>
      </div>
    </div>
  )
}
