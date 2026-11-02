"use client"

import { useState, useEffect } from "react"
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline"
import Link from "next/link"

interface RiskManagementProps {
  permissions: Record<string, boolean>
  selectedProject: number | null
}

interface RiskRow {
  id: string
  riskId: string
  title: string
  status: string
  riskScore: number
  category: string
}

export function RiskManagement({ permissions, selectedProject }: RiskManagementProps) {
  const [mounted, setMounted] = useState(false)
  const [risks, setRisks] = useState<RiskRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    const load = async () => {
      try {
        const response = await fetch('/api/risk-management/risks?limit=500')
        const data = await response.json()
        if (response.ok && data.success) {
          setRisks(data.data?.risks || [])
        } else {
          setRisks([])
        }
      } catch (error) {
        console.error('Error loading risks:', error)
        setRisks([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [selectedProject])

  if (!mounted || loading) {
    return <div className="p-6">Loading risk management...</div>
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-8 w-8 text-red-600 mr-3" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Risk Management</h2>
            <p className="text-gray-600">{risks.length} risks in the register</p>
          </div>
        </div>
        {permissions.canCreate && (
          <Link href="/risk-management/add" className="text-sm font-medium text-orange-700 hover:text-orange-800">
            Add risk
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow border divide-y">
        {risks.length === 0 ? (
          <p className="p-6 text-gray-600">No risks recorded yet.</p>
        ) : (
          risks.slice(0, 8).map((risk) => (
            <Link
              key={risk.id}
              href={`/risk-management/risks/${risk.id}`}
              className="flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <div>
                <p className="font-medium text-gray-900">{risk.title}</p>
                <p className="text-sm text-gray-500">{risk.riskId} · {risk.category.replaceAll('_', ' ')}</p>
              </div>
              <div className="text-right text-sm text-gray-600">
                <p>{risk.status.replaceAll('_', ' ')}</p>
                <p>Score {risk.riskScore}/9</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
