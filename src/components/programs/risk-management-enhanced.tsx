"use client"

import { useState, useEffect } from "react"
import {
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  EyeIcon,
  ClockIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  ChartBarIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarIcon
} from "@heroicons/react/24/outline"

interface RiskManagementProps {
  permissions: Record<string, boolean>
  selectedProject: number | null
  onProjectSelect: (projectId: number | null) => void
}

interface Risk {
  id: string
  title: string
  description: string
  category: 'operational' | 'financial' | 'technical' | 'political' | 'environmental' | 'security'
  probability: 'very_low' | 'low' | 'medium' | 'high' | 'very_high'
  impact: 'very_low' | 'low' | 'medium' | 'high' | 'very_high'
  riskScore: number
  status: 'identified' | 'assessing' | 'mitigating' | 'monitoring' | 'closed'
  owner: string
  identifiedDate: string
  lastReviewDate: string
  mitigation: {
    strategy: string
    actions: string[]
    timeline: string
    budget: number
    responsible: string
    status: 'planned' | 'in_progress' | 'completed'
  }
  contingency: {
    plan: string
    trigger: string
    actions: string[]
    responsible: string
  }
  monitoring: {
    indicators: string[]
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
    lastCheck: string
    nextCheck: string
  }
  history: Array<{
    date: string
    action: string
    description: string
    user: string
  }>
}

interface RiskFormData {
  title: string
  description: string
  category: 'operational' | 'financial' | 'technical' | 'political' | 'environmental' | 'security'
  probability: 'very_low' | 'low' | 'medium' | 'high' | 'very_high'
  impact: 'very_low' | 'low' | 'medium' | 'high' | 'very_high'
  owner: string
  mitigationStrategy: string
  mitigationActions: string[]
  contingencyPlan: string
  monitoringIndicators: string[]
}

export function RiskManagement({ permissions, selectedProject, onProjectSelect }: RiskManagementProps) {
  const [mounted, setMounted] = useState(false)
  const [risks, setRisks] = useState<Risk[]>([])
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null)
  const [showRiskModal, setShowRiskModal] = useState(false)
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'matrix' | 'dashboard'>('list')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterRiskLevel, setFilterRiskLevel] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const [riskForm, setRiskForm] = useState<RiskFormData>({
    title: '',
    description: '',
    category: 'operational',
    probability: 'medium',
    impact: 'medium',
    owner: '',
    mitigationStrategy: '',
    mitigationActions: [''],
    contingencyPlan: '',
    monitoringIndicators: ['']
  })

  useEffect(() => {
    setMounted(true)
    loadRisks()
  }, [selectedProject])

  const loadRisks = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setRisks(getMockRisks())
    } catch (error) {
      console.error('Error loading risks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getMockRisks = (): Risk[] => {
    return [
      {
        id: 'risk-1',
        title: 'Construction Delays Due to Weather',
        description: 'Heavy rains during construction season may delay facility construction by 2-4 weeks',
        category: 'environmental',
        probability: 'high',
        impact: 'medium',
        riskScore: 12,
        status: 'mitigating',
        owner: 'Robert Kim',
        identifiedDate: '2025-01-15',
        lastReviewDate: '2025-07-10',
        mitigation: {
          strategy: 'Schedule buffer and weather-resistant construction methods',
          actions: [
            'Add 3-week buffer to construction timeline',
            'Use weather-resistant materials where possible',
            'Establish covered work areas',
            'Monitor weather forecasts closely'
          ],
          timeline: '2 weeks',
          budget: 15000,
          responsible: 'Construction Manager',
          status: 'in_progress'
        },
        contingency: {
          plan: 'Accelerated construction plan with overtime workers',
          trigger: 'More than 1 week delay due to weather',
          actions: [
            'Deploy additional construction teams',
            'Work extended hours when weather permits',
            'Consider temporary shelter solutions'
          ],
          responsible: 'Project Manager'
        },
        monitoring: {
          indicators: ['Daily weather reports', 'Construction progress percentage', 'Days lost to weather'],
          frequency: 'daily',
          lastCheck: '2025-07-16',
          nextCheck: '2025-07-17'
        },
        history: [
          {
            date: '2025-01-15',
            action: 'Risk Identified',
            description: 'Identified potential weather delays during project planning',
            user: 'Sarah Johnson'
          },
          {
            date: '2025-03-01',
            action: 'Mitigation Started',
            description: 'Began implementing weather mitigation strategies',
            user: 'Robert Kim'
          }
        ]
      },
      {
        id: 'risk-2',
        title: 'Equipment Procurement Delays',
        description: 'Medical equipment supply chain disruptions could delay facility opening',
        category: 'operational',
        probability: 'medium',
        impact: 'high',
        riskScore: 12,
        status: 'monitoring',
        owner: 'Lisa Wang',
        identifiedDate: '2025-02-01',
        lastReviewDate: '2025-07-15',
        mitigation: {
          strategy: 'Multiple supplier strategy and early procurement',
          actions: [
            'Identify 2-3 backup suppliers for each equipment type',
            'Place orders 3 months early',
            'Negotiate expedited shipping options',
            'Consider equipment leasing as backup'
          ],
          timeline: '4 weeks',
          budget: 8000,
          responsible: 'Procurement Manager',
          status: 'completed'
        },
        contingency: {
          plan: 'Equipment leasing and phased opening',
          trigger: 'Critical equipment delivery delayed by >30 days',
          actions: [
            'Lease essential equipment temporarily',
            'Open facility with basic services first',
            'Gradually add services as equipment arrives'
          ],
          responsible: 'Operations Manager'
        },
        monitoring: {
          indicators: ['Supplier delivery confirmations', 'Equipment arrival status', 'Installation timeline'],
          frequency: 'weekly',
          lastCheck: '2025-07-15',
          nextCheck: '2025-07-22'
        },
        history: [
          {
            date: '2025-02-01',
            action: 'Risk Identified',
            description: 'Supply chain analysis revealed potential delays',
            user: 'Lisa Wang'
          }
        ]
      },
      {
        id: 'risk-3',
        title: 'Regulatory Approval Delays',
        description: 'Changes in health regulations could require additional approvals',
        category: 'political',
        probability: 'low',
        impact: 'high',
        riskScore: 8,
        status: 'monitoring',
        owner: 'James Rodriguez',
        identifiedDate: '2025-01-20',
        lastReviewDate: '2025-07-12',
        mitigation: {
          strategy: 'Early engagement with regulatory bodies and compliance buffer',
          actions: [
            'Regular meetings with health department',
            'Stay updated on regulatory changes',
            'Build compliance buffer into timeline',
            'Engage regulatory consultant'
          ],
          timeline: 'Ongoing',
          budget: 12000,
          responsible: 'Regulatory Affairs',
          status: 'in_progress'
        },
        contingency: {
          plan: 'Expedited approval process through political channels',
          trigger: 'Approval process extends beyond 60 days',
          actions: [
            'Escalate through government contacts',
            'Consider interim operating permits',
            'Engage legal counsel if necessary'
          ],
          responsible: 'Executive Director'
        },
        monitoring: {
          indicators: ['Regulatory submission status', 'Government communication', 'Approval timeline'],
          frequency: 'weekly',
          lastCheck: '2025-07-12',
          nextCheck: '2025-07-19'
        },
        history: []
      },
      {
        id: 'risk-4',
        title: 'Budget Overrun on Construction',
        description: 'Material cost increases and scope changes may exceed budget',
        category: 'financial',
        probability: 'medium',
        impact: 'medium',
        riskScore: 9,
        status: 'assessing',
        owner: 'Sarah Johnson',
        identifiedDate: '2025-03-10',
        lastReviewDate: '2025-07-14',
        mitigation: {
          strategy: 'Cost monitoring and change control process',
          actions: [
            'Weekly budget reviews',
            'Strict change control process',
            'Negotiate fixed-price contracts where possible',
            'Maintain 10% contingency fund'
          ],
          timeline: '2 weeks',
          budget: 5000,
          responsible: 'Finance Manager',
          status: 'planned'
        },
        contingency: {
          plan: 'Scope reduction and additional funding',
          trigger: 'Budget variance exceeds 15%',
          actions: [
            'Review and reduce non-essential scope',
            'Seek additional donor funding',
            'Negotiate payment terms with suppliers'
          ],
          responsible: 'Project Director'
        },
        monitoring: {
          indicators: ['Weekly budget reports', 'Material cost trends', 'Change order values'],
          frequency: 'weekly',
          lastCheck: '2025-07-14',
          nextCheck: '2025-07-21'
        },
        history: []
      }
    ]
  }

  const calculateRiskScore = (probability: string, impact: string): number => {
    const probabilityValues = { very_low: 1, low: 2, medium: 3, high: 4, very_high: 5 }
    const impactValues = { very_low: 1, low: 2, medium: 3, high: 4, very_high: 5 }
    return probabilityValues[probability as keyof typeof probabilityValues] * impactValues[impact as keyof typeof impactValues]
  }

  const getRiskLevel = (score: number): { level: string, color: string } => {
    if (score >= 16) return { level: 'Critical', color: 'bg-red-500' }
    if (score >= 12) return { level: 'High', color: 'bg-orange-500' }
    if (score >= 6) return { level: 'Medium', color: 'bg-yellow-500' }
    if (score >= 3) return { level: 'Low', color: 'bg-blue-500' }
    return { level: 'Very Low', color: 'bg-green-500' }
  }

  const createRisk = async (riskData: RiskFormData) => {
    setIsLoading(true)
    try {
      const riskScore = calculateRiskScore(riskData.probability, riskData.impact)
      const newRisk: Risk = {
        id: `risk-${Date.now()}`,
        title: riskData.title,
        description: riskData.description,
        category: riskData.category,
        probability: riskData.probability,
        impact: riskData.impact,
        riskScore,
        status: 'identified',
        owner: riskData.owner,
        identifiedDate: new Date().toISOString().split('T')[0],
        lastReviewDate: new Date().toISOString().split('T')[0],
        mitigation: {
          strategy: riskData.mitigationStrategy,
          actions: riskData.mitigationActions.filter(a => a.trim()),
          timeline: '',
          budget: 0,
          responsible: riskData.owner,
          status: 'planned'
        },
        contingency: {
          plan: riskData.contingencyPlan,
          trigger: '',
          actions: [],
          responsible: riskData.owner
        },
        monitoring: {
          indicators: riskData.monitoringIndicators.filter(i => i.trim()),
          frequency: 'weekly',
          lastCheck: new Date().toISOString().split('T')[0],
          nextCheck: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        history: [
          {
            date: new Date().toISOString().split('T')[0],
            action: 'Risk Identified',
            description: 'New risk identified and added to register',
            user: 'Current User'
          }
        ]
      }

      await new Promise(resolve => setTimeout(resolve, 500))
      setRisks(prev => [...prev, newRisk])
      setShowRiskModal(false)
      resetRiskForm()
    } catch (error) {
      console.error('Error creating risk:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateRisk = async (riskId: string, updates: Partial<Risk>) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setRisks(prev => prev.map(risk => 
        risk.id === riskId ? { 
          ...risk, 
          ...updates,
          lastReviewDate: new Date().toISOString().split('T')[0],
          riskScore: updates.probability && updates.impact 
            ? calculateRiskScore(updates.probability, updates.impact)
            : risk.riskScore
        } : risk
      ))
      setEditingRisk(null)
      setShowRiskModal(false)
      resetRiskForm()
    } catch (error) {
      console.error('Error updating risk:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteRisk = async (riskId: string) => {
    if (!confirm('Are you sure you want to delete this risk?')) return
    
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setRisks(prev => prev.filter(risk => risk.id !== riskId))
    } catch (error) {
      console.error('Error deleting risk:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetRiskForm = () => {
    setRiskForm({
      title: '',
      description: '',
      category: 'operational',
      probability: 'medium',
      impact: 'medium',
      owner: '',
      mitigationStrategy: '',
      mitigationActions: [''],
      contingencyPlan: '',
      monitoringIndicators: ['']
    })
  }

  const handleEditRisk = (risk: Risk) => {
    setEditingRisk(risk)
    setRiskForm({
      title: risk.title,
      description: risk.description,
      category: risk.category,
      probability: risk.probability,
      impact: risk.impact,
      owner: risk.owner,
      mitigationStrategy: risk.mitigation.strategy,
      mitigationActions: risk.mitigation.actions.length > 0 ? risk.mitigation.actions : [''],
      contingencyPlan: risk.contingency.plan,
      monitoringIndicators: risk.monitoring.indicators.length > 0 ? risk.monitoring.indicators : ['']
    })
    setShowRiskModal(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'identified': return 'bg-gray-100 text-gray-800'
      case 'assessing': return 'bg-yellow-100 text-yellow-800'
      case 'mitigating': return 'bg-blue-100 text-blue-800'
      case 'monitoring': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'operational': return DocumentTextIcon
      case 'financial': return ChartBarIcon
      case 'technical': return DocumentTextIcon
      case 'political': return UserIcon
      case 'environmental': return ExclamationTriangleIcon
      case 'security': return ShieldCheckIcon
      default: return ExclamationTriangleIcon
    }
  }

  const filteredRisks = risks.filter(risk => {
    const matchesSearch = risk.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         risk.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || risk.category === filterCategory
    const matchesStatus = filterStatus === 'all' || risk.status === filterStatus
    const riskLevel = getRiskLevel(risk.riskScore).level.toLowerCase()
    const matchesRiskLevel = filterRiskLevel === 'all' || riskLevel === filterRiskLevel.toLowerCase()
    return matchesSearch && matchesCategory && matchesStatus && matchesRiskLevel
  })

  const riskMatrix = Array.from({length: 5}, (_, impactIndex) => 
    Array.from({length: 5}, (_, probIndex) => {
      const score = (probIndex + 1) * (5 - impactIndex)
      const risksInCell = filteredRisks.filter(risk => risk.riskScore === score)
      return { score, risks: risksInCell, impact: 5 - impactIndex, probability: probIndex + 1 }
    })
  )

  if (!mounted) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Risk Management</h2>
          <p className="text-sm text-gray-600">Identify, assess, and manage project risks</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {permissions.canCreate && (
            <button
              onClick={() => {
                setEditingRisk(null)
                resetRiskForm()
                setShowRiskModal(true)
              }}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Risk
            </button>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-lg border">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search risks..."
          className="px-3 py-2 border border-gray-300 rounded-md text-sm flex-1 max-w-xs"
        />

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="all">All Categories</option>
          <option value="operational">Operational</option>
          <option value="financial">Financial</option>
          <option value="technical">Technical</option>
          <option value="political">Political</option>
          <option value="environmental">Environmental</option>
          <option value="security">Security</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="all">All Status</option>
          <option value="identified">Identified</option>
          <option value="assessing">Assessing</option>
          <option value="mitigating">Mitigating</option>
          <option value="monitoring">Monitoring</option>
          <option value="closed">Closed</option>
        </select>

        <select
          value={filterRiskLevel}
          onChange={(e) => setFilterRiskLevel(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="all">All Risk Levels</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value as 'list' | 'matrix' | 'dashboard')}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="list">List View</option>
          <option value="matrix">Risk Matrix</option>
          <option value="dashboard">Dashboard</option>
        </select>
      </div>

      {/* Risk Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {['Critical', 'High', 'Medium', 'Low', 'Very Low'].map(level => {
          const count = risks.filter(risk => getRiskLevel(risk.riskScore).level === level).length
          const { color } = getRiskLevel(level === 'Critical' ? 20 : level === 'High' ? 15 : level === 'Medium' ? 9 : level === 'Low' ? 4 : 1)
          
          return (
            <div key={level} className="bg-white p-6 rounded-lg border">
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full ${color} mr-3`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{level} Risk</p>
                  <p className="text-2xl font-semibold text-gray-900">{count}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Risk Content */}
      <div className="bg-white rounded-lg border">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : viewMode === 'matrix' ? (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Assessment Matrix</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="w-20 h-16 border border-gray-300 bg-gray-50 text-sm font-medium text-gray-900">
                      Impact →<br/>Probability ↓
                    </th>
                    {['Very Low', 'Low', 'Medium', 'High', 'Very High'].map(impact => (
                      <th key={impact} className="w-32 h-16 border border-gray-300 bg-gray-50 text-sm font-medium text-gray-900">
                        {impact}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {['Very High', 'High', 'Medium', 'Low', 'Very Low'].map((prob, probIndex) => (
                    <tr key={prob}>
                      <th className="w-20 h-24 border border-gray-300 bg-gray-50 text-sm font-medium text-gray-900 text-center">
                        {prob}
                      </th>
                      {riskMatrix[probIndex].map((cell, impactIndex) => {
                        const { color } = getRiskLevel(cell.score)
                        return (
                          <td key={impactIndex} className={`w-32 h-24 border border-gray-300 p-1 ${color} bg-opacity-20`}>
                            <div className="text-xs space-y-1">
                              {cell.risks.slice(0, 3).map(risk => (
                                <div 
                                  key={risk.id} 
                                  className="bg-white rounded px-1 py-0.5 cursor-pointer hover:bg-gray-100"
                                  onClick={() => setSelectedRisk(risk)}
                                  title={risk.title}
                                >
                                  {risk.title.length > 20 ? `${risk.title.slice(0, 20)}...` : risk.title}
                                </div>
                              ))}
                              {cell.risks.length > 3 && (
                                <div className="text-gray-600">+{cell.risks.length - 3} more</div>
                              )}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : viewMode === 'dashboard' ? (
          <div className="p-6 space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Risk Dashboard</h3>
            
            {/* High Priority Risks */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">High Priority Risks</h4>
              <div className="space-y-3">
                {filteredRisks
                  .filter(risk => risk.riskScore >= 12)
                  .slice(0, 5)
                  .map(risk => {
                    const { level, color } = getRiskLevel(risk.riskScore)
                    const IconComponent = getCategoryIcon(risk.category)
                    return (
                      <div key={risk.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <IconComponent className="h-5 w-5 text-gray-500 mt-1" />
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{risk.title}</h5>
                              <p className="text-sm text-gray-600 mt-1">{risk.description}</p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <span>Owner: {risk.owner}</span>
                                <span className={`px-2 py-1 rounded-full ${getStatusColor(risk.status)}`}>
                                  {risk.status}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-white ${color}`}>
                                  {level}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setSelectedRisk(risk)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category & Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Review
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRisks.map(risk => {
                  const { level, color } = getRiskLevel(risk.riskScore)
                  const IconComponent = getCategoryIcon(risk.category)
                  return (
                    <tr key={risk.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-start space-x-3">
                          <IconComponent className="h-5 w-5 text-gray-500 mt-1" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{risk.title}</div>
                            <div className="text-sm text-gray-500 max-w-xs">
                              {risk.description.length > 100 
                                ? `${risk.description.slice(0, 100)}...` 
                                : risk.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <span className="text-sm text-gray-900 capitalize">{risk.category}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(risk.status)}`}>
                            {risk.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`px-2 py-1 text-xs rounded-full text-white ${color}`}>
                            {level}
                          </span>
                          <span className="ml-2 text-sm text-gray-500">({risk.riskScore})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{risk.owner}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(risk.lastReviewDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedRisk(risk)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          {permissions.canEdit && (
                            <button
                              onClick={() => handleEditRisk(risk)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Edit"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                          )}
                          {permissions.canDelete && (
                            <button
                              onClick={() => deleteRisk(risk.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Risk Details Modal */}
      {selectedRisk && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{selectedRisk.title}</h3>
              <button
                onClick={() => setSelectedRisk(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Risk Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Risk Details</h4>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="font-medium text-gray-500">Description:</dt>
                      <dd className="text-gray-900">{selectedRisk.description}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500">Category:</dt>
                      <dd className="text-gray-900 capitalize">{selectedRisk.category}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500">Risk Level:</dt>
                      <dd className="text-gray-900">{getRiskLevel(selectedRisk.riskScore).level} ({selectedRisk.riskScore})</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500">Status:</dt>
                      <dd className="text-gray-900 capitalize">{selectedRisk.status}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Assessment</h4>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="font-medium text-gray-500">Probability:</dt>
                      <dd className="text-gray-900 capitalize">{selectedRisk.probability.replace('_', ' ')}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500">Impact:</dt>
                      <dd className="text-gray-900 capitalize">{selectedRisk.impact.replace('_', ' ')}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500">Owner:</dt>
                      <dd className="text-gray-900">{selectedRisk.owner}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500">Identified:</dt>
                      <dd className="text-gray-900">{new Date(selectedRisk.identifiedDate).toLocaleDateString()}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Mitigation Strategy */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Mitigation Strategy</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-900 mb-3">{selectedRisk.mitigation.strategy}</p>
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Mitigation Actions:</h5>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {selectedRisk.mitigation.actions.map((action, index) => (
                        <li key={index}>{action}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-gray-600">Responsible: {selectedRisk.mitigation.responsible}</span>
                    <span className={`px-2 py-1 rounded-full ${
                      selectedRisk.mitigation.status === 'completed' ? 'bg-green-100 text-green-800' :
                      selectedRisk.mitigation.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedRisk.mitigation.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contingency Plan */}
              {selectedRisk.contingency.plan && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Contingency Plan</h4>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <p className="text-sm text-gray-900 mb-2">{selectedRisk.contingency.plan}</p>
                    {selectedRisk.contingency.trigger && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Trigger:</span> {selectedRisk.contingency.trigger}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Monitoring */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Monitoring</h4>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Key Indicators:</h5>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        {selectedRisk.monitoring.indicators.map((indicator, index) => (
                          <li key={index}>{indicator}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <dl className="space-y-1">
                        <div>
                          <dt className="font-medium text-gray-700">Frequency:</dt>
                          <dd className="text-gray-600 capitalize">{selectedRisk.monitoring.frequency}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-gray-700">Last Check:</dt>
                          <dd className="text-gray-600">{new Date(selectedRisk.monitoring.lastCheck).toLocaleDateString()}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-gray-700">Next Check:</dt>
                          <dd className="text-gray-600">{new Date(selectedRisk.monitoring.nextCheck).toLocaleDateString()}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* History */}
              {selectedRisk.history.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Risk History</h4>
                  <div className="space-y-3">
                    {selectedRisk.history.map((entry, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-medium text-gray-900">{entry.action}</h5>
                          <span className="text-sm text-gray-500">{new Date(entry.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{entry.description}</p>
                        <p className="text-sm text-gray-500">By: {entry.user}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Risk Form Modal */}
      {showRiskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingRisk ? 'Edit Risk' : 'Add New Risk'}
              </h3>
              <button
                onClick={() => setShowRiskModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault()
              if (editingRisk) {
                updateRisk(editingRisk.id, {
                  title: riskForm.title,
                  description: riskForm.description,
                  category: riskForm.category,
                  probability: riskForm.probability,
                  impact: riskForm.impact,
                  owner: riskForm.owner,
                  mitigation: {
                    ...editingRisk.mitigation,
                    strategy: riskForm.mitigationStrategy,
                    actions: riskForm.mitigationActions.filter(a => a.trim())
                  },
                  contingency: {
                    ...editingRisk.contingency,
                    plan: riskForm.contingencyPlan
                  },
                  monitoring: {
                    ...editingRisk.monitoring,
                    indicators: riskForm.monitoringIndicators.filter(i => i.trim())
                  }
                })
              } else {
                createRisk(riskForm)
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Risk Title *
                </label>
                <input
                  type="text"
                  value={riskForm.title}
                  onChange={(e) => setRiskForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={riskForm.description}
                  onChange={(e) => setRiskForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={riskForm.category}
                    onChange={(e) => setRiskForm(prev => ({ ...prev, category: e.target.value as RiskFormData['category'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="operational">Operational</option>
                    <option value="financial">Financial</option>
                    <option value="technical">Technical</option>
                    <option value="political">Political</option>
                    <option value="environmental">Environmental</option>
                    <option value="security">Security</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Probability *
                  </label>
                  <select
                    value={riskForm.probability}
                    onChange={(e) => setRiskForm(prev => ({ ...prev, probability: e.target.value as RiskFormData['probability'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="very_low">Very Low</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="very_high">Very High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Impact *
                  </label>
                  <select
                    value={riskForm.impact}
                    onChange={(e) => setRiskForm(prev => ({ ...prev, impact: e.target.value as RiskFormData['impact'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="very_low">Very Low</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="very_high">Very High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Risk Owner *
                </label>
                <input
                  type="text"
                  value={riskForm.owner}
                  onChange={(e) => setRiskForm(prev => ({ ...prev, owner: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Person responsible for managing this risk"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mitigation Strategy
                </label>
                <textarea
                  value={riskForm.mitigationStrategy}
                  onChange={(e) => setRiskForm(prev => ({ ...prev, mitigationStrategy: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Overall strategy to mitigate this risk"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mitigation Actions
                </label>
                {riskForm.mitigationActions.map((action, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={action}
                      onChange={(e) => {
                        const newActions = [...riskForm.mitigationActions]
                        newActions[index] = e.target.value
                        setRiskForm(prev => ({ ...prev, mitigationActions: newActions }))
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Action ${index + 1}`}
                    />
                    {riskForm.mitigationActions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newActions = riskForm.mitigationActions.filter((_, i) => i !== index)
                          setRiskForm(prev => ({ ...prev, mitigationActions: newActions }))
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setRiskForm(prev => ({ ...prev, mitigationActions: [...prev.mitigationActions, ''] }))}
                  className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Action
                </button>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRiskModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : editingRisk ? 'Update Risk' : 'Add Risk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
