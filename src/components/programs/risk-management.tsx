"use client"

import { useState, useEffect } from "react"
import { ExclamationTriangleIcon, ShieldCheckIcon } from "@heroicons/react/24/outline"

interface RiskManagementProps {
  permissions: Record<string, boolean>
  selectedProject: number | null
}

export function RiskManagement({ permissions, selectedProject }: RiskManagementProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="p-6">Loading risk management...</div>
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <ExclamationTriangleIcon className="h-8 w-8 text-red-600 mr-3" />
        <div>
          <h2 className="text-xl font-bold text-gray-900">Risk Management</h2>
          <p className="text-gray-600">Identify, assess, and mitigate project risks</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow border p-6">
        <p className="text-gray-600">Risk management features will include:</p>
        <ul className="mt-4 space-y-2 text-sm text-gray-600 list-disc list-inside">
          <li>Risk register and assessment matrix</li>
          <li>Probability and impact analysis</li>
          <li>Risk mitigation planning</li>
          <li>Automated risk monitoring</li>
          <li>Risk reporting and escalation</li>
        </ul>
      </div>
    </div>
  )
}
