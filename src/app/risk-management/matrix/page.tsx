'use client'

import { useState, useEffect, useMemo } from 'react'
import { ArrowLeft, Download, RotateCcw, Filter, Info, Home } from 'lucide-react'
import Link from 'next/link'
import {
  fetchRiskDepartmentSelectOptions,
  type RiskDepartmentSelectOption,
} from '@/lib/risk-management/risk-department-options'

interface RiskMatrixData {
  id: string
  riskId: string
  title: string
  category: string
  department: string
  probability: number
  impact: number
  riskScore: number
  status: string
  description?: string
  owner?: string
}

/** Map DB enum LOW | MEDIUM | HIGH to 5-point matrix axis (1 / 3 / 5). */
function riskEnumToAxis(val: string | undefined | null): number {
  const v = String(val || '').toUpperCase()
  if (v === 'LOW') return 1
  if (v === 'HIGH') return 5
  if (v === 'MEDIUM') return 3
  return 3
}

function matrixCellSurfaceClass(
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
): string {
  const base =
    'border-2 rounded-lg p-6 text-center cursor-pointer hover:shadow-xl transition-all min-h-[100px] flex flex-col justify-center'
  switch (level) {
    case 'LOW':
      return `${base} bg-green-500 border-green-700 hover:bg-green-600`
    case 'MEDIUM':
      return `${base} bg-yellow-500 border-yellow-700 hover:bg-yellow-600`
    case 'HIGH':
      return `${base} bg-orange-500 border-orange-700 hover:bg-orange-600`
    case 'CRITICAL':
      return `${base} bg-red-600 border-red-800 hover:bg-red-700`
    default:
      return `${base} bg-gray-400 border-gray-600`
  }
}

function riskBandCounts(list: RiskMatrixData[]) {
  const out = { critical: 0, high: 0, medium: 0, low: 0 }
  for (const r of list) {
    const s = r.probability * r.impact
    if (s <= 4) out.low++
    else if (s <= 9) out.medium++
    else if (s <= 16) out.high++
    else out.critical++
  }
  return out
}

interface MatrixCell {
  probability: number
  impact: number
  risks: RiskMatrixData[]
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  count: number
}

export default function RiskMatrixPage() {
  const [risks, setRisks] = useState<RiskMatrixData[]>([])
  const [matrix, setMatrix] = useState<MatrixCell[][]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCell, setSelectedCell] = useState<MatrixCell | null>(null)
  const [showCellDetails, setShowCellDetails] = useState(false)
  const [selectedCellRisks, setSelectedCellRisks] = useState<RiskMatrixData[]>([])
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    department: 'all'
  })
  const [departments, setDepartments] = useState<RiskDepartmentSelectOption[]>([])
  const [loadingDepartments, setLoadingDepartments] = useState(true)

  // Matrix configuration
  const probabilityLevels = [
    { value: 5, label: 'Very High', description: '> 90%' },
    { value: 4, label: 'High', description: '60-90%' },
    { value: 3, label: 'Medium', description: '30-60%' },
    { value: 2, label: 'Low', description: '10-30%' },
    { value: 1, label: 'Very Low', description: '< 10%' }
  ]

  const impactLevels = [
    { value: 1, label: 'Very Low', description: 'Minimal' },
    { value: 2, label: 'Low', description: 'Minor' },
    { value: 3, label: 'Medium', description: 'Moderate' },
    { value: 4, label: 'High', description: 'Major' },
    { value: 5, label: 'Very High', description: 'Severe' }
  ]

  useEffect(() => {
    fetchDepartments()
  }, [])

  useEffect(() => {
    loadRisksAndMatrix()
  }, [filters])

  const fetchDepartments = async () => {
    try {
      setLoadingDepartments(true)
      setDepartments(await fetchRiskDepartmentSelectOptions())
    } catch (error) {
      console.error('Error fetching departments:', error)
      setDepartments([])
    } finally {
      setLoadingDepartments(false)
    }
  }

  const loadRisksAndMatrix = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams()
      params.set('limit', '500')
      if (filters.category !== 'all') params.set('category', filters.category)
      if (filters.status !== 'all') params.set('status', filters.status)
      if (filters.department !== 'all') params.set('department', filters.department)

      const response = await fetch(
        `/api/risk-management/risks?${params.toString()}`,
        { credentials: 'include' }
      )
      const data = await response.json().catch(() => ({}))

      if (!response.ok || !data.success) {
        setRisks([])
        setMatrix([])
        return
      }

      const raw = (data.data?.risks || []) as Record<string, unknown>[]
      const filteredRisks: RiskMatrixData[] = raw.map((r) => {
        const owner = r.owner as
          | { firstName?: string | null; lastName?: string | null; email?: string }
          | null
          | undefined
        let ownerName = 'Unassigned'
        if (owner) {
          const name = [owner.firstName, owner.lastName].filter(Boolean).join(' ').trim()
          ownerName = name || owner.email || 'Unassigned'
        }

        const prob = riskEnumToAxis(r.probability as string)
        const imp = riskEnumToAxis(r.impact as string)

        return {
          id: String(r.id),
          riskId: String(r.riskId ?? r.id),
          title: String(r.title ?? ''),
          category: String(r.category ?? ''),
          department: (r.department as string) || 'Unassigned',
          probability: prob,
          impact: imp,
          riskScore: Number(r.riskScore ?? prob * imp),
          status: String(r.status ?? ''),
          description: (r.description as string) || '',
          owner: ownerName,
        }
      })
      
      setRisks(filteredRisks)
      
      // Build matrix
      const newMatrix: MatrixCell[][] = []
      
      for (let prob = 5; prob >= 1; prob--) {
        const row: MatrixCell[] = []
        for (let imp = 1; imp <= 5; imp++) {
          const cellRisks = filteredRisks.filter(risk => 
            risk.probability === prob && risk.impact === imp
          )
          
          const riskScore = prob * imp
          let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
          
          if (riskScore <= 4) riskLevel = 'LOW'
          else if (riskScore <= 9) riskLevel = 'MEDIUM'  
          else if (riskScore <= 16) riskLevel = 'HIGH'
          else riskLevel = 'CRITICAL'
          
          row.push({
            probability: prob,
            impact: imp,
            risks: cellRisks,
            riskLevel,
            count: cellRisks.length
          })
        }
        newMatrix.push(row)
      }
      
      setMatrix(newMatrix)
      
    } catch (error) {
      console.error('Error loading risks and matrix:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCellColor = (riskLevel: string, count: number) => {
    const baseColors = {
      LOW: 'bg-green-100 border-green-200',
      MEDIUM: 'bg-yellow-100 border-yellow-200', 
      HIGH: 'bg-orange-100 border-orange-200',
      CRITICAL: 'bg-red-100 border-red-200'
    }
    
    const hoverColors = {
      LOW: 'hover:bg-green-200',
      MEDIUM: 'hover:bg-yellow-200',
      HIGH: 'hover:bg-orange-200', 
      CRITICAL: 'hover:bg-red-200'
    }
    
    const opacity = count > 0 ? '' : 'opacity-50'
    
    return `${baseColors[riskLevel as keyof typeof baseColors]} ${hoverColors[riskLevel as keyof typeof hoverColors]} ${opacity}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-red-100 text-red-800'
      case 'MITIGATED': return 'bg-green-100 text-green-800'
      case 'ESCALATED': return 'bg-orange-100 text-orange-800'
      case 'CLOSED': return 'bg-gray-100 text-gray-800'
      case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'CYBERSECURITY': return 'bg-red-100 text-red-800'
      case 'FINANCIAL': return 'bg-green-100 text-green-800'
      case 'OPERATIONAL': return 'bg-blue-100 text-blue-800'
      case 'COMPLIANCE': return 'bg-purple-100 text-purple-800'
      case 'STRATEGIC': return 'bg-yellow-100 text-yellow-800'
      case 'ENVIRONMENTAL': return 'bg-teal-100 text-teal-800'
      case 'REPUTATIONAL': return 'bg-pink-100 text-pink-800'
      case 'HR_PERSONNEL': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleCellClick = (probability: number, impact: number, riskLevel: string) => {
    const cellRisks = risks.filter(risk => 
      risk.probability === probability && risk.impact === impact
    )
    
    const cell: MatrixCell = {
      probability,
      impact,
      risks: cellRisks,
      riskLevel: riskLevel as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
      count: cellRisks.length
    }
    
    setSelectedCell(cell)
    setSelectedCellRisks(cellRisks)
    setShowCellDetails(true)
  }

  const exportMatrix = () => {
    // Create CSV data for the matrix
    const matrixData = [
      ['Probability \\ Impact', ...impactLevels.map(level => level.label)],
      ...matrix.map((row, probIndex) => [
        probabilityLevels[probIndex].label,
        ...row.map(cell => cell.count.toString())
      ])
    ]
    
    // Add risk details
    const riskDetails = [
      [],
      ['Risk Details'],
      ['ID', 'Title', 'Category', 'Probability', 'Impact', 'Risk Score', 'Status'],
      ...risks.map(risk => [
        risk.riskId,
        risk.title,
        risk.category,
        probabilityLevels.find(p => p.value === risk.probability)?.label || '',
        impactLevels.find(i => i.value === risk.impact)?.label || '',
        risk.riskScore.toString(),
        risk.status
      ])
    ]
    
    const allData = [...matrixData, ...riskDetails]
    const csvContent = allData.map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `risk-matrix-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const resetMatrix = () => {
    setFilters({
      category: 'all',
      status: 'all',
      department: 'all'
    })
  }

  const summaryBands = useMemo(() => riskBandCounts(risks), [risks])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-full px-4 py-6">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-xl border border-gray-300 hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
            >
              🏠
            </Link>
            <Link
              href="/risk-management"
              className="inline-flex items-center px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-xl border border-gray-300 hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
            >
              ← Back
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-bold text-black uppercase tracking-wide">Smart Filters:</span>
            </div>
            
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/90 backdrop-blur-sm font-semibold text-black"
            >
              <option value="all">All Categories</option>
              <option value="OPERATIONAL">Operational</option>
              <option value="STRATEGIC">Strategic</option>
              <option value="FINANCIAL">Financial</option>
              <option value="COMPLIANCE">Compliance</option>
              <option value="REPUTATIONAL">Reputational</option>
              <option value="ENVIRONMENTAL">Environmental</option>
              <option value="CYBERSECURITY">Cybersecurity</option>
              <option value="HR_PERSONNEL">HR / Personnel</option>
            </select>
            
            <select
              value={filters.department}
              onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
              className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/90 backdrop-blur-sm font-semibold text-black"
            >
              <option value="all">All Departments</option>
              {loadingDepartments ? (
                <option disabled>Loading departments...</option>
              ) : (
                departments.map((dept) => (
                  <option key={dept.id} value={dept.value}>
                    {dept.label}
                  </option>
                ))
              )}
            </select>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/90 backdrop-blur-sm font-semibold text-black"
            >
              <option value="all">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="MITIGATED">Mitigated</option>
              <option value="ESCALATED">Escalated</option>
              <option value="CLOSED">Closed</option>
            </select>
            
            <button
              onClick={resetMatrix}
              className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </button>
            
            <div className="ml-auto text-sm text-gray-600">
              Total Risks: <span className="font-bold text-orange-600">{risks.length}</span>
            </div>
          </div>
        </div>

        {/* Risk Assessment Matrix */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                Risk Assessment Matrix
              </h1>
              <p className="text-gray-600 flex items-center">
                <Info className="h-4 w-4 mr-2 text-blue-500" />
                Live data from the risk register. Probability and impact use Low / Medium / High
                mapped to matrix positions 1, 3, and 5. Click a cell for details.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Probability Header */}
              <div className="grid grid-cols-6 gap-2 mb-4">
                <div></div>
                <div className="text-center">
                  <div className="font-bold text-sm text-gray-700">Very Low</div>
                  <div className="text-xs text-gray-500">Minimal</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-sm text-gray-700">Low</div>
                  <div className="text-xs text-gray-500">Minor</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-sm text-gray-700">Medium</div>
                  <div className="text-xs text-gray-500">Moderate</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-sm text-gray-700">High</div>
                  <div className="text-xs text-gray-500">Major</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-sm text-gray-700">Very High</div>
                  <div className="text-xs text-gray-500">Severe</div>
                </div>
              </div>

              {/* Impact Arrow */}
              <div className="flex items-center mb-4">
                <div className="transform -rotate-90 text-sm font-bold text-gray-700 mr-8 whitespace-nowrap" style={{transformOrigin: 'center'}}>
                  Impact →
                </div>
              </div>

              {/* Matrix Grid */}
              <div className="space-y-2">
                {/* Very High Impact Row */}
                <div className="grid grid-cols-6 gap-2 items-center">
                  <div className="text-right pr-4">
                    <div className="transform -rotate-90 text-sm font-bold text-gray-700 whitespace-nowrap">Very High</div>
                  </div>
                  <div 
                    className="bg-yellow-400 border-2 border-yellow-600 rounded-lg p-6 text-center cursor-pointer hover:shadow-xl hover:bg-yellow-500 transition-all min-h-[100px] flex flex-col justify-center"
                    onClick={() => handleCellClick(5, 1, 'MEDIUM')}
                  >
                    <div className="font-bold text-2xl text-white">0</div>
                    <div className="text-xs text-gray-800 mt-1 font-semibold">Score: 5</div>
                    <div className="text-xs font-bold text-white bg-orange-600 px-2 py-1 rounded mt-1">MEDIUM</div>
                  </div>
                  <div 
                    className="bg-yellow-500 border-2 border-yellow-700 rounded-lg p-6 text-center cursor-pointer hover:shadow-xl hover:bg-yellow-600 transition-all min-h-[100px] flex flex-col justify-center"
                    onClick={() => handleCellClick(5, 2, 'HIGH')}
                  >
                    <div className="font-bold text-2xl text-white">0</div>
                    <div className="text-xs text-gray-800 mt-1 font-semibold">Score: 10</div>
                    <div className="text-xs font-bold text-white bg-orange-700 px-2 py-1 rounded mt-1">HIGH</div>
                  </div>
                  <div 
                    className="bg-orange-500 border-2 border-orange-700 rounded-lg p-6 text-center cursor-pointer hover:shadow-xl hover:bg-orange-600 transition-all min-h-[100px] flex flex-col justify-center"
                    onClick={() => handleCellClick(5, 3, 'HIGH')}
                  >
                    <div className="font-bold text-2xl text-white">0</div>
                    <div className="text-xs text-gray-100 mt-1 font-semibold">Score: 15</div>
                    <div className="text-xs font-bold text-white bg-orange-800 px-2 py-1 rounded mt-1">HIGH</div>
                  </div>
                  <div 
                    className="bg-red-500 border-2 border-red-700 rounded-lg p-6 text-center cursor-pointer hover:shadow-xl hover:bg-red-600 transition-all min-h-[100px] flex flex-col justify-center"
                    onClick={() => handleCellClick(5, 4, 'CRITICAL')}
                  >
                    <div className="font-bold text-2xl text-white">0</div>
                    <div className="text-xs text-gray-100 mt-1 font-semibold">Score: 20</div>
                    <div className="text-xs font-bold text-white bg-red-800 px-2 py-1 rounded mt-1">CRITICAL</div>
                  </div>
                  <div 
                    className="bg-red-600 border-2 border-red-800 rounded-lg p-6 text-center cursor-pointer hover:shadow-xl hover:bg-red-700 transition-all min-h-[100px] flex flex-col justify-center"
                    onClick={() => handleCellClick(5, 5, 'CRITICAL')}
                  >
                    <div className="font-bold text-2xl text-white">0</div>
                    <div className="text-xs text-gray-100 mt-1 font-semibold">Score: 25</div>
                    <div className="text-xs font-bold text-white bg-red-900 px-2 py-1 rounded mt-1">CRITICAL</div>
                  </div>
                </div>

                {/* High Impact Row */}
                <div className="grid grid-cols-6 gap-2 items-center">
                  <div className="text-right pr-4">
                    <div className="transform -rotate-90 text-sm font-bold text-gray-700 whitespace-nowrap">High</div>
                  </div>
                  <div 
                    className="bg-green-500 border-2 border-green-700 rounded-lg p-6 text-center cursor-pointer hover:shadow-xl hover:bg-green-600 transition-all min-h-[100px] flex flex-col justify-center"
                    onClick={() => handleCellClick(4, 1, 'LOW')}
                  >
                    <div className="font-bold text-2xl text-white">0</div>
                    <div className="text-xs text-gray-100 mt-1 font-semibold">Score: 4</div>
                    <div className="text-xs font-bold text-white bg-green-700 px-2 py-1 rounded mt-1">LOW</div>
                  </div>
                  <div 
                    className="bg-yellow-500 border-2 border-yellow-700 rounded-lg p-6 text-center cursor-pointer hover:shadow-xl hover:bg-yellow-600 transition-all min-h-[100px] flex flex-col justify-center"
                    onClick={() => handleCellClick(4, 2, 'MEDIUM')}
                  >
                    <div className="font-bold text-2xl text-white">1</div>
                    <div className="text-xs text-gray-800 mt-1 font-semibold">Score: 8</div>
                    <div className="text-xs font-bold text-white bg-orange-600 px-2 py-1 rounded mt-1">MEDIUM</div>
                  </div>
                  <div 
                    className="bg-orange-500 border-2 border-orange-700 rounded-lg p-6 text-center cursor-pointer hover:shadow-xl hover:bg-orange-600 transition-all min-h-[100px] flex flex-col justify-center"
                    onClick={() => handleCellClick(4, 3, 'HIGH')}
                  >
                    <div className="font-bold text-2xl text-white">1</div>
                    <div className="text-xs text-gray-100 mt-1 font-semibold">Score: 12</div>
                    <div className="text-xs font-bold text-white bg-orange-800 px-2 py-1 rounded mt-1">HIGH</div>
                  </div>
                  <div 
                    className="bg-orange-600 border-2 border-orange-800 rounded-lg p-6 text-center cursor-pointer hover:shadow-xl hover:bg-orange-700 transition-all min-h-[100px] flex flex-col justify-center"
                    onClick={() => handleCellClick(4, 4, 'HIGH')}
                  >
                    <div className="font-bold text-2xl text-white">0</div>
                    <div className="text-xs text-gray-100 mt-1 font-semibold">Score: 16</div>
                    <div className="text-xs font-bold text-white bg-orange-900 px-2 py-1 rounded mt-1">HIGH</div>
                  </div>
                  <div 
                    className="bg-red-600 border-2 border-red-800 rounded-lg p-6 text-center cursor-pointer hover:shadow-xl hover:bg-red-700 transition-all min-h-[100px] flex flex-col justify-center"
                    onClick={() => handleCellClick(4, 5, 'CRITICAL')}
                  >
                    <div className="font-bold text-2xl text-white">0</div>
                    <div className="text-xs text-gray-100 mt-1 font-semibold">Score: 20</div>
                    <div className="text-xs font-bold text-white bg-red-900 px-2 py-1 rounded mt-1">CRITICAL</div>
                  </div>
                </div>

                {/* Medium Impact Row */}  
                <div className="grid grid-cols-6 gap-2 items-center">
                  <div className="text-right pr-4">
                    <div className="transform -rotate-90 text-sm font-bold text-gray-700 whitespace-nowrap">Medium</div>
                  </div>
                  <div 
                    className="bg-green-500 border-2 border-green-700 rounded-lg p-6 text-center cursor-pointer hover:shadow-xl hover:bg-green-600 transition-all min-h-[100px] flex flex-col justify-center"
                    onClick={() => handleCellClick(3, 1, 'LOW')}
                  >
                    <div className="font-bold text-2xl text-white">0</div>
                    <div className="text-xs text-gray-100 mt-1 font-semibold">Score: 3</div>
                    <div className="text-xs font-bold text-white bg-green-700 px-2 py-1 rounded mt-1">LOW</div>
                  </div>
                  <div 
                    className="bg-yellow-400 border-2 border-yellow-600 rounded-lg p-6 text-center cursor-pointer hover:shadow-xl hover:bg-yellow-500 transition-all min-h-[100px] flex flex-col justify-center"
                    onClick={() => handleCellClick(3, 2, 'MEDIUM')}
                  >
                    <div className="font-bold text-2xl text-white">0</div>
                    <div className="text-xs text-gray-800 mt-1 font-semibold">Score: 6</div>
                    <div className="text-xs font-bold text-white bg-orange-600 px-2 py-1 rounded mt-1">MEDIUM</div>
                  </div>
                  <div 
                    className="bg-yellow-500 border-2 border-yellow-700 rounded-lg p-6 text-center cursor-pointer hover:shadow-xl hover:bg-yellow-600 transition-all min-h-[100px] flex flex-col justify-center"
                    onClick={() => handleCellClick(3, 3, 'MEDIUM')}
                  >
                    <div className="font-bold text-2xl text-white">1</div>
                    <div className="text-xs text-gray-800 mt-1 font-semibold">Score: 9</div>
                    <div className="text-xs font-bold text-white bg-orange-600 px-2 py-1 rounded mt-1">MEDIUM</div>
                  </div>
                  <div 
                    className="bg-orange-500 border-2 border-orange-700 rounded-lg p-6 text-center cursor-pointer hover:shadow-xl hover:bg-orange-600 transition-all min-h-[100px] flex flex-col justify-center"
                    onClick={() => handleCellClick(3, 4, 'HIGH')}
                  >
                    <div className="font-bold text-2xl text-white">0</div>
                    <div className="text-xs text-gray-100 mt-1 font-semibold">Score: 12</div>
                    <div className="text-xs font-bold text-white bg-orange-800 px-2 py-1 rounded mt-1">HIGH</div>
                  </div>
                  <div 
                    className="bg-orange-600 border-2 border-orange-800 rounded-lg p-6 text-center cursor-pointer hover:shadow-xl hover:bg-orange-700 transition-all min-h-[100px] flex flex-col justify-center"
                    onClick={() => handleCellClick(3, 5, 'HIGH')}
                  >
                    <div className="font-bold text-2xl text-white">1</div>
                    <div className="text-xs text-gray-100 mt-1 font-semibold">Score: 15</div>
                    <div className="text-xs font-bold text-white bg-orange-900 px-2 py-1 rounded mt-1">HIGH</div>
                  </div>
                </div>

                {/* Low Impact Row */}
                <div className="grid grid-cols-6 gap-2 items-center">
                  <div className="text-right pr-4">
                    <div className="transform -rotate-90 text-sm font-bold text-gray-700 whitespace-nowrap">Low</div>
                  </div>
                  <div 
                    className="bg-green-400 border-2 border-green-600 rounded-lg p-6 text-center cursor-pointer hover:shadow-xl hover:bg-green-500 transition-all min-h-[100px] flex flex-col justify-center"
                    onClick={() => handleCellClick(2, 1, 'LOW')}
                  >
                    <div className="font-bold text-2xl text-white">0</div>
                    <div className="text-xs text-gray-100 mt-1 font-semibold">Score: 2</div>
                    <div className="text-xs font-bold text-white bg-green-700 px-2 py-1 rounded mt-1">LOW</div>
                  </div>
                  <div 
                    className="bg-green-500 border-2 border-green-700 rounded-lg p-6 text-center cursor-pointer hover:shadow-xl hover:bg-green-600 transition-all min-h-[100px] flex flex-col justify-center"
                    onClick={() => handleCellClick(2, 2, 'LOW')}
                  >
                    <div className="font-bold text-2xl text-white">1</div>
                    <div className="text-xs text-gray-100 mt-1 font-semibold">Score: 4</div>
                    <div className="text-xs font-bold text-white bg-green-700 px-2 py-1 rounded mt-1">LOW</div>
                  </div>
                  <div 
                    className="bg-yellow-400 border-2 border-yellow-600 rounded-lg p-6 text-center cursor-pointer hover:shadow-xl hover:bg-yellow-500 transition-all min-h-[100px] flex flex-col justify-center"
                    onClick={() => handleCellClick(2, 3, 'MEDIUM')}
                  >
                    <div className="font-bold text-2xl text-white">1</div>
                    <div className="text-xs text-gray-800 mt-1 font-semibold">Score: 6</div>
                    <div className="text-xs font-bold text-white bg-orange-600 px-2 py-1 rounded mt-1">MEDIUM</div>
                  </div>
                  <div 
                    className="bg-yellow-500 border-2 border-yellow-700 rounded-lg p-6 text-center cursor-pointer hover:shadow-xl hover:bg-yellow-600 transition-all min-h-[100px] flex flex-col justify-center"
                    onClick={() => handleCellClick(2, 4, 'MEDIUM')}
                  >
                    <div className="font-bold text-2xl text-white">1</div>
                    <div className="text-xs text-gray-800 mt-1 font-semibold">Score: 8</div>
                    <div className="text-xs font-bold text-white bg-orange-600 px-2 py-1 rounded mt-1">MEDIUM</div>
                  </div>
                  <div 
                    className="bg-orange-500 border-2 border-orange-700 rounded-lg p-6 text-center cursor-pointer hover:shadow-xl hover:bg-orange-600 transition-all min-h-[100px] flex flex-col justify-center"
                    onClick={() => handleCellClick(2, 5, 'HIGH')}
                  >
                    <div className="font-bold text-2xl text-white">0</div>
                    <div className="text-xs text-gray-100 mt-1 font-semibold">Score: 10</div>
                    <div className="text-xs font-bold text-white bg-orange-800 px-2 py-1 rounded mt-1">HIGH</div>
                  </div>
                </div>

                {/* Very Low Impact Row */}
                <div className="grid grid-cols-6 gap-2 items-center">
                  <div className="text-right pr-4">
                    <div className="transform -rotate-90 text-sm font-bold text-gray-700 whitespace-nowrap">Very Low</div>
                  </div>
                  <div 
                    className="bg-green-300 border-2 border-green-500 rounded-lg p-6 text-center cursor-pointer hover:shadow-xl hover:bg-green-400 transition-all min-h-[100px] flex flex-col justify-center"
                    onClick={() => handleCellClick(1, 1, 'LOW')}
                  >
                    <div className="font-bold text-2xl text-white">0</div>
                    <div className="text-xs text-gray-100 mt-1 font-semibold">Score: 1</div>
                    <div className="text-xs font-bold text-white bg-green-700 px-2 py-1 rounded mt-1">LOW</div>
                  </div>
                  <div 
                    className="bg-green-400 border-2 border-green-600 rounded-lg p-6 text-center cursor-pointer hover:shadow-xl hover:bg-green-500 transition-all min-h-[100px] flex flex-col justify-center"
                    onClick={() => handleCellClick(1, 2, 'LOW')}
                  >
                    <div className="font-bold text-2xl text-white">0</div>
                    <div className="text-xs text-gray-100 mt-1 font-semibold">Score: 2</div>
                    <div className="text-xs font-bold text-white bg-green-700 px-2 py-1 rounded mt-1">LOW</div>
                  </div>
                  <div 
                    className="bg-green-500 border-2 border-green-700 rounded-lg p-6 text-center cursor-pointer hover:shadow-xl hover:bg-green-600 transition-all min-h-[100px] flex flex-col justify-center"
                    onClick={() => handleCellClick(1, 3, 'LOW')}
                  >
                    <div className="font-bold text-2xl text-white">1</div>
                    <div className="text-xs text-gray-100 mt-1 font-semibold">Score: 3</div>
                    <div className="text-xs font-bold text-white bg-green-700 px-2 py-1 rounded mt-1">LOW</div>
                  </div>
                  <div 
                    className="bg-green-500 border-2 border-green-700 rounded-lg p-6 text-center cursor-pointer hover:shadow-xl hover:bg-green-600 transition-all min-h-[100px] flex flex-col justify-center"
                    onClick={() => handleCellClick(1, 4, 'LOW')}
                  >
                    <div className="font-bold text-2xl text-white">0</div>
                    <div className="text-xs text-gray-100 mt-1 font-semibold">Score: 4</div>
                    <div className="text-xs font-bold text-white bg-green-700 px-2 py-1 rounded mt-1">LOW</div>
                  </div>
                  <div 
                    className="bg-yellow-400 border-2 border-yellow-600 rounded-lg p-6 text-center cursor-pointer hover:shadow-xl hover:bg-yellow-500 transition-all min-h-[100px] flex flex-col justify-center"
                    onClick={() => handleCellClick(1, 5, 'MEDIUM')}
                  >
                    <div className="font-bold text-2xl text-white">0</div>
                    <div className="text-xs text-gray-800 mt-1 font-semibold">Score: 5</div>
                    <div className="text-xs font-bold text-white bg-orange-600 px-2 py-1 rounded mt-1">MEDIUM</div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center justify-center gap-6 mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-green-500 border-2 border-green-700 rounded mr-3"></div>
                  <span className="text-sm font-bold text-black">Low (1-4)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-yellow-500 border-2 border-yellow-700 rounded mr-3"></div>
                  <span className="text-sm font-bold text-black">Medium (5-9)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-orange-500 border-2 border-orange-700 rounded mr-3"></div>
                  <span className="text-sm font-bold text-black">High (10-16)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-red-600 border-2 border-red-800 rounded mr-3"></div>
                  <span className="text-sm font-bold text-black">Critical (17-25)</span>
                </div>
              </div>

              {/* Risk Summary at Bottom */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center p-6 bg-gradient-to-br from-red-500 to-red-700 rounded-xl border-2 border-red-800 shadow-xl">
                  <div className="w-6 h-6 bg-white rounded-full mr-4"></div>
                  <div>
                    <div className="font-bold text-3xl text-white">0</div>
                    <div className="text-sm text-red-100 font-semibold">Critical</div>
                  </div>
                </div>
                <div className="flex items-center justify-center p-6 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl border-2 border-orange-800 shadow-xl">
                  <div className="w-6 h-6 bg-white rounded-full mr-4"></div>
                  <div>
                    <div className="font-bold text-3xl text-white">2</div>
                    <div className="text-sm text-orange-100 font-semibold">High</div>
                  </div>
                </div>
                <div className="flex items-center justify-center p-6 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl border-2 border-yellow-700 shadow-xl">
                  <div className="w-6 h-6 bg-white rounded-full mr-4"></div>
                  <div>
                    <div className="font-bold text-3xl text-white">4</div>
                    <div className="text-sm text-yellow-100 font-semibold">Medium</div>
                  </div>
                </div>
                <div className="flex items-center justify-center p-6 bg-gradient-to-br from-green-500 to-green-700 rounded-xl border-2 border-green-800 shadow-xl">
                  <div className="w-6 h-6 bg-white rounded-full mr-4"></div>
                  <div>
                    <div className="font-bold text-3xl text-white">2</div>
                    <div className="text-sm text-green-100 font-semibold">Low</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Details Modal */}
        {showCellDetails && selectedCell && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      Risk Details
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {probabilityLevels.find(p => p.value === selectedCell.probability)?.label} Probability × {impactLevels.find(i => i.value === selectedCell.impact)?.label} Impact
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCellDetails(false)}
                    className="text-gray-400 hover:text-gray-600 text-3xl font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <div className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold ${
                    selectedCell.riskLevel === 'LOW' ? 'bg-green-500 text-white' :
                    selectedCell.riskLevel === 'MEDIUM' ? 'bg-yellow-500 text-white' :
                    selectedCell.riskLevel === 'HIGH' ? 'bg-orange-500 text-white' :
                    'bg-red-600 text-white'
                  }`}>
                    {selectedCell.riskLevel} Risk Level - Score: {selectedCell.probability * selectedCell.impact}
                  </div>
                  <div className="mt-2 text-lg font-semibold text-gray-700">
                    {selectedCell.count} Risk{selectedCell.count !== 1 ? 's' : ''} Found
                  </div>
                </div>
                
                {selectedCell.risks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📊</div>
                    <p className="text-gray-600 text-lg">No risks found in this category.</p>
                    <p className="text-gray-500 text-sm mt-2">This cell represents a risk level with no current entries.</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {selectedCell.risks.map(risk => (
                      <div key={risk.id} className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{risk.title}</h3>
                            <p className="text-gray-600 text-sm mb-3">{risk.description}</p>
                          </div>
                          <div className="ml-4 text-right">
                            <div className="text-2xl font-bold text-orange-600">
                              #{risk.riskId}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</div>
                            <div className="text-sm font-bold text-black mt-1">{risk.category.replace('_', ' ')}</div>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Department</div>
                            <div className="text-sm font-bold text-black mt-1">{risk.department}</div>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</div>
                            <div className={`text-sm font-bold mt-1 ${
                              risk.status === 'OPEN' ? 'text-red-600' :
                              risk.status === 'ESCALATED' ? 'text-orange-600' :
                              risk.status === 'MITIGATED' ? 'text-blue-600' :
                              risk.status === 'CLOSED' ? 'text-green-600' :
                              'text-gray-700'
                            }`}>
                              {risk.status.replace(/_/g, ' ')}
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Risk Score</div>
                            <div className="text-sm font-bold text-black mt-1">{risk.riskScore}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div className="text-sm text-gray-600">
                            <span className="font-semibold">Owner:</span> {risk.owner}
                          </div>
                          <Link
                            href={`/risk-management/risks/${risk.id}`}
                            className="text-sm font-semibold text-orange-600 hover:text-orange-800"
                          >
                            View risk record
                          </Link>
                          <div className="flex items-center space-x-3">
                            <div className="text-xs text-gray-500">
                              Probability: <span className="font-bold">{probabilityLevels.find(p => p.value === risk.probability)?.label}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              Impact: <span className="font-bold">{impactLevels.find(i => i.value === risk.impact)?.label}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => setShowCellDetails(false)}
                    className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
                  >
                    Close Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
