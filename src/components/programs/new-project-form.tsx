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
  FlagIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowLeftIcon,
  CloudArrowUpIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline"

interface NewProjectProps {
  onCancel: () => void
  onSuccess: () => void
}

interface ProjectFormData {
  // Basic Information
  name: string
  description: string
  projectCode: string
  category: 'development' | 'humanitarian' | 'advocacy' | 'research' | ''
  priority: 'low' | 'medium' | 'high' | 'critical' | ''
  
  // Dates and Duration
  startDate: string
  endDate: string
  
  // Location
  country: string
  province: string
  region: string
  
  // Financial
  budget: string
  currency: string
  donor: string
  fundingSource: string
  
  // Scope and Targeting
  targetReach: string
  sectors: string[]
  objectives: string[]
  
  // Management
  manager: string
  organization: string
  reportingFrequency: 'weekly' | 'monthly' | 'quarterly' | ''
  
  // Risk Assessment
  riskLevel: 'low' | 'medium' | 'high' | ''
  keyRisks: string[]
  
  // Stakeholders
  stakeholders: Array<{
    name: string
    organization: string
    role: string
    contact: string
  }>
  
  // Implementation Approach
  methodology: 'agile' | 'waterfall' | 'hybrid' | ''
  phases: Array<{
    name: string
    duration: string
    objectives: string
  }>
}

export function NewProjectForm({ onCancel, onSuccess }: NewProjectProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    projectCode: '',
    category: '',
    priority: '',
    startDate: '',
    endDate: '',
    country: '',
    province: '',
    region: '',
    budget: '',
    currency: 'USD',
    donor: '',
    fundingSource: '',
    targetReach: '',
    sectors: [],
    objectives: [''],
    manager: session?.user?.name || '',
    organization: '',
    reportingFrequency: '',
    riskLevel: '',
    keyRisks: [''],
    stakeholders: [{ name: '', organization: '', role: '', contact: '' }],
    methodology: '',
    phases: [{ name: '', duration: '', objectives: '' }]
  })

  const steps = [
    { id: 1, name: 'Basic Information', icon: DocumentTextIcon },
    { id: 2, name: 'Scope & Targeting', icon: FlagIcon },
    { id: 3, name: 'Financial Details', icon: CurrencyDollarIcon },
    { id: 4, name: 'Management & Timeline', icon: CalendarIcon },
    { id: 5, name: 'Risk Assessment', icon: ExclamationTriangleIcon },
    { id: 6, name: 'Stakeholders', icon: UsersIcon },
    { id: 7, name: 'Review & Submit', icon: CheckCircleIcon }
  ]

  const availableSectors = [
    'Health', 'Education', 'WASH', 'Nutrition', 'Protection', 'Shelter',
    'Food Security', 'Livelihoods', 'Gender', 'Environment', 'Governance',
    'Emergency Response', 'Infrastructure', 'Capacity Building'
  ]

  const countries = [
    'Kenya', 'Tanzania', 'Uganda', 'Rwanda', 'Burundi', 'South Sudan',
    'Ethiopia', 'Somalia', 'DRC', 'Malawi', 'Zambia', 'Zimbabwe'
  ]

  useEffect(() => {
    // Auto-generate project code based on inputs
    if (formData.name && formData.category && formData.startDate) {
      const nameAbbrev = formData.name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 3)
      const categoryAbbrev = formData.category.slice(0, 3).toUpperCase()
      const year = new Date(formData.startDate).getFullYear()
      const code = `${categoryAbbrev}-${nameAbbrev}-${year}`
      setFormData(prev => ({ ...prev, projectCode: code }))
    }
  }, [formData.name, formData.category, formData.startDate])

  const updateFormData = (field: keyof ProjectFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const addArrayItem = (field: 'objectives' | 'keyRisks' | 'stakeholders' | 'phases') => {
    if (field === 'objectives' || field === 'keyRisks') {
      updateFormData(field, [...formData[field], ''])
    } else if (field === 'stakeholders') {
      updateFormData(field, [...formData[field], { name: '', organization: '', role: '', contact: '' }])
    } else if (field === 'phases') {
      updateFormData(field, [...formData[field], { name: '', duration: '', objectives: '' }])
    }
  }

  const removeArrayItem = (field: 'objectives' | 'keyRisks' | 'stakeholders' | 'phases', index: number) => {
    const newArray = formData[field].filter((_, i) => i !== index)
    updateFormData(field, newArray)
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = 'Project name is required'
        if (!formData.description.trim()) newErrors.description = 'Description is required'
        if (!formData.category) newErrors.category = 'Category is required'
        if (!formData.priority) newErrors.priority = 'Priority is required'
        break
      case 2:
        if (!formData.targetReach) newErrors.targetReach = 'Target reach is required'
        if (formData.sectors.length === 0) newErrors.sectors = 'At least one sector is required'
        break
      case 3:
        if (!formData.budget) newErrors.budget = 'Budget is required'
        if (!formData.donor.trim()) newErrors.donor = 'Donor is required'
        break
      case 4:
        if (!formData.startDate) newErrors.startDate = 'Start date is required'
        if (!formData.endDate) newErrors.endDate = 'End date is required'
        if (!formData.manager.trim()) newErrors.manager = 'Project manager is required'
        break
      case 5:
        if (!formData.riskLevel) newErrors.riskLevel = 'Risk level assessment is required'
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    setIsSubmitting(true)
    try {
      // Call the API to create the project
      const response = await fetch('/api/programs/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to create projects. Visit /auth/signin to authenticate.')
        }
        throw new Error(result.error || result.message || 'Failed to create project')
      }

      console.log('Project created successfully:', result.data || result.project)
      onSuccess()
    } catch (err: unknown) {
      console.error('Error creating project:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      
      // Show more helpful error messages
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized') || errorMessage.includes('log in')) {
        setErrors({ submit: `Authentication Required: ${errorMessage}` })
      } else {
        setErrors({ submit: `Failed to create project: ${errorMessage}. Please try again.` })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter project name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Code
              </label>
              <input
                type="text"
                value={formData.projectCode}
                onChange={(e) => updateFormData('projectCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                placeholder="Auto-generated based on inputs"
                readOnly
              />
              <p className="mt-1 text-xs text-gray-500">Auto-generated from project details</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                rows={4}
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe the project objectives, scope, and expected outcomes"
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => updateFormData('category', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select category</option>
                  <option value="development">Development</option>
                  <option value="humanitarian">Humanitarian</option>
                  <option value="advocacy">Advocacy</option>
                  <option value="research">Research</option>
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority *
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => updateFormData('priority', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.priority ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                {errors.priority && <p className="mt-1 text-sm text-red-600">{errors.priority}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => updateFormData('country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select country</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Province/State
                </label>
                <input
                  type="text"
                  value={formData.province}
                  onChange={(e) => updateFormData('province', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter province or state"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Region/District
                </label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => updateFormData('region', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter region or district"
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Reach (Number of Beneficiaries) *
              </label>
              <input
                type="number"
                value={formData.targetReach}
                onChange={(e) => updateFormData('targetReach', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.targetReach ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter expected number of beneficiaries"
              />
              {errors.targetReach && <p className="mt-1 text-sm text-red-600">{errors.targetReach}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Sectors *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableSectors.map(sector => (
                  <label key={sector} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.sectors.includes(sector)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateFormData('sectors', [...formData.sectors, sector])
                        } else {
                          updateFormData('sectors', formData.sectors.filter(s => s !== sector))
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-900">{sector}</span>
                  </label>
                ))}
              </div>
              {errors.sectors && <p className="mt-1 text-sm text-red-600">{errors.sectors}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Objectives
              </label>
              {formData.objectives.map((objective, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={objective}
                    onChange={(e) => {
                      const newObjectives = [...formData.objectives]
                      newObjectives[index] = e.target.value
                      updateFormData('objectives', newObjectives)
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`Objective ${index + 1}`}
                  />
                  {formData.objectives.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('objectives', index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('objectives')}
                className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Objective
              </button>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Budget *
                </label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => updateFormData('budget', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.budget ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter total project budget"
                />
                {errors.budget && <p className="mt-1 text-sm text-red-600">{errors.budget}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => updateFormData('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="KES">KES - Kenyan Shilling</option>
                  <option value="TZS">TZS - Tanzanian Shilling</option>
                  <option value="UGX">UGX - Ugandan Shilling</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Donor *
              </label>
              <input
                type="text"
                value={formData.donor}
                onChange={(e) => updateFormData('donor', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.donor ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., USAID, World Bank, UNICEF, Gates Foundation"
              />
              {errors.donor && <p className="mt-1 text-sm text-red-600">{errors.donor}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Funding Source Details
              </label>
              <textarea
                value={formData.fundingSource}
                onChange={(e) => updateFormData('fundingSource', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Additional details about funding arrangements, co-funding, matching requirements, etc."
              />
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => updateFormData('startDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => updateFormData('endDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.endDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Manager *
                </label>
                <input
                  type="text"
                  value={formData.manager}
                  onChange={(e) => updateFormData('manager', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.manager ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter project manager name"
                />
                {errors.manager && <p className="mt-1 text-sm text-red-600">{errors.manager}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Implementing Organization
                </label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => updateFormData('organization', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Primary implementing organization"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reporting Frequency
                </label>
                <select
                  value={formData.reportingFrequency}
                  onChange={(e) => updateFormData('reportingFrequency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select frequency</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Methodology
                </label>
                <select
                  value={formData.methodology}
                  onChange={(e) => updateFormData('methodology', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select methodology</option>
                  <option value="agile">Agile</option>
                  <option value="waterfall">Waterfall</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Risk Level *
              </label>
              <select
                value={formData.riskLevel}
                onChange={(e) => updateFormData('riskLevel', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.riskLevel ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select risk level</option>
                <option value="low">Low - Minimal risks identified</option>
                <option value="medium">Medium - Some risks require monitoring</option>
                <option value="high">High - Significant risks need active management</option>
              </select>
              {errors.riskLevel && <p className="mt-1 text-sm text-red-600">{errors.riskLevel}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Risks and Mitigation Measures
              </label>
              {formData.keyRisks.map((risk, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={risk}
                    onChange={(e) => {
                      const newRisks = [...formData.keyRisks]
                      newRisks[index] = e.target.value
                      updateFormData('keyRisks', newRisks)
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`Risk ${index + 1} and mitigation strategy`}
                  />
                  {formData.keyRisks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('keyRisks', index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('keyRisks')}
                className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Risk
              </button>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Key Stakeholders
              </label>
              {formData.stakeholders.map((stakeholder, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        value={stakeholder.name}
                        onChange={(e) => {
                          const newStakeholders = [...formData.stakeholders]
                          newStakeholders[index].name = e.target.value
                          updateFormData('stakeholders', newStakeholders)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Stakeholder name"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={stakeholder.organization}
                        onChange={(e) => {
                          const newStakeholders = [...formData.stakeholders]
                          newStakeholders[index].organization = e.target.value
                          updateFormData('stakeholders', newStakeholders)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Organization"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={stakeholder.role}
                        onChange={(e) => {
                          const newStakeholders = [...formData.stakeholders]
                          newStakeholders[index].role = e.target.value
                          updateFormData('stakeholders', newStakeholders)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Role/Position"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={stakeholder.contact}
                        onChange={(e) => {
                          const newStakeholders = [...formData.stakeholders]
                          newStakeholders[index].contact = e.target.value
                          updateFormData('stakeholders', newStakeholders)
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Contact information"
                      />
                      {formData.stakeholders.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('stakeholders', index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('stakeholders')}
                className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Stakeholder
              </button>
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Project Summary</h3>
              
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="font-medium text-gray-500">Project Name:</dt>
                  <dd className="text-gray-900">{formData.name}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Project Code:</dt>
                  <dd className="text-gray-900">{formData.projectCode}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Category:</dt>
                  <dd className="text-gray-900 capitalize">{formData.category}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Priority:</dt>
                  <dd className="text-gray-900 capitalize">{formData.priority}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Duration:</dt>
                  <dd className="text-gray-900">
                    {formData.startDate && formData.endDate 
                      ? `${new Date(formData.startDate).toLocaleDateString()} - ${new Date(formData.endDate).toLocaleDateString()}`
                      : 'Not specified'
                    }
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Budget:</dt>
                  <dd className="text-gray-900">
                    {formData.budget 
                      ? `${formData.currency} ${Number(formData.budget).toLocaleString()}`
                      : 'Not specified'
                    }
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Target Reach:</dt>
                  <dd className="text-gray-900">
                    {formData.targetReach 
                      ? `${Number(formData.targetReach).toLocaleString()} beneficiaries`
                      : 'Not specified'
                    }
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Location:</dt>
                  <dd className="text-gray-900">
                    {[formData.region, formData.province, formData.country].filter(Boolean).join(', ') || 'Not specified'}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Sectors:</dt>
                  <dd className="text-gray-900">{formData.sectors.join(', ') || 'None selected'}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Project Manager:</dt>
                  <dd className="text-gray-900">{formData.manager}</dd>
                </div>
              </dl>
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-600">
                Please review all information carefully. Once submitted, the project will be created and you can begin adding detailed planning information.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
            <p className="text-gray-600 mt-1">Set up a new project with comprehensive planning details</p>
          </div>
          <button
            onClick={onCancel}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Projects
          </button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep === step.id 
                  ? 'border-blue-500 bg-blue-500 text-white' 
                  : currentStep > step.id
                  ? 'border-green-500 bg-green-500 text-white'
                  : 'border-gray-300 bg-white text-gray-400'
              }`}>
                {currentStep > step.id ? (
                  <CheckCircleIcon className="h-6 w-6" />
                ) : (
                  <step.icon className="h-6 w-6" />
                )}
              </div>
              <div className="ml-3 hidden md:block">
                <p className={`text-sm font-medium ${
                  currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {step.name}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-20 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {steps.find(s => s.id === currentStep)?.name}
          </h2>
          
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
              currentStep === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Previous
          </button>

          <span className="text-sm text-gray-500">
            Step {currentStep} of {steps.length}
          </span>

          {currentStep < steps.length ? (
            <button
              onClick={nextStep}
              className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
            >
              Next
              <ChevronRightIcon className="h-4 w-4 ml-2" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex items-center px-6 py-2 text-sm font-medium rounded-md ${
                isSubmitting
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
    </div>
  )
}
