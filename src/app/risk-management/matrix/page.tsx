'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Download, RotateCcw, Filter, Info, Home } from 'lucide-react'
import Link from 'next/link'

interface RiskMatrixData {
  id: string
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
  const [departments, setDepartments] = useState<Array<{id: string, name: string}>>([])
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
    loadRisksAndMatrix()
    fetchDepartments()
  }, [filters])

  const fetchDepartments = async () => {
    try {
      setLoadingDepartments(true)
      const response = await fetch('/api/hr/departments/main')
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setDepartments(result.data.map((dept: any) => ({
            id: dept.id,
            name: dept.name
          })))
        }
      } else {
        console.error('Failed to fetch departments:', response.statusText)
        // Fallback to empty departments list
        setDepartments([])
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
      // Fallback to empty departments list
      setDepartments([])
    } finally {
      setLoadingDepartments(false)
    }
  }

  const loadRisksAndMatrix = async () => {
    try {
      setLoading(true)
      
      // Enhanced sample risk data with departments
      const sampleRisks: RiskMatrixData[] = [
        {
          id: '1',
          title: 'Cybersecurity Data Breach Risk',
          category: 'CYBERSECURITY',
          department: 'IT',
          probability: 3,
          impact: 5,
          riskScore: 15,
          status: 'OPEN',
          description: 'Potential unauthorized access to sensitive customer data',
          owner: 'IT Security Team'
        },
        {
          id: '2',
          title: 'Financial Budget Overrun Risk',
          category: 'FINANCIAL',
          department: 'Finance',
          probability: 4,
          impact: 3,
          riskScore: 12,
          status: 'UNDER_REVIEW',
          description: 'Risk of exceeding allocated project budgets',
          owner: 'Finance Manager'
        },
        {
          id: '3',
          title: 'Regulatory Compliance Violation',
          category: 'COMPLIANCE',
          department: 'Operations',
          probability: 2,
          impact: 4,
          riskScore: 8,
          status: 'IN_PROGRESS',
          description: 'Non-compliance with industry regulations',
          owner: 'Compliance Officer'
        },
        {
          id: '4',
          title: 'Key Personnel Loss Risk',
          category: 'OPERATIONAL',
          department: 'HR',
          probability: 3,
          impact: 3,
          riskScore: 9,
          status: 'OPEN',
          description: 'Loss of critical staff members with specialized knowledge',
          owner: 'HR Director'
        },
        {
          id: '5',
          title: 'System Downtime Risk',
          category: 'OPERATIONAL',
          department: 'IT',
          probability: 2,
          impact: 3,
          riskScore: 6,
          status: 'MITIGATED',
          description: 'Unexpected system outages affecting operations',
          owner: 'IT Operations'
        },
        {
          id: '6',
          title: 'Supplier Dependency Risk',
          category: 'STRATEGIC',
          department: 'Operations',
          probability: 2,
          impact: 2,
          riskScore: 4,
          status: 'OPEN',
          description: 'Over-reliance on single supplier for critical components',
          owner: 'Supply Chain Manager'
        },
        {
          id: '7',
          title: 'Market Competition Risk',
          category: 'STRATEGIC',
          department: 'Programs',
          probability: 4,
          impact: 2,
          riskScore: 8,
          status: 'UNDER_REVIEW',
          description: 'Increased competition affecting market share',
          owner: 'Strategy Team'
        },
        {
          id: '8',
          title: 'Environmental Compliance Risk',
          category: 'ENVIRONMENTAL',
          department: 'Operations',
          probability: 1,
          impact: 3,
          riskScore: 3,
          status: 'CLOSED',
          description: 'Environmental regulation compliance requirements',
          owner: 'Environmental Officer'
        },
        {
          id: '9',
          title: 'Data Privacy Breach',
          category: 'CYBERSECURITY',
          department: 'IT',
          probability: 2,
          impact: 4,
          riskScore: 8,
          status: 'OPEN',
          description: 'Unauthorized access to personal data',
          owner: 'Data Protection Officer'
        },
        {
          id: '10',
          title: 'Project Delivery Delay',
          category: 'OPERATIONAL',
          department: 'Programs',
          probability: 3,
          impact: 2,
          riskScore: 6,
          status: 'OPEN',
          description: 'Risk of missing project delivery deadlines',
          owner: 'Program Manager'
        },
        {
          id: '11',
          title: 'Cash Flow Shortage',
          category: 'FINANCIAL',
          department: 'Finance',
          probability: 2,
          impact: 4,
          riskScore: 8,
          status: 'UNDER_REVIEW',
          description: 'Insufficient cash flow to meet obligations',
          owner: 'CFO'
        },
        {
          id: '12',
          title: 'Talent Acquisition Challenge',
          category: 'OPERATIONAL',
          department: 'HR',
          probability: 4,
          impact: 2,
          riskScore: 8,
          status: 'OPEN',
          description: 'Difficulty recruiting qualified personnel',
          owner: 'Talent Acquisition'
        }
      ]
      
      // Apply filters
      let filteredRisks = sampleRisks
      
      if (filters.category !== 'all') {
        filteredRisks = filteredRisks.filter(risk => risk.category === filters.category)
      }
      
      if (filters.status !== 'all') {
        filteredRisks = filteredRisks.filter(risk => risk.status === filters.status)
      }
      
      if (filters.department !== 'all') {
        filteredRisks = filteredRisks.filter(risk => risk.department === filters.department)
      }
      
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
      case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'MITIGATED': return 'bg-green-100 text-green-800'
      case 'CLOSED': return 'bg-gray-100 text-gray-800'
      case 'TRANSFERRED': return 'bg-purple-100 text-purple-800'
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
      case 'LEGAL': return 'bg-gray-100 text-gray-800'
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
        risk.id,
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
              <option value="CYBERSECURITY">Cybersecurity</option>
              <option value="FINANCIAL">Financial</option>
              <option value="OPERATIONAL">Operational</option>
              <option value="COMPLIANCE">Compliance</option>
              <option value="STRATEGIC">Strategic</option>
              <option value="ENVIRONMENTAL">Environmental</option>
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
                departments.map(dept => (
                  <option key={dept.id} value={dept.name}>{dept.name}</option>
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
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="MITIGATED">Mitigated</option>
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
                Click on any cell to view detailed risk information
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
                            <div className="text-2xl font-bold text-orange-600">#{risk.id}</div>
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
                              risk.status === 'IN_PROGRESS' ? 'text-orange-600' :
                              risk.status === 'UNDER_REVIEW' ? 'text-yellow-600' :
                              risk.status === 'MITIGATED' ? 'text-blue-600' :
                              'text-green-600'
                            }`}>
                              {risk.status.replace('_', ' ')}
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Risk Score</div>
                            <div className="text-sm font-bold text-black mt-1">{risk.riskScore}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            <span className="font-semibold">Owner:</span> {risk.owner}
                          </div>
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
