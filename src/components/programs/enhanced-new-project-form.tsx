"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  PlusIcon,
  DocumentTextIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  MapPinIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowLeftIcon,
  CloudArrowUpIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  ChevronRightIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline"

interface NewProjectProps {
  onCancel: () => void
  onSuccess: () => void
}

interface Objective {
  id: string
  title: string
  description: string
  outcomes: Outcome[]
}

interface Outcome {
  id: string
  title: string
  indicatorDescription: string
  baseline: string
  targets: { [year: string]: string } // Year 1, Year 2, etc.
  monitoringMethod: string
  dataCollectionFrequency: string
  dataSource: string
  disaggregation: string
  comment: string
  outputs: Output[]
}

interface Output {
  id: string
  title: string
  indicatorDescription: string
  baseline: string
  targets: { [year: string]: string }
  monitoringMethod: string
  dataCollectionFrequency: string
  dataSource: string
  disaggregation: string
  comment: string
}

interface ImplementingOrganization {
  id: string
  name: string
  role: string
  contact: string
}

interface ReportingFrequency {
  type: 'midterm' | 'endterm' | 'annual' | 'other'
  date: string
}

interface ProjectFormData {
  // Project Information
  projectCode: string
  name: string
  description: string
  projectLead: string
  categories: string[] // Multiple selection
  startDate: string
  endDate: string
  country: string
  province: string
  
  // Financial Details
  fundingSource: string
  budgetBreakdownFile: File | null
  grantsERequisiteIntegration: boolean
  
  // Results Framework
  objectives: Objective[]
  
  // Management and Timeline
  implementingOrganizations: ImplementingOrganization[]
  reportingFrequencies: ReportingFrequency[]
  methodologies: string[] // Up to 5: Narrative, Financial, Log frame, Visibility, Other
}

const PROJECT_CATEGORIES = [
  'Child protection',
  'Climate Action',
  'Disaster and Emergency Preparedness',
  'Drug and Substance Abuse',
  'Education',
  'Empowerment and Livelihoods',
  'Maternal Health',
  'Mental Health',
  'Non-Communicable diseases',
  'SRHR'
]

const METHODOLOGIES = [
  'Narrative',
  'Financial',
  'Log frame',
  'Visibility',
  'Other'
]

const REPORTING_FREQUENCIES = [
  'midterm',
  'endterm',
  'annual',
  'other'
]

export function EnhancedNewProjectForm({ onCancel, onSuccess }: NewProjectProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const [formData, setFormData] = useState<ProjectFormData>({
    projectCode: '',
    name: '',
    description: '',
    projectLead: '',
    categories: [],
    startDate: '',
    endDate: '',
    country: '',
    province: '',
    fundingSource: '',
    budgetBreakdownFile: null,
    grantsERequisiteIntegration: false,
    objectives: [],
    implementingOrganizations: [],
    reportingFrequencies: [],
    methodologies: []
  })

  const steps = [
    {
      id: 1,
      title: "Project Information",
      description: "Basic project details, lead, and categories",
      icon: DocumentTextIcon
    },
    {
      id: 2,
      title: "Financial Details",
      description: "Funding source and budget integration",
      icon: BanknotesIcon
    },
    {
      id: 3,
      title: "Results Framework",
      description: "Objectives, outcomes, and outputs with indicators",
      icon: ChartBarIcon
    },
    {
      id: 4,
      title: "Management & Timeline",
      description: "Organizations, reporting, and methodologies",
      icon: UserGroupIcon
    }
  ]

  const addObjective = () => {
    const newObjective: Objective = {
      id: `obj_${Date.now()}`,
      title: '',
      description: '',
      outcomes: []
    }
    setFormData(prev => ({
      ...prev,
      objectives: [...prev.objectives, newObjective]
    }))
  }

  const addOutcome = (objectiveId: string) => {
    const newOutcome: Outcome = {
      id: `out_${Date.now()}`,
      title: '',
      indicatorDescription: '',
      baseline: '',
      targets: {},
      monitoringMethod: '',
      dataCollectionFrequency: '',
      dataSource: '',
      disaggregation: '',
      comment: '',
      outputs: []
    }
    
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.map(obj => 
        obj.id === objectiveId 
          ? { ...obj, outcomes: [...obj.outcomes, newOutcome] }
          : obj
      )
    }))
  }

  const addOutput = (objectiveId: string, outcomeId: string) => {
    const newOutput: Output = {
      id: `out_${Date.now()}`,
      title: '',
      indicatorDescription: '',
      baseline: '',
      targets: {},
      monitoringMethod: '',
      dataCollectionFrequency: '',
      dataSource: '',
      disaggregation: '',
      comment: ''
    }
    
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.map(obj => 
        obj.id === objectiveId 
          ? {
              ...obj,
              outcomes: obj.outcomes.map(outcome =>
                outcome.id === outcomeId
                  ? { ...outcome, outputs: [...outcome.outputs, newOutput] }
                  : outcome
              )
            }
          : obj
      )
    }))
  }

  const getProjectDurationYears = () => {
    if (!formData.startDate || !formData.endDate) return []
    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)
    const years = []
    for (let year = start.getFullYear(); year <= end.getFullYear() && years.length < 5; year++) {
      years.push(`Year ${years.length + 1}`)
    }
    return years
  }

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }))
  }

  const handleMethodologyChange = (methodology: string) => {
    setFormData(prev => ({
      ...prev,
      methodologies: prev.methodologies.includes(methodology)
        ? prev.methodologies.filter(m => m !== methodology)
        : prev.methodologies.length < 5
        ? [...prev.methodologies, methodology]
        : prev.methodologies
    }))
  }

  const addImplementingOrganization = () => {
    if (formData.implementingOrganizations.length < 10) {
      const newOrg: ImplementingOrganization = {
        id: `org_${Date.now()}`,
        name: '',
        role: '',
        contact: ''
      }
      setFormData(prev => ({
        ...prev,
        implementingOrganizations: [...prev.implementingOrganizations, newOrg]
      }))
    }
  }

  const addReportingFrequency = () => {
    const newFreq: ReportingFrequency = {
      type: 'midterm',
      date: ''
    }
    setFormData(prev => ({
      ...prev,
      reportingFrequencies: [...prev.reportingFrequencies, newFreq]
    }))
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}
    
    switch (step) {
      case 1:
        if (!formData.projectCode) newErrors.projectCode = 'Project code is required'
        if (!formData.name) newErrors.name = 'Project name is required'
        if (!formData.description) newErrors.description = 'Project description is required'
        if (!formData.projectLead) newErrors.projectLead = 'Project lead is required'
        if (formData.categories.length === 0) newErrors.categories = 'At least one category must be selected'
        if (!formData.startDate) newErrors.startDate = 'Start date is required'
        if (!formData.endDate) newErrors.endDate = 'End date is required'
        if (!formData.country) newErrors.country = 'Country is required'
        break
      case 2:
        if (!formData.fundingSource) newErrors.fundingSource = 'Funding source is required'
        break
      case 3:
        if (formData.objectives.length === 0) newErrors.objectives = 'At least one objective is required'
        break
      case 4:
        if (formData.implementingOrganizations.length === 0) newErrors.implementingOrganizations = 'At least one implementing organization is required'
        if (formData.reportingFrequencies.length === 0) newErrors.reportingFrequencies = 'At least one reporting frequency is required'
        break
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return
    
    setIsSubmitting(true)
    try {
      const formDataToSubmit = new FormData()
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'budgetBreakdownFile' && value) {
          formDataToSubmit.append('budgetBreakdownFile', value)
        } else if (Array.isArray(value)) {
          formDataToSubmit.append(key, JSON.stringify(value))
        } else if (typeof value === 'object') {
          formDataToSubmit.append(key, JSON.stringify(value))
        } else {
          formDataToSubmit.append(key, String(value))
        }
      })

      const response = await fetch('/api/programs/projects', {
        method: 'POST',
        body: formDataToSubmit
      })

      if (response.ok) {
        onSuccess()
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create project')
      }
    } catch (error) {
      console.error('Error creating project:', error)
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to create project' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderProjectInformation = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-saywhat-dark mb-4">Project Information</h3>
        <p className="text-sm text-saywhat-grey mb-6">
          Enter the basic project details, lead information, and categorization.
        </p>
      </div>

      {/* Project Code */}
      <div>
        <label className="block text-sm font-medium text-saywhat-dark mb-2">
          Project Code *
        </label>
        <input
          type="text"
          value={formData.projectCode}
          onChange={(e) => setFormData(prev => ({ ...prev, projectCode: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-saywhat-orange focus:border-saywhat-orange"
          placeholder="e.g., SAYWHAT-2025-001"
        />
        {errors.projectCode && <p className="text-red-600 text-sm mt-1">{errors.projectCode}</p>}
      </div>

      {/* Project Name */}
      <div>
        <label className="block text-sm font-medium text-saywhat-dark mb-2">
          Project Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-saywhat-orange focus:border-saywhat-orange"
          placeholder="Enter project name"
        />
        {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
      </div>

      {/* Description with Document Upload */}
      <div>
        <label className="block text-sm font-medium text-saywhat-dark mb-2">
          Project Description *
        </label>
        <textarea
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-saywhat-orange focus:border-saywhat-orange"
          placeholder="Provide a comprehensive description of the project..."
        />
        <div className="mt-2">
          <label className="flex items-center justify-center w-full h-12 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-saywhat-orange">
            <CloudArrowUpIcon className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">Upload project documents (PDF, Word, etc.)</span>
            <input type="file" className="hidden" multiple accept=".pdf,.doc,.docx,.ppt,.pptx" />
          </label>
        </div>
        {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
      </div>

      {/* Project Lead */}
      <div>
        <label className="block text-sm font-medium text-saywhat-dark mb-2">
          Project Lead *
        </label>
        <input
          type="text"
          value={formData.projectLead}
          onChange={(e) => setFormData(prev => ({ ...prev, projectLead: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-saywhat-orange focus:border-saywhat-orange"
          placeholder="Enter project lead name"
        />
        {errors.projectLead && <p className="text-red-600 text-sm mt-1">{errors.projectLead}</p>}
      </div>

      {/* Categories (Multiple Selection) */}
      <div>
        <label className="block text-sm font-medium text-saywhat-dark mb-2">
          Project Categories * (Select all that apply)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {PROJECT_CATEGORIES.map((category) => (
            <label key={category} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.categories.includes(category)}
                onChange={() => handleCategoryChange(category)}
                className="rounded border-gray-300 text-saywhat-orange focus:ring-saywhat-orange"
              />
              <span className="text-sm text-saywhat-dark">{category}</span>
            </label>
          ))}
        </div>
        {errors.categories && <p className="text-red-600 text-sm mt-1">{errors.categories}</p>}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-saywhat-dark mb-2">
            Start Date *
          </label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-saywhat-orange focus:border-saywhat-orange"
          />
          {errors.startDate && <p className="text-red-600 text-sm mt-1">{errors.startDate}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-saywhat-dark mb-2">
            End Date *
          </label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-saywhat-orange focus:border-saywhat-orange"
          />
          {errors.endDate && <p className="text-red-600 text-sm mt-1">{errors.endDate}</p>}
        </div>
      </div>

      {/* Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-saywhat-dark mb-2">
            Country *
          </label>
          <input
            type="text"
            value={formData.country}
            onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-saywhat-orange focus:border-saywhat-orange"
            placeholder="e.g., Zimbabwe"
          />
          {errors.country && <p className="text-red-600 text-sm mt-1">{errors.country}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-saywhat-dark mb-2">
            Province
          </label>
          <input
            type="text"
            value={formData.province}
            onChange={(e) => setFormData(prev => ({ ...prev, province: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-saywhat-orange focus:border-saywhat-orange"
            placeholder="e.g., Harare"
          />
        </div>
      </div>
    </div>
  )

  const renderFinancialDetails = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-saywhat-dark mb-4">Financial Details</h3>
        <p className="text-sm text-saywhat-grey mb-6">
          Configure funding sources and budget integration with Grants e-requisite platform.
        </p>
      </div>

      {/* Funding Source */}
      <div>
        <label className="block text-sm font-medium text-saywhat-dark mb-2">
          Funding Source Details *
        </label>
        <input
          type="text"
          value={formData.fundingSource}
          onChange={(e) => setFormData(prev => ({ ...prev, fundingSource: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-saywhat-orange focus:border-saywhat-orange"
          placeholder="e.g., USAID, UNICEF, World Bank..."
        />
        {errors.fundingSource && <p className="text-red-600 text-sm mt-1">{errors.fundingSource}</p>}
      </div>

      {/* Budget Breakdown Upload */}
      <div>
        <label className="block text-sm font-medium text-saywhat-dark mb-2">
          Budget Breakdown Document
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-saywhat-orange transition-colors">
          <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <div className="space-y-2">
            <p className="text-sm font-medium text-saywhat-dark">Upload budget breakdown</p>
            <p className="text-xs text-saywhat-grey">
              Upload detailed budget breakdown in Excel, PDF, or Word format
            </p>
            <label className="inline-flex items-center px-4 py-2 bg-saywhat-orange text-white rounded-md cursor-pointer hover:bg-orange-600">
              <span>Choose File</span>
              <input
                type="file"
                className="hidden"
                accept=".xlsx,.xls,.pdf,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setFormData(prev => ({ ...prev, budgetBreakdownFile: file }))
                  }
                }}
              />
            </label>
          </div>
          {formData.budgetBreakdownFile && (
            <div className="mt-3 text-sm text-green-600">
              ✓ {formData.budgetBreakdownFile.name}
            </div>
          )}
        </div>
      </div>

      {/* Grants e-Requisite Integration */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={formData.grantsERequisiteIntegration}
            onChange={(e) => setFormData(prev => ({ ...prev, grantsERequisiteIntegration: e.target.checked }))}
            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <label className="text-sm font-medium text-blue-900">
              Integrate with Grants e-Requisite Platform
            </label>
            <p className="text-xs text-blue-700 mt-1">
              Enable real-time budget tracking and performance monitoring through the Grants e-requisite platform. 
              This will provide live updates on budget utilization, requisitions, and acquittals for dashboard analytics.
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderResultsFramework = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-saywhat-dark mb-4">Results Framework</h3>
        <p className="text-sm text-saywhat-grey mb-6">
          Define objectives, outcomes, and outputs with comprehensive indicators and monitoring framework.
        </p>
      </div>

      {/* Objectives */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-md font-medium text-saywhat-dark">Objectives (Up to 10)</h4>
          <button
            type="button"
            onClick={addObjective}
            disabled={formData.objectives.length >= 10}
            className="flex items-center px-3 py-2 text-sm bg-saywhat-orange text-white rounded-md hover:bg-orange-600 disabled:opacity-50"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Objective
          </button>
        </div>

        {formData.objectives.map((objective, objIndex) => (
          <div key={objective.id} className="border border-gray-200 rounded-md p-4 mb-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Objective {objIndex + 1} Title
                </label>
                <input
                  type="text"
                  value={objective.title}
                  onChange={(e) => {
                    const newObjectives = [...formData.objectives]
                    newObjectives[objIndex] = { ...objective, title: e.target.value }
                    setFormData(prev => ({ ...prev, objectives: newObjectives }))
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-saywhat-orange focus:border-saywhat-orange"
                  placeholder="Enter objective title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-saywhat-dark mb-2">
                  Objective Description
                </label>
                <textarea
                  rows={2}
                  value={objective.description}
                  onChange={(e) => {
                    const newObjectives = [...formData.objectives]
                    newObjectives[objIndex] = { ...objective, description: e.target.value }
                    setFormData(prev => ({ ...prev, objectives: newObjectives }))
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-saywhat-orange focus:border-saywhat-orange"
                  placeholder="Describe the objective"
                />
              </div>

              {/* Outcomes for this Objective */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="text-sm font-medium text-saywhat-dark">Outcomes (Up to 10 per objective)</h5>
                  <button
                    type="button"
                    onClick={() => addOutcome(objective.id)}
                    disabled={objective.outcomes.length >= 10}
                    className="flex items-center px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    <PlusIcon className="h-3 w-3 mr-1" />
                    Add Outcome
                  </button>
                </div>

                {objective.outcomes.map((outcome, outIndex) => (
                  <div key={outcome.id} className="bg-gray-50 border border-gray-200 rounded p-3 mb-3">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Outcome {outIndex + 1} Title
                        </label>
                        <input
                          type="text"
                          value={outcome.title}
                          onChange={(e) => {
                            const newObjectives = [...formData.objectives]
                            newObjectives[objIndex].outcomes[outIndex] = { ...outcome, title: e.target.value }
                            setFormData(prev => ({ ...prev, objectives: newObjectives }))
                          }}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter outcome title"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Indicator Description
                          </label>
                          <textarea
                            rows={2}
                            value={outcome.indicatorDescription}
                            onChange={(e) => {
                              const newObjectives = [...formData.objectives]
                              newObjectives[objIndex].outcomes[outIndex] = { ...outcome, indicatorDescription: e.target.value }
                              setFormData(prev => ({ ...prev, objectives: newObjectives }))
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Describe the indicator"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Baseline
                          </label>
                          <input
                            type="text"
                            value={outcome.baseline}
                            onChange={(e) => {
                              const newObjectives = [...formData.objectives]
                              newObjectives[objIndex].outcomes[outIndex] = { ...outcome, baseline: e.target.value }
                              setFormData(prev => ({ ...prev, objectives: newObjectives }))
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Current baseline"
                          />
                        </div>
                      </div>

                      {/* Targets for each year */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Targets by Year
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                          {getProjectDurationYears().map((year) => (
                            <div key={year}>
                              <label className="block text-xs text-gray-600 mb-1">{year}</label>
                              <input
                                type="text"
                                value={outcome.targets[year] || ''}
                                onChange={(e) => {
                                  const newObjectives = [...formData.objectives]
                                  newObjectives[objIndex].outcomes[outIndex] = {
                                    ...outcome,
                                    targets: { ...outcome.targets, [year]: e.target.value }
                                  }
                                  setFormData(prev => ({ ...prev, objectives: newObjectives }))
                                }}
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Target"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Monitoring Method
                          </label>
                          <input
                            type="text"
                            value={outcome.monitoringMethod}
                            onChange={(e) => {
                              const newObjectives = [...formData.objectives]
                              newObjectives[objIndex].outcomes[outIndex] = { ...outcome, monitoringMethod: e.target.value }
                              setFormData(prev => ({ ...prev, objectives: newObjectives }))
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                            placeholder="How to monitor"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Data Collection Frequency
                          </label>
                          <select
                            value={outcome.dataCollectionFrequency}
                            onChange={(e) => {
                              const newObjectives = [...formData.objectives]
                              newObjectives[objIndex].outcomes[outIndex] = { ...outcome, dataCollectionFrequency: e.target.value }
                              setFormData(prev => ({ ...prev, objectives: newObjectives }))
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select frequency</option>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="semi-annually">Semi-annually</option>
                            <option value="annually">Annually</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Data Source
                          </label>
                          <input
                            type="text"
                            value={outcome.dataSource}
                            onChange={(e) => {
                              const newObjectives = [...formData.objectives]
                              newObjectives[objIndex].outcomes[outIndex] = { ...outcome, dataSource: e.target.value }
                              setFormData(prev => ({ ...prev, objectives: newObjectives }))
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Source of data"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Disaggregation
                          </label>
                          <input
                            type="text"
                            value={outcome.disaggregation}
                            onChange={(e) => {
                              const newObjectives = [...formData.objectives]
                              newObjectives[objIndex].outcomes[outIndex] = { ...outcome, disaggregation: e.target.value }
                              setFormData(prev => ({ ...prev, objectives: newObjectives }))
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., by age, gender, location"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Comment
                          </label>
                          <input
                            type="text"
                            value={outcome.comment}
                            onChange={(e) => {
                              const newObjectives = [...formData.objectives]
                              newObjectives[objIndex].outcomes[outIndex] = { ...outcome, comment: e.target.value }
                              setFormData(prev => ({ ...prev, objectives: newObjectives }))
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Additional comments"
                          />
                        </div>
                      </div>

                      {/* Outputs for this Outcome */}
                      <div className="mt-3">
                        <div className="flex justify-between items-center mb-2">
                          <h6 className="text-xs font-medium text-gray-700">Outputs (Up to 10)</h6>
                          <button
                            type="button"
                            onClick={() => addOutput(objective.id, outcome.id)}
                            disabled={outcome.outputs.length >= 10}
                            className="flex items-center px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                          >
                            <PlusIcon className="h-3 w-3 mr-1" />
                            Add Output
                          </button>
                        </div>

                        {outcome.outputs.map((output, outputIndex) => (
                          <div key={output.id} className="bg-white border border-gray-200 rounded p-2 mb-2">
                            <div className="text-xs text-gray-600 mb-2">Output {outputIndex + 1}</div>
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={output.title}
                                onChange={(e) => {
                                  const newObjectives = [...formData.objectives]
                                  newObjectives[objIndex].outcomes[outIndex].outputs[outputIndex] = { ...output, title: e.target.value }
                                  setFormData(prev => ({ ...prev, objectives: newObjectives }))
                                }}
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                                placeholder="Output title"
                              />
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <textarea
                                  rows={2}
                                  value={output.indicatorDescription}
                                  onChange={(e) => {
                                    const newObjectives = [...formData.objectives]
                                    newObjectives[objIndex].outcomes[outIndex].outputs[outputIndex] = { ...output, indicatorDescription: e.target.value }
                                    setFormData(prev => ({ ...prev, objectives: newObjectives }))
                                  }}
                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                                  placeholder="Indicator description"
                                />
                                <input
                                  type="text"
                                  value={output.baseline}
                                  onChange={(e) => {
                                    const newObjectives = [...formData.objectives]
                                    newObjectives[objIndex].outcomes[outIndex].outputs[outputIndex] = { ...output, baseline: e.target.value }
                                    setFormData(prev => ({ ...prev, objectives: newObjectives }))
                                  }}
                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                                  placeholder="Baseline"
                                />
                              </div>

                              {/* Output targets by year */}
                              <div className="grid grid-cols-2 md:grid-cols-5 gap-1">
                                {getProjectDurationYears().map((year) => (
                                  <input
                                    key={year}
                                    type="text"
                                    value={output.targets[year] || ''}
                                    onChange={(e) => {
                                      const newObjectives = [...formData.objectives]
                                      newObjectives[objIndex].outcomes[outIndex].outputs[outputIndex] = {
                                        ...output,
                                        targets: { ...output.targets, [year]: e.target.value }
                                      }
                                      setFormData(prev => ({ ...prev, objectives: newObjectives }))
                                    }}
                                    className="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                                    placeholder={year}
                                  />
                                ))}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                <input
                                  type="text"
                                  value={output.monitoringMethod}
                                  onChange={(e) => {
                                    const newObjectives = [...formData.objectives]
                                    newObjectives[objIndex].outcomes[outIndex].outputs[outputIndex] = { ...output, monitoringMethod: e.target.value }
                                    setFormData(prev => ({ ...prev, objectives: newObjectives }))
                                  }}
                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                                  placeholder="Monitoring method"
                                />
                                <select
                                  value={output.dataCollectionFrequency}
                                  onChange={(e) => {
                                    const newObjectives = [...formData.objectives]
                                    newObjectives[objIndex].outcomes[outIndex].outputs[outputIndex] = { ...output, dataCollectionFrequency: e.target.value }
                                    setFormData(prev => ({ ...prev, objectives: newObjectives }))
                                  }}
                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                                >
                                  <option value="">Frequency</option>
                                  <option value="monthly">Monthly</option>
                                  <option value="quarterly">Quarterly</option>
                                  <option value="semi-annually">Semi-annually</option>
                                  <option value="annually">Annually</option>
                                </select>
                                <input
                                  type="text"
                                  value={output.dataSource}
                                  onChange={(e) => {
                                    const newObjectives = [...formData.objectives]
                                    newObjectives[objIndex].outcomes[outIndex].outputs[outputIndex] = { ...output, dataSource: e.target.value }
                                    setFormData(prev => ({ ...prev, objectives: newObjectives }))
                                  }}
                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                                  placeholder="Data source"
                                />
                                <input
                                  type="text"
                                  value={output.disaggregation}
                                  onChange={(e) => {
                                    const newObjectives = [...formData.objectives]
                                    newObjectives[objIndex].outcomes[outIndex].outputs[outputIndex] = { ...output, disaggregation: e.target.value }
                                    setFormData(prev => ({ ...prev, objectives: newObjectives }))
                                  }}
                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                                  placeholder="Disaggregation"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {formData.objectives.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <ClipboardDocumentListIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No objectives added yet. Click "Add Objective" to get started.</p>
          </div>
        )}

        {errors.objectives && <p className="text-red-600 text-sm mt-1">{errors.objectives}</p>}
      </div>
    </div>
  )

  const renderManagementTimeline = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-saywhat-dark mb-4">Management & Timeline</h3>
        <p className="text-sm text-saywhat-grey mb-6">
          Configure implementing organizations, reporting schedules, and project methodologies.
        </p>
      </div>

      {/* Implementing Organizations */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-md font-medium text-saywhat-dark">Implementing Organizations (Up to 10)</h4>
          <button
            type="button"
            onClick={addImplementingOrganization}
            disabled={formData.implementingOrganizations.length >= 10}
            className="flex items-center px-3 py-2 text-sm bg-saywhat-orange text-white rounded-md hover:bg-orange-600 disabled:opacity-50"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Organization
          </button>
        </div>

        {formData.implementingOrganizations.map((org, index) => (
          <div key={org.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-md mb-3">
            <div>
              <label className="block text-sm font-medium text-saywhat-dark mb-2">
                Organization Name
              </label>
              <input
                type="text"
                value={org.name}
                onChange={(e) => {
                  const newOrgs = [...formData.implementingOrganizations]
                  newOrgs[index] = { ...org, name: e.target.value }
                  setFormData(prev => ({ ...prev, implementingOrganizations: newOrgs }))
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-saywhat-orange focus:border-saywhat-orange"
                placeholder="Organization name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-saywhat-dark mb-2">
                Role
              </label>
              <input
                type="text"
                value={org.role}
                onChange={(e) => {
                  const newOrgs = [...formData.implementingOrganizations]
                  newOrgs[index] = { ...org, role: e.target.value }
                  setFormData(prev => ({ ...prev, implementingOrganizations: newOrgs }))
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-saywhat-orange focus:border-saywhat-orange"
                placeholder="Implementation role"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-saywhat-dark mb-2">
                Contact Information
              </label>
              <input
                type="text"
                value={org.contact}
                onChange={(e) => {
                  const newOrgs = [...formData.implementingOrganizations]
                  newOrgs[index] = { ...org, contact: e.target.value }
                  setFormData(prev => ({ ...prev, implementingOrganizations: newOrgs }))
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-saywhat-orange focus:border-saywhat-orange"
                placeholder="Email or phone"
              />
            </div>
          </div>
        ))}

        {formData.implementingOrganizations.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <BuildingOfficeIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No implementing organizations added yet.</p>
          </div>
        )}

        {errors.implementingOrganizations && <p className="text-red-600 text-sm mt-1">{errors.implementingOrganizations}</p>}
      </div>

      {/* Reporting Frequencies */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-md font-medium text-saywhat-dark">Reporting Schedule</h4>
          <button
            type="button"
            onClick={addReportingFrequency}
            className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Reporting Schedule
          </button>
        </div>

        {formData.reportingFrequencies.map((freq, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-200 rounded-md mb-3">
            <div>
              <label className="block text-sm font-medium text-saywhat-dark mb-2">
                Reporting Type
              </label>
              <select
                value={freq.type}
                onChange={(e) => {
                  const newFreqs = [...formData.reportingFrequencies]
                  newFreqs[index] = { ...freq, type: e.target.value as any }
                  setFormData(prev => ({ ...prev, reportingFrequencies: newFreqs }))
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-saywhat-orange focus:border-saywhat-orange"
              >
                <option value="midterm">Midterm</option>
                <option value="endterm">End term</option>
                <option value="annual">Annual</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-saywhat-dark mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={freq.date}
                onChange={(e) => {
                  const newFreqs = [...formData.reportingFrequencies]
                  newFreqs[index] = { ...freq, date: e.target.value }
                  setFormData(prev => ({ ...prev, reportingFrequencies: newFreqs }))
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-saywhat-orange focus:border-saywhat-orange"
              />
            </div>
          </div>
        ))}

        {formData.reportingFrequencies.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <CalendarIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No reporting schedules added yet.</p>
          </div>
        )}

        {errors.reportingFrequencies && <p className="text-red-600 text-sm mt-1">{errors.reportingFrequencies}</p>}
      </div>

      {/* Methodologies */}
      <div>
        <h4 className="text-md font-medium text-saywhat-dark mb-4">Project Methodologies (Up to 5)</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {METHODOLOGIES.map((methodology) => (
            <label key={methodology} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.methodologies.includes(methodology)}
                onChange={() => handleMethodologyChange(methodology)}
                disabled={!formData.methodologies.includes(methodology) && formData.methodologies.length >= 5}
                className="rounded border-gray-300 text-saywhat-orange focus:ring-saywhat-orange disabled:opacity-50"
              />
              <span className="text-sm text-saywhat-dark">{methodology}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-saywhat-grey mt-2">
          Select up to 5 methodologies that will be used in this project
        </p>
      </div>
    </div>
  )

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderProjectInformation()
      case 2:
        return renderFinancialDetails()
      case 3:
        return renderResultsFramework()
      case 4:
        return renderManagementTimeline()
      default:
        return renderProjectInformation()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={onCancel}
                className="flex items-center text-saywhat-grey hover:text-saywhat-dark"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Programs
              </button>
            </div>
            <h1 className="text-xl font-semibold text-saywhat-dark">Create New Project</h1>
            <div className="w-32"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <nav className="flex items-center justify-center">
              <ol className="flex items-center space-x-4">
                {steps.map((step, index) => {
                  const isActive = currentStep === step.id
                  const isCompleted = currentStep > step.id
                  
                  return (
                    <li key={step.id} className="flex items-center">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                        isCompleted 
                          ? 'bg-saywhat-orange border-saywhat-orange text-white' 
                          : isActive 
                          ? 'border-saywhat-orange text-saywhat-orange' 
                          : 'border-gray-300 text-gray-400'
                      }`}>
                        {isCompleted ? (
                          <CheckCircleIcon className="h-5 w-5" />
                        ) : (
                          <step.icon className="h-4 w-4" />
                        )}
                      </div>
                      <span className={`ml-2 text-sm font-medium ${
                        isActive ? 'text-saywhat-orange' : isCompleted ? 'text-saywhat-dark' : 'text-gray-400'
                      }`}>
                        {step.title}
                      </span>
                      {index < steps.length - 1 && (
                        <ChevronRightIcon className="h-4 w-4 text-gray-400 ml-4" />
                      )}
                    </li>
                  )
                })}
              </ol>
            </nav>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            {renderStepContent()}
          </div>

          {/* Form Navigation */}
          <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
            <div>
              {currentStep > 1 && (
                <button
                  onClick={prevStep}
                  className="flex items-center px-4 py-2 text-sm font-medium text-saywhat-grey hover:text-saywhat-dark"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Previous
                </button>
              )}
            </div>

            <div className="text-sm text-saywhat-grey">
              Step {currentStep} of {steps.length}
            </div>

            <div>
              {currentStep < steps.length ? (
                <button
                  onClick={nextStep}
                  className="flex items-center px-4 py-2 bg-saywhat-orange text-white rounded-md hover:bg-orange-600"
                >
                  Next
                  <ChevronRightIcon className="h-4 w-4 ml-2" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center px-6 py-2 bg-saywhat-orange text-white rounded-md hover:bg-orange-600 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Creating Project...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Create Project
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Error Display */}
          {errors.submit && (
            <div className="px-6 py-4 bg-red-50 border-t border-red-200">
              <div className="flex items-center">
                <XMarkIcon className="h-5 w-5 text-red-400 mr-3" />
                <div className="text-sm text-red-800">{errors.submit}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export { EnhancedNewProjectForm as NewProjectForm }
