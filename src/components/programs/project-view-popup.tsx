"use client"

import { useState, useEffect } from "react"
import { 
  XMarkIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserIcon,
  FlagIcon,
  ChartBarIcon,
  ClockIcon,
  MapPinIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PauseIcon,
  PlayIcon
} from "@heroicons/react/24/outline"

interface ProjectViewPopupProps {
  projectId: string | null
  isOpen: boolean
  onClose: () => void
  onEdit: (projectId: string) => void
  permissions: any
}

interface ProjectDetails {
  id: string
  name: string
  projectGoal?: string
  description: string
  status: string
  priority: string
  progress: number
  startDate: string
  endDate: string
  budget: number
  actualSpent: number
  manager: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  country: string
  province: string
  currency: string
  objectives: any
  resultsFramework?: any
  timeframe: string
  createdAt: string
  updatedAt: string
}

export function ProjectViewPopup({ projectId, isOpen, onClose, onEdit, permissions }: ProjectViewPopupProps) {
  const [project, setProject] = useState<ProjectDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && projectId) {
      fetchProjectDetails()
    }
  }, [isOpen, projectId])

  const fetchProjectDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/programs/projects/${projectId}`)
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || result.error || 'Failed to fetch project details')
      }
      
      if (result.success) {
        const data = result.data
        // Normalize manager shape expected by the UI
        const managerUser = data.users_projects_managerIdTousers
        const normalizedManager = managerUser ? {
          firstName: managerUser.firstName || '',
          lastName: managerUser.lastName || '',
          email: managerUser.email || ''
        } : null

        // Parse objectives JSON blob to extract extra fields created on New Project
        let parsedObjectives: any = {}
        try {
          parsedObjectives = typeof data.objectives === 'string' ? JSON.parse(data.objectives || '{}') : (data.objectives || {})
        } catch {
          parsedObjectives = { raw: data.objectives }
        }

        // Parse resultsFramework if it's a string
        let parsedResultsFramework = data.resultsFramework
        if (typeof data.resultsFramework === 'string') {
          try {
            parsedResultsFramework = JSON.parse(data.resultsFramework)
            console.log('Parsed resultsFramework from string:', parsedResultsFramework)
          } catch (err) {
            console.error('Failed to parse resultsFramework:', err)
            parsedResultsFramework = null
          }
        }
        
        console.log('Project resultsFramework loaded:', parsedResultsFramework)
        console.log('Objectives count:', parsedResultsFramework?.objectives?.length || 0)

        setProject({
          ...data,
          manager: normalizedManager,
          objectivesParsed: parsedObjectives,
          resultsFramework: parsedResultsFramework
        })
      } else {
        throw new Error(result.error || 'Failed to load project details')
      }
    } catch (error) {
      console.error('Project fetch error:', error)
      setError(error instanceof Error ? error.message : 'Failed to load project details')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-green-700 bg-green-100'
      case 'planning':
        return 'text-gray-700 bg-gray-100'
      case 'on-hold':
      case 'on_hold':
        return 'text-orange-700 bg-orange-100'
      case 'completed':
        return 'text-green-800 bg-green-200'
      case 'cancelled':
        return 'text-red-700 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'text-red-700 bg-red-100'
      case 'high':
        return 'text-orange-700 bg-orange-100'
      case 'medium':
        return 'text-green-700 bg-green-100'
      case 'low':
        return 'text-gray-700 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-[95vw] max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="bg-orange-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <DocumentTextIcon className="h-6 w-6" />
            <div>
              <h2 className="text-xl font-semibold">Project Details</h2>
              <p className="text-orange-100 text-sm">View comprehensive project information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-orange-200 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(92vh-140px)]">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              <span className="ml-3 text-gray-600">Loading project details...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {project && !loading && (
            <div className="space-y-6">
              {/* Project Header */}
              <div className="border-b border-gray-200 pb-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{project.name}</h3>
                    
                    {/* Project Goal */}
                    {project.projectGoal && (
                      <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg mb-4">
                        <p className="text-sm font-bold text-orange-700 mb-2">🎯 PROJECT GOAL:</p>
                        <p className="text-gray-800">{project.projectGoal}</p>
                      </div>
                    )}
                    
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Description:</p>
                      <p className="text-gray-600 text-base">{project.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                      {project.status.replace('-', ' ').toUpperCase()}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(project.priority)}`}>
                      {project.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Progress */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <ChartBarIcon className="h-5 w-5 text-orange-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">{project.progress}%</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Budget */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <CurrencyDollarIcon className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Budget</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {formatCurrency(project.budget, project.currency)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Spent: {formatCurrency(project.actualSpent, project.currency)}
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <ClockIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Timeline</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>Start: {formatDate(project.startDate)}</div>
                    <div>End: {formatDate(project.endDate)}</div>
                  </div>
                </div>
              </div>

              {/* Project Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Project Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Project Information</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Project Manager:</span>
                        <span className="ml-2 text-gray-900">
                          {project.manager ? `${project.manager.firstName} ${project.manager.lastName}` : 'Unassigned'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Location:</span>
                        <span className="ml-2 text-gray-900">
                          {project.province && project.country ? `${project.province}, ${project.country}` : 'Not specified'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Timeframe:</span>
                        <span className="ml-2 text-gray-900">{project.timeframe || 'Not specified'}</span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <FlagIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Currency:</span>
                        <span className="ml-2 text-gray-900">{project.currency}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Project Objectives & Framework */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Objectives & Framework</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Categories</div>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {(project as any).objectivesParsed?.categories?.length ? (project as any).objectivesParsed.categories.map((c: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded text-xs">{c}</span>
                        )) : <span className="text-gray-500">—</span>}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Implementing Organizations</div>
                      <div className="mt-1 space-y-1">
                        {(project as any).objectivesParsed?.implementingOrganizations?.length ? (project as any).objectivesParsed.implementingOrganizations.map((o: string, i: number) => (
                          <div key={i}>{o}</div>
                        )) : <span className="text-gray-500">—</span>}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Evaluation Frequency</div>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {(project as any).objectivesParsed?.evaluationFrequency?.length ? (project as any).objectivesParsed.evaluationFrequency.map((f: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded text-xs">{f}</span>
                        )) : <span className="text-gray-500">—</span>}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Methodologies</div>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {(project as any).objectivesParsed?.methodologies?.length ? (project as any).objectivesParsed.methodologies.map((m: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs">{m}</span>
                        )) : <span className="text-gray-500">—</span>}
                      </div>
                    </div>
                  </div>

                  {/* Results Framework (compact view) */}
                  {(project as any).objectivesParsed?.resultsFramework?.objectives?.length ? (
                    <div className="mt-3">
                      <div className="text-gray-700 font-medium mb-2">Results Framework</div>
                      <ol className="list-decimal list-inside space-y-2">
                        {(project as any).objectivesParsed.resultsFramework.objectives.map((obj: any, oi: number) => (
                          <li key={oi}>
                            <div className="font-semibold">{obj.title || `Objective ${oi + 1}`}</div>
                            {obj.outcomes?.length ? (
                              <ol className="list-disc list-inside ml-5 space-y-1">
                                {obj.outcomes.map((out: any, i: number) => (
                                  <li key={i}>
                                    <span className="font-medium">{out.title || `Outcome ${i + 1}`}</span>
                                    {out.outputs?.length ? (
                                      <ul className="list-[square] ml-5">
                                        {out.outputs.map((op: any, k: number) => (
                                          <li key={k}>{op.title || `Output ${k + 1}`}</li>
                                        ))}
                                      </ul>
                                    ) : null}
                                  </li>
                                ))}
                              </ol>
                            ) : null}
                          </li>
                        ))}
                      </ol>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Project Timeline */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Project Timeline</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Created:</span>
                      <span className="ml-2 text-gray-900">{formatDate(project.createdAt)}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Last Updated:</span>
                      <span className="ml-2 text-gray-900">{formatDate(project.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results Framework Section */}
              {project.resultsFramework && project.resultsFramework.objectives && project.resultsFramework.objectives.length > 0 && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <DocumentTextIcon className="h-6 w-6 text-orange-600 mr-2" />
                    Results Framework
                  </h4>
                  
                  <div className="space-y-6">
                    {project.resultsFramework.objectives.map((objective: any, objIndex: number) => (
                      <div key={objective.id || objIndex} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border-l-4 border-blue-500 shadow-md">
                        <h5 className="text-lg font-bold text-blue-900 mb-2">
                          📊 Objective {objIndex + 1}: {objective.title}
                        </h5>
                        {objective.description && (
                          <p className="text-sm text-blue-800 mb-4">{objective.description}</p>
                        )}
                        
                        {/* Outcomes */}
                        {objective.outcomes && objective.outcomes.length > 0 && (
                          <div className="space-y-4 mt-4">
                            {objective.outcomes.map((outcome: any, outIndex: number) => (
                              <div key={outcome.id || outIndex} className="bg-white rounded-lg p-4 border-l-4 border-green-500 shadow-sm">
                                <h6 className="text-md font-bold text-green-700 mb-2">
                                  → Outcome {outIndex + 1}: {outcome.title}
                                </h6>
                                {outcome.description && (
                                  <p className="text-sm text-gray-700 mb-3">{outcome.description}</p>
                                )}
                                
                                {/* Outcome Indicators */}
                                {outcome.indicators && outcome.indicators.length > 0 && (
                                  <div className="bg-green-50 rounded-lg p-3 mb-3">
                                    <p className="text-xs font-semibold text-green-700 mb-2">📈 Outcome Indicators:</p>
                                    <div className="space-y-2">
                                      {outcome.indicators.map((indicator: any, indIndex: number) => (
                                        <div key={indicator.id || indIndex} className="bg-white p-2 rounded border border-green-200">
                                          <p className="text-sm font-medium text-gray-900">{indicator.description}</p>
                                          <div className="grid grid-cols-3 gap-2 mt-1 text-xs text-gray-600">
                                            <span>Baseline: {indicator.baseline} {indicator.baselineUnit}</span>
                                            <span>Target (Y1): {indicator.targets?.Year1} {indicator.targetUnit}</span>
                                            <span className="font-semibold text-green-600">Current: {indicator.current || 0} {indicator.targetUnit}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Outputs */}
                                {outcome.outputs && outcome.outputs.length > 0 && (
                                  <div className="space-y-3">
                                    {outcome.outputs.map((output: any, outpIndex: number) => (
                                      <div key={output.id || outpIndex} className="bg-orange-50 rounded-lg p-3 border-l-4 border-orange-400">
                                        <h6 className="text-sm font-bold text-orange-700 mb-2">
                                          ➜ Output {outpIndex + 1}: {output.title}
                                        </h6>
                                        {output.description && (
                                          <p className="text-xs text-gray-700 mb-2">{output.description}</p>
                                        )}
                                        
                                        {/* Output Indicators */}
                                        {output.indicators && output.indicators.length > 0 && (
                                          <div className="bg-white rounded p-2">
                                            <p className="text-xs font-semibold text-orange-700 mb-2">📊 Output Indicators:</p>
                                            <div className="space-y-1">
                                              {output.indicators.map((indicator: any, indIndex: number) => (
                                                <div key={indicator.id || indIndex} className="text-xs bg-orange-50 p-2 rounded border border-orange-200">
                                                  <p className="font-medium text-gray-900">{indicator.description}</p>
                                                  <div className="grid grid-cols-3 gap-2 mt-1 text-xs text-gray-600">
                                                    <span>Baseline: {indicator.baseline} {indicator.baselineUnit}</span>
                                                    <span>Target (Y1): {indicator.targets?.Year1} {indicator.targetUnit}</span>
                                                    <span className="font-semibold text-orange-600">Current: {indicator.current || 0} {indicator.targetUnit}</span>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Framework Summary */}
                  <div className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-4 border border-gray-200 mt-4">
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{project.resultsFramework.objectives.length}</p>
                        <p className="text-xs text-gray-600">Objectives</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">
                          {project.resultsFramework.objectives.reduce((sum: number, obj: any) => sum + (obj.outcomes?.length || 0), 0)}
                        </p>
                        <p className="text-xs text-gray-600">Outcomes</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-orange-600">
                          {project.resultsFramework.objectives.reduce((sum: number, obj: any) => 
                            sum + (obj.outcomes?.reduce((outSum: number, out: any) => outSum + (out.outputs?.length || 0), 0) || 0), 0)}
                        </p>
                        <p className="text-xs text-gray-600">Outputs</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-700">
                          {project.resultsFramework.objectives.reduce((sum: number, obj: any) => 
                            sum + (obj.outcomes?.reduce((outSum: number, out: any) => 
                              outSum + (out.indicators?.length || 0) + (out.outputs?.reduce((opSum: number, op: any) => opSum + (op.indicators?.length || 0), 0) || 0), 0) || 0), 0)}
                        </p>
                        <p className="text-xs text-gray-600">Total Indicators</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Project ID: {projectId}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                // Create a new window for PDF generation
                const printWindow = window.open('', '_blank', 'width=800,height=600')
                if (!printWindow) return

                // Get the current project data
                const projectData = project
                if (!projectData) return

                // Create the PDF content HTML
                const pdfContent = `
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <meta charset="utf-8">
                    <title>${projectData.name} - Project Report</title>
                    <style>
                      @page { 
                        size: A4;
                        margin: 2cm;
                      }
                      
                      body { 
                        font-family: Arial, sans-serif;
                        font-size: 11pt;
                        line-height: 1.4;
                        color: #000;
                        margin: 0;
                        padding: 0;
                      }
                      
                      .header {
                        border-bottom: 4px solid #f97316;
                        padding-bottom: 20px;
                        margin-bottom: 30px;
                      }
                      
                      .logo {
                        font-size: 28px;
                        font-weight: bold;
                        color: #f97316;
                        margin-bottom: 5px;
                      }
                      
                      .subtitle {
                        color: #6b7280;
                        font-size: 12px;
                        margin-bottom: 20px;
                      }
                      
                      .report-title {
                        font-size: 24px;
                        font-weight: bold;
                        color: #111827;
                        margin-bottom: 30px;
                      }
                      
                      .project-header {
                        margin-bottom: 30px;
                        page-break-inside: avoid;
                      }
                      
                      .project-name {
                        font-size: 28px;
                        font-weight: bold;
                        color: #111827;
                        margin-bottom: 20px;
                      }
                      
                      .project-goal {
                        background: #fef3c7;
                        border-left: 4px solid #f97316;
                        padding: 15px;
                        margin-bottom: 20px;
                        border-radius: 4px;
                      }
                      
                      .goal-label {
                        font-weight: bold;
                        color: #f97316;
                        margin-bottom: 8px;
                        font-size: 14px;
                      }
                      
                      .goal-text {
                        color: #111827;
                        font-size: 16px;
                        font-weight: 500;
                      }
                      
                      .description {
                        margin-bottom: 20px;
                      }
                      
                      .description-label {
                        font-weight: bold;
                        color: #374151;
                        margin-bottom: 5px;
                        font-size: 14px;
                      }
                      
                      .description-text {
                        color: #6b7280;
                        font-size: 16px;
                      }
                      
                      .status-badges {
                        margin-bottom: 30px;
                      }
                      
                      .badge {
                        display: inline-block;
                        padding: 4px 12px;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: bold;
                        margin-right: 10px;
                      }
                      
                      .badge-active {
                        background: #dcfce7;
                        color: #166534;
                      }
                      
                      .badge-high {
                        background: #fef3c7;
                        color: #92400e;
                      }
                      
                      .metrics {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 20px;
                        margin-bottom: 30px;
                        page-break-inside: avoid;
                      }
                      
                      .metric-card {
                        background: #f9fafb;
                        padding: 15px;
                        border-radius: 8px;
                        text-align: center;
                      }
                      
                      .metric-value {
                        font-size: 24px;
                        font-weight: bold;
                        color: #111827;
                        margin-bottom: 5px;
                      }
                      
                      .metric-label {
                        font-size: 12px;
                        color: #6b7280;
                        text-transform: uppercase;
                        font-weight: bold;
                      }
                      
                      .results-framework {
                        page-break-before: always;
                        margin-top: 40px;
                      }
                      
                      .framework-title {
                        font-size: 20px;
                        font-weight: bold;
                        color: #111827;
                        margin-bottom: 20px;
                        border-bottom: 2px solid #f97316;
                        padding-bottom: 10px;
                      }
                      
                      .objective {
                        background: #eff6ff;
                        border-left: 4px solid #3b82f6;
                        padding: 20px;
                        margin-bottom: 20px;
                        page-break-inside: avoid;
                      }
                      
                      .objective-title {
                        font-size: 18px;
                        font-weight: bold;
                        color: #1e40af;
                        margin-bottom: 10px;
                      }
                      
                      .objective-desc {
                        color: #1e40af;
                        margin-bottom: 15px;
                        font-size: 14px;
                      }
                      
                      .outcome {
                        background: white;
                        border-left: 4px solid #10b981;
                        padding: 15px;
                        margin-bottom: 15px;
                        page-break-inside: avoid;
                      }
                      
                      .outcome-title {
                        font-size: 16px;
                        font-weight: bold;
                        color: #047857;
                        margin-bottom: 8px;
                      }
                      
                      .outcome-desc {
                        color: #374151;
                        margin-bottom: 10px;
                        font-size: 13px;
                      }
                      
                      .indicators {
                        background: #f0fdf4;
                        padding: 10px;
                        border-radius: 4px;
                        margin-top: 10px;
                      }
                      
                      .indicator {
                        background: white;
                        padding: 8px;
                        margin-bottom: 8px;
                        border-radius: 4px;
                        border: 1px solid #d1fae5;
                        page-break-inside: avoid;
                      }
                      
                      .indicator-desc {
                        font-weight: bold;
                        color: #111827;
                        margin-bottom: 5px;
                        font-size: 13px;
                      }
                      
                      .indicator-metrics {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 10px;
                        font-size: 11px;
                        color: #6b7280;
                      }
                      
                      .current-value {
                        font-weight: bold;
                        color: #f97316;
                      }
                      
                      .output {
                        background: #fef3c7;
                        border-left: 4px solid #f59e0b;
                        padding: 15px;
                        margin-bottom: 15px;
                        page-break-inside: avoid;
                      }
                      
                      .output-title {
                        font-size: 14px;
                        font-weight: bold;
                        color: #92400e;
                        margin-bottom: 8px;
                      }
                      
                      .output-desc {
                        color: #374151;
                        margin-bottom: 10px;
                        font-size: 12px;
                      }
                      
                      .summary {
                        background: #f9fafb;
                        padding: 20px;
                        border-radius: 8px;
                        margin-top: 30px;
                        page-break-inside: avoid;
                      }
                      
                      .summary-title {
                        font-size: 16px;
                        font-weight: bold;
                        color: #111827;
                        margin-bottom: 15px;
                        text-align: center;
                      }
                      
                      .summary-grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 20px;
                        text-align: center;
                      }
                      
                      .summary-item {
                        padding: 10px;
                      }
                      
                      .summary-value {
                        font-size: 20px;
                        font-weight: bold;
                        margin-bottom: 5px;
                      }
                      
                      .summary-label {
                        font-size: 11px;
                        color: #6b7280;
                        text-transform: uppercase;
                        font-weight: bold;
                      }
                      
                      .blue { color: #3b82f6; }
                      .green { color: #10b981; }
                      .orange { color: #f59e0b; }
                      .gray { color: #6b7280; }
                    </style>
                  </head>
                  <body>
                    <div class="header">
                      <div class="logo">SAYWHAT</div>
                      <div class="subtitle">Programs & Projects Management</div>
                      <div class="report-title">PROJECT REPORT</div>
                    </div>
                    
                    <div class="project-header">
                      <div class="project-name">${projectData.name}</div>
                      ${projectData.projectGoal ? `
                        <div class="project-goal">
                          <div class="goal-label">🎯 PROJECT GOAL:</div>
                          <div class="goal-text">${projectData.projectGoal}</div>
                        </div>
                      ` : ''}
                      <div class="description">
                        <div class="description-label">Description:</div>
                        <div class="description-text">${projectData.description}</div>
                      </div>
                      <div class="status-badges">
                        <span class="badge badge-active">${projectData.status.replace('-', ' ').toUpperCase()}</span>
                        <span class="badge badge-high">${projectData.priority.toUpperCase()}</span>
                      </div>
                    </div>
                    
                    <div class="metrics">
                      <div class="metric-card">
                        <div class="metric-value">${projectData.progress || 0}%</div>
                        <div class="metric-label">Progress</div>
                      </div>
                      <div class="metric-card">
                        <div class="metric-value">$${(projectData.budget || 0).toLocaleString()}</div>
                        <div class="metric-label">Budget</div>
                      </div>
                      <div class="metric-card">
                        <div class="metric-value">${projectData.timeframe || 'N/A'}</div>
                        <div class="metric-label">Timeline</div>
                      </div>
                    </div>
                    
                    ${projectData.resultsFramework && projectData.resultsFramework.objectives && projectData.resultsFramework.objectives.length > 0 ? `
                      <div class="results-framework">
                        <div class="framework-title">📊 Results Framework</div>
                        ${projectData.resultsFramework.objectives.map((objective: any, objIndex: number) => `
                          <div class="objective">
                            <div class="objective-title">📊 Objective ${objIndex + 1}: ${objective.title}</div>
                            ${objective.description ? `<div class="objective-desc">${objective.description}</div>` : ''}
                            ${objective.outcomes && objective.outcomes.length > 0 ? `
                              ${objective.outcomes.map((outcome: any, outIndex: number) => `
                                <div class="outcome">
                                  <div class="outcome-title">→ Outcome ${outIndex + 1}: ${outcome.title}</div>
                                  ${outcome.description ? `<div class="outcome-desc">${outcome.description}</div>` : ''}
                                  ${outcome.indicators && outcome.indicators.length > 0 ? `
                                    <div class="indicators">
                                      <div style="font-weight: bold; color: #047857; margin-bottom: 8px; font-size: 12px;">📈 Outcome Indicators:</div>
                                      ${outcome.indicators.map((indicator: any) => `
                                        <div class="indicator">
                                          <div class="indicator-desc">${indicator.description}</div>
                                          <div class="indicator-metrics">
                                            <span>Baseline: ${indicator.baseline || 0} ${indicator.baselineUnit || ''}</span>
                                            <span>Target (Y1): ${indicator.targets?.Year1 || 0} ${indicator.targetUnit || ''}</span>
                                            <span class="current-value">Current: ${indicator.current || 0} ${indicator.targetUnit || ''}</span>
                                          </div>
                                        </div>
                                      `).join('')}
                                    </div>
                                  ` : ''}
                                  ${outcome.outputs && outcome.outputs.length > 0 ? `
                                    ${outcome.outputs.map((output: any, outpIndex: number) => `
                                      <div class="output">
                                        <div class="output-title">➜ Output ${outpIndex + 1}: ${output.title}</div>
                                        ${output.description ? `<div class="output-desc">${output.description}</div>` : ''}
                                        ${output.indicators && output.indicators.length > 0 ? `
                                          <div class="indicators">
                                            <div style="font-weight: bold; color: #92400e; margin-bottom: 8px; font-size: 11px;">📊 Output Indicators:</div>
                                            ${output.indicators.map((indicator: any) => `
                                              <div class="indicator">
                                                <div class="indicator-desc">${indicator.description}</div>
                                                <div class="indicator-metrics">
                                                  <span>Baseline: ${indicator.baseline || 0} ${indicator.baselineUnit || ''}</span>
                                                  <span>Target (Y1): ${indicator.targets?.Year1 || 0} ${indicator.targetUnit || ''}</span>
                                                  <span class="current-value">Current: ${indicator.current || 0} ${indicator.targetUnit || ''}</span>
                                                </div>
                                              </div>
                                            `).join('')}
                                          </div>
                                        ` : ''}
                                      </div>
                                    `).join('')}
                                  ` : ''}
                                </div>
                              `).join('')}
                            ` : ''}
                          </div>
                        `).join('')}
                        
                        <div class="summary">
                          <div class="summary-title">Framework Summary</div>
                          <div class="summary-grid">
                            <div class="summary-item">
                              <div class="summary-value blue">${projectData.resultsFramework.objectives.length}</div>
                              <div class="summary-label">Objectives</div>
                            </div>
                            <div class="summary-item">
                              <div class="summary-value green">${projectData.resultsFramework.objectives.reduce((sum: number, obj: any) => sum + (obj.outcomes?.length || 0), 0)}</div>
                              <div class="summary-label">Outcomes</div>
                            </div>
                            <div class="summary-item">
                              <div class="summary-value orange">${projectData.resultsFramework.objectives.reduce((sum: number, obj: any) => sum + (obj.outcomes?.reduce((outSum: number, out: any) => outSum + (out.outputs?.length || 0), 0) || 0), 0)}</div>
                              <div class="summary-label">Outputs</div>
                            </div>
                            <div class="summary-item">
                              <div class="summary-value gray">${projectData.resultsFramework.objectives.reduce((sum: number, obj: any) => sum + (obj.outcomes?.reduce((outSum: number, out: any) => outSum + (out.indicators?.length || 0) + (out.outputs?.reduce((opSum: number, op: any) => opSum + (op.indicators?.length || 0), 0) || 0), 0) || 0), 0)}</div>
                              <div class="summary-label">Total Indicators</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ` : ''}
                  </body>
                  </html>
                `

                // Write content to new window
                printWindow.document.write(pdfContent)
                printWindow.document.close()

                // Wait for content to load, then print
                printWindow.onload = () => {
                  setTimeout(() => {
                    printWindow.print()
                    // Close the window after printing
                    setTimeout(() => printWindow.close(), 1000)
                  }, 500)
                }
              }}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              📄 Export PDF
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            {permissions?.canEdit && (
              <button
                onClick={() => {
                  onEdit(projectId!)
                  onClose()
                }}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
              >
                Edit Project
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
