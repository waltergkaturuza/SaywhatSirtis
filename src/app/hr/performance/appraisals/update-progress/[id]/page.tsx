"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  ArrowPathIcon,
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon
} from "@heroicons/react/24/outline"

interface Deliverable {
  id: string
  planId: string
  title: string
  description: string
  progress: number
  status: string
  lastUpdate?: string
  currentUpdate?: string
  planProgress?: number
}

export default function UpdateProgressPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const deliverableId = params.id as string
  
  const [deliverable, setDeliverable] = useState<Deliverable | null>(null)
  const [plan, setPlan] = useState<any>(null)
  const [progress, setProgress] = useState(0)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (deliverableId) {
      loadDeliverable()
    }
  }, [deliverableId])

  const loadDeliverable = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch deliverable from API
      const response = await fetch(`/api/hr/performance/deliverables/${deliverableId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch deliverable')
      }
      
      const data = await response.json()
      if (data.success && data.deliverable) {
        setDeliverable(data.deliverable)
        setPlan(data.plan)
        setProgress(data.deliverable.progress || 0)
        setComment(data.deliverable.currentUpdate || "")
      } else {
        throw new Error('Deliverable not found')
      }
    } catch (err) {
      console.error('Error loading deliverable:', err)
      setError(err instanceof Error ? err.message : 'Failed to load deliverable')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!deliverable || !plan) return
    
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      // Update the deliverable progress
      const response = await fetch(`/api/hr/performance/deliverables/${deliverableId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          progress,
          comment,
          lastUpdate: new Date().toISOString()
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update progress')
      }

      setSuccess('Progress updated successfully!')
      
      // Redirect back after 2 seconds
      setTimeout(() => {
        router.push('/hr/performance/appraisals?tab=plan-progress')
      }, 2000)
    } catch (err) {
      console.error('Error updating progress:', err)
      setError(err instanceof Error ? err.message : 'Failed to update progress')
    } finally {
      setSaving(false)
    }
  }

  const metadata = {
    title: `Update Progress - ${deliverable?.title || 'Deliverable'}`,
    description: "Update progress for performance plan deliverable",
    breadcrumbs: [
      { name: "SIRTIS" },
      { name: "HR Management", href: "/hr/dashboard" },
      { name: "Performance", href: "/hr/performance" },
      { name: "Appraisals", href: "/hr/performance/appraisals" },
      { name: "Update Progress" }
    ]
  }

  if (loading) {
    return (
      <ModulePage metadata={metadata}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="ml-2 text-sm text-gray-500">Loading deliverable...</span>
        </div>
      </ModulePage>
    )
  }

  if (error && !deliverable) {
    return (
      <ModulePage metadata={metadata}>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <XMarkIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm text-white hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </ModulePage>
    )
  }

  return (
    <ModulePage metadata={metadata}>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Update Progress</h1>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          {deliverable && plan && (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">{deliverable.title}</h2>
                <p className="text-sm text-gray-600 mb-4">{deliverable.description}</p>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Plan:</span>
                      <span className="ml-2 font-medium">{plan.planTitle || `${plan.planYear} - ${plan.planPeriod}`}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Employee:</span>
                      <span className="ml-2 font-medium">{plan.employeeName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className="ml-2 font-medium capitalize">{deliverable.status}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Current Progress:</span>
                      <span className="ml-2 font-medium">{deliverable.progress || 0}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Progress Percentage
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progress}
                      onChange={(e) => setProgress(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-lg font-semibold text-gray-900 w-16 text-right">
                      {progress}%
                    </span>
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Progress Update Comment
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Describe the progress made on this deliverable..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => router.back()}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {saving ? (
                      <>
                        <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                        Update Progress
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </ModulePage>
  )
}
