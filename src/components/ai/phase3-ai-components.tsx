'use client'

import React, { useState, useEffect } from 'react'
import { Brain, TrendingUp, Users, FileText, Zap, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { AIService, getAIService, defaultAIConfig, EmployeeData, PerformancePrediction } from '@/lib/ai-service'

interface PredictiveAnalyticsProps {
  employeeData: EmployeeData[]
  className?: string
}

export function PredictiveAnalytics({ employeeData, className = '' }: PredictiveAnalyticsProps) {
  const [predictions, setPredictions] = useState<PerformancePrediction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (employeeData.length > 0) {
      generatePredictions()
    }
  }, [employeeData])

  const generatePredictions = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const aiService = getAIService(defaultAIConfig)
      const predictionPromises = employeeData.slice(0, 5).map(employee => 
        aiService.predictEmployeePerformance(employee)
      )
      
      const results = await Promise.all(predictionPromises)
      setPredictions(results)
    } catch (err) {
      setError('Failed to generate predictions. Please try again.')
      console.error('Prediction error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getRiskLevel = (score: number) => {
    if (score >= 80) return { level: 'Low Risk', color: 'text-green-600', bgColor: 'bg-green-100' }
    if (score >= 60) return { level: 'Medium Risk', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
    return { level: 'High Risk', color: 'text-red-600', bgColor: 'bg-red-100' }
  }

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            AI Predictive Analytics
          </h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Analyzing employee data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            AI Predictive Analytics
          </h3>
        </div>
        <div className="text-red-600 dark:text-red-400 text-center py-4">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Brain className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            AI Predictive Analytics
          </h3>
        </div>
        <button
          onClick={generatePredictions}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Analysis
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {predictions.map((prediction) => {
          const employee = employeeData.find(emp => emp.id === prediction.employeeId)
          const risk = getRiskLevel(prediction.predictedRating * 20) // Convert 5-point scale to 100-point scale
          
          return (
            <div key={prediction.employeeId} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  {employee?.name || 'Unknown Employee'}
                </h4>
                <span className={`px-2 py-1 rounded-full text-xs ${risk.bgColor} ${risk.color}`}>
                  {risk.level}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Predicted Score:</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {prediction.predictedRating}/5
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Confidence:</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {Math.round(prediction.confidenceScore * 100)}%
                  </span>
                </div>
                
                <div className="mt-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Key Factors:
                  </span>
                  <div className="space-y-1">
                    {prediction.riskFactors.slice(0, 2).map((factor, index) => (
                      <div key={index} className="text-xs text-gray-600 dark:text-gray-400">
                        • {factor}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {predictions.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No predictions available. Please ensure employee data is loaded.
        </div>
      )}
    </div>
  )
}

interface AIDocumentAnalysisProps {
  onAnalyze: (file: File) => void
  className?: string
}

export function AIDocumentAnalysis({ onAnalyze, className = '' }: AIDocumentAnalysisProps) {
  const [dragActive, setDragActive] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [results, setResults] = useState<any>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      await analyzeDocument(file)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      await analyzeDocument(file)
    }
  }

  const analyzeDocument = async (file: File) => {
    setAnalyzing(true)
    setResults(null)
    
    try {
      const content = await file.text()
      const aiService = getAIService(defaultAIConfig)
      const analysis = await aiService.analyzeDocument(content, file.type)
      setResults(analysis)
      onAnalyze(file)
    } catch (error) {
      console.error('Document analysis error:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center space-x-3 mb-6">
        <FileText className="w-6 h-6 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          AI Document Analysis
        </h3>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {analyzing ? (
          <div className="py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-3"></div>
            <p className="text-gray-600 dark:text-gray-400">Analyzing document...</p>
          </div>
        ) : (
          <div className="py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Drag and drop a document here, or click to select
            </p>
            <input
              type="file"
              className="hidden"
              id="document-upload"
              accept=".txt,.pdf,.doc,.docx"
              onChange={handleFileSelect}
            />
            <label
              htmlFor="document-upload"
              className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-700 transition-colors"
            >
              Select Document
            </label>
          </div>
        )}
      </div>

      {results && (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Category</h4>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                {results.category}
              </span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Confidence</h4>
              <span className="text-2xl font-bold text-green-600">
                {Math.round(results.confidence * 100)}%
              </span>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Summary</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {results.summary}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Key Points</h4>
            <ul className="space-y-1">
              {results.keyPoints.map((point: string, index: number) => (
                <li key={index} className="text-gray-600 dark:text-gray-400 text-sm flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

interface WorkflowAutomationProps {
  workflows: Array<{
    id: string
    name: string
    steps: string[]
    metrics: Record<string, number>
    bottlenecks: string[]
  }>
  className?: string
}

export function WorkflowAutomation({ workflows, className = '' }: WorkflowAutomationProps) {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<any>(null)
  const [analyzing, setAnalyzing] = useState(false)

  const analyzeWorkflow = async (workflow: any) => {
    setAnalyzing(true)
    setSelectedWorkflow(workflow.id)
    
    try {
      const aiService = getAIService(defaultAIConfig)
      const result = await aiService.analyzeWorkflow({
        processName: workflow.name,
        steps: workflow.steps,
        currentMetrics: workflow.metrics,
        bottlenecks: workflow.bottlenecks
      })
      setAnalysis(result)
    } catch (error) {
      console.error('Workflow analysis error:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center space-x-3 mb-6">
        <Zap className="w-6 h-6 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Workflow Automation
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Select Workflow</h4>
          <div className="space-y-3">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedWorkflow === workflow.id
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                }`}
                onClick={() => analyzeWorkflow(workflow)}
              >
                <h5 className="font-medium text-gray-900 dark:text-gray-100">{workflow.name}</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {workflow.steps.length} steps • {workflow.bottlenecks.length} bottlenecks
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          {analyzing && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Analyzing workflow...</span>
            </div>
          )}

          {analysis && !analyzing && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Optimization Potential</h4>
                  <span className="text-2xl font-bold text-purple-600">
                    {analysis.estimatedImprovement}%
                  </span>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  analysis.implementationPriority === 'high' 
                    ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    : analysis.implementationPriority === 'medium'
                    ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                    : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                }`}>
                  {analysis.implementationPriority.toUpperCase()} Priority
                </span>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Optimizations</h4>
                <ul className="space-y-2">
                  {analysis.optimizations.map((optimization: string, index: number) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      {optimization}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Automation Opportunities</h4>
                <ul className="space-y-2">
                  {analysis.automationOpportunities.map((opportunity: string, index: number) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                      <Zap className="w-4 h-4 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                      {opportunity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {!selectedWorkflow && !analyzing && (
            <div className="flex items-center justify-center py-8 text-gray-500 dark:text-gray-400">
              <Clock className="w-8 h-8 mr-3" />
              Select a workflow to analyze
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
