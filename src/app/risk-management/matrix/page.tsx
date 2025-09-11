'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Download, RotateCcw, Filter, Info } from 'lucide-react'
import Link from 'next/link'

interface RiskMatrixData {
  id: string
  title: string
  category: string
  probability: number
  impact: number
  riskScore: number
  status: string
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
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    department: 'all'
  })

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
  }, [filters])

  const loadRisksAndMatrix = async () => {
    try {
      setLoading(true)
      
      // Sample risk data
      const sampleRisks: RiskMatrixData[] = [
        {
          id: '1',
          title: 'Cybersecurity Data Breach Risk',
          category: 'CYBERSECURITY',
          probability: 3,
          impact: 5,
          riskScore: 15,
          status: 'OPEN'
        },
        {
          id: '2',
          title: 'Financial Budget Overrun Risk',
          category: 'FINANCIAL',
          probability: 4,
          impact: 3,
          riskScore: 12,
          status: 'UNDER_REVIEW'
        },
        {
          id: '3',
          title: 'Regulatory Compliance Violation',
          category: 'COMPLIANCE',
          probability: 2,
          impact: 4,
          riskScore: 8,
          status: 'IN_PROGRESS'
        },
        {
          id: '4',
          title: 'Key Personnel Loss Risk',
          category: 'OPERATIONAL',
          probability: 3,
          impact: 3,
          riskScore: 9,
          status: 'OPEN'
        },
        {
          id: '5',
          title: 'System Downtime Risk',
          category: 'OPERATIONAL',
          probability: 2,
          impact: 3,
          riskScore: 6,
          status: 'MITIGATED'
        },
        {
          id: '6',
          title: 'Supplier Dependency Risk',
          category: 'STRATEGIC',
          probability: 2,
          impact: 2,
          riskScore: 4,
          status: 'OPEN'
        },
        {
          id: '7',
          title: 'Market Competition Risk',
          category: 'STRATEGIC',
          probability: 4,
          impact: 2,
          riskScore: 8,
          status: 'UNDER_REVIEW'
        },
        {
          id: '8',
          title: 'Environmental Compliance Risk',
          category: 'ENVIRONMENTAL',
          probability: 1,
          impact: 3,
          riskScore: 3,
          status: 'CLOSED'
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

  const handleCellClick = (cell: MatrixCell) => {
    setSelectedCell(cell)
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/risk-management"
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Risk Management
            </Link>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={resetMatrix}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Filters
              </button>
              <button
                onClick={exportMatrix}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Matrix
              </button>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Risk Matrix</h1>
          <p className="text-gray-600">Visual representation of risk probability vs impact</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="CYBERSECURITY">Cybersecurity</option>
              <option value="FINANCIAL">Financial</option>
              <option value="OPERATIONAL">Operational</option>
              <option value="COMPLIANCE">Compliance</option>
              <option value="STRATEGIC">Strategic</option>
              <option value="ENVIRONMENTAL">Environmental</option>
              <option value="REPUTATIONAL">Reputational</option>
              <option value="LEGAL">Legal</option>
            </select>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="MITIGATED">Mitigated</option>
              <option value="CLOSED">Closed</option>
              <option value="TRANSFERRED">Transferred</option>
            </select>
            
            <div className="ml-auto text-sm text-gray-600">
              Total Risks: <span className="font-medium">{risks.length}</span>
            </div>
          </div>
        </div>

        {/* Risk Matrix */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Risk Assessment Matrix</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Info className="h-4 w-4" />
              <span>Click on any cell to view detailed risk information</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              {/* Matrix Table */}
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="w-24 p-2"></th>
                    <th className="text-center p-2 font-medium text-gray-700" colSpan={5}>
                      Impact →
                    </th>
                  </tr>
                  <tr>
                    <th className="w-24 p-2"></th>
                    {impactLevels.map(level => (
                      <th key={level.value} className="w-32 p-2 text-center border border-gray-300">
                        <div className="font-medium text-gray-700">{level.label}</div>
                        <div className="text-xs text-gray-500">{level.description}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrix.map((row, probIndex) => (
                    <tr key={probIndex}>
                      <td className="p-2 text-center border border-gray-300 bg-gray-50">
                        <div className="font-medium text-gray-700 transform -rotate-90 whitespace-nowrap">
                          {probIndex === Math.floor(matrix.length / 2) && (
                            <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 text-sm text-gray-600">
                              ← Probability
                            </div>
                          )}
                          {probabilityLevels[probIndex].label}
                        </div>
                        <div className="text-xs text-gray-500 transform -rotate-90 whitespace-nowrap mt-1">
                          {probabilityLevels[probIndex].description}
                        </div>
                      </td>
                      {row.map((cell, impIndex) => (
                        <td
                          key={impIndex}
                          onClick={() => handleCellClick(cell)}
                          className={`h-24 p-2 border border-gray-300 cursor-pointer transition-colors ${getCellColor(cell.riskLevel, cell.count)}`}
                        >
                          <div className="h-full flex flex-col items-center justify-center">
                            <div className="text-lg font-bold text-gray-800">
                              {cell.count}
                            </div>
                            <div className="text-xs text-gray-600">
                              Score: {cell.probability * cell.impact}
                            </div>
                            <div className={`text-xs font-medium mt-1 px-2 py-1 rounded ${
                              cell.riskLevel === 'LOW' ? 'bg-green-200 text-green-800' :
                              cell.riskLevel === 'MEDIUM' ? 'bg-yellow-200 text-yellow-800' :
                              cell.riskLevel === 'HIGH' ? 'bg-orange-200 text-orange-800' :
                              'bg-red-200 text-red-800'
                            }`}>
                              {cell.riskLevel}
                            </div>
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 flex justify-center">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-200 border border-green-300 rounded"></div>
                <span className="text-sm text-gray-700">Low (1-4)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-200 border border-yellow-300 rounded"></div>
                <span className="text-sm text-gray-700">Medium (5-9)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-orange-200 border border-orange-300 rounded"></div>
                <span className="text-sm text-gray-700">High (10-16)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-200 border border-red-300 rounded"></div>
                <span className="text-sm text-gray-700">Critical (17-25)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-red-500 rounded"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Critical</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {risks.filter(r => r.riskScore > 16).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-orange-500 rounded"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {risks.filter(r => r.riskScore > 9 && r.riskScore <= 16).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-yellow-500 rounded"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Medium</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {risks.filter(r => r.riskScore > 4 && r.riskScore <= 9).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-green-500 rounded"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {risks.filter(r => r.riskScore <= 4).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cell Details Modal */}
      {showCellDetails && selectedCell && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Risk Details - {probabilityLevels.find(p => p.value === selectedCell.probability)?.label} Probability, {impactLevels.find(i => i.value === selectedCell.impact)?.label} Impact
                </h3>
                <button
                  onClick={() => setShowCellDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="mb-4">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  selectedCell.riskLevel === 'LOW' ? 'bg-green-100 text-green-800' :
                  selectedCell.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                  selectedCell.riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {selectedCell.riskLevel} Risk Level (Score: {selectedCell.probability * selectedCell.impact})
                </div>
              </div>
              
              {selectedCell.risks.length === 0 ? (
                <p className="text-gray-600">No risks in this category.</p>
              ) : (
                <div className="space-y-4">
                  {selectedCell.risks.map(risk => (
                    <div key={risk.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{risk.title}</h4>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(risk.category)}`}>
                            {risk.category}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(risk.status)}`}>
                            {risk.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        Risk Score: <span className="font-medium">{risk.riskScore}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowCellDetails(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
