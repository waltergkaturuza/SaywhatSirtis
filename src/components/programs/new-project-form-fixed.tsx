"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  DocumentTextIcon,
  PlusIcon,
  XMarkIcon,
  DocumentArrowUpIcon,
  BanknotesIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline"

interface NewProjectFormProps {
  onCancel: () => void
  onSuccess: () => void
}

const categories = [
  "Child protection",
  "Climate Action", 
  "Disaster and Emergency Preparedness",
  "Drug and Substance Abuse",
  "Education",
  "Empowerment and Livelihoods",
  "Maternal Health",
  "Mental Health",
  "Non-Communicable diseases",
  "SRHR"
]

const evaluationFrequencies = ["Midterm", "Endterm", "Annual", "Other"]
const methodologies = ["Narrative", "Financial", "Log frame", "Visibility", "Other"]

export function NewProjectForm({ onCancel, onSuccess }: NewProjectFormProps) {
  const { data: session } = useSession()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Project Information State
  const [projectCode, setProjectCode] = useState("")
  const [projectTitle, setProjectTitle] = useState("")
  const [description, setDescription] = useState("")
  const [projectLead, setProjectLead] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [implementingOrganizations, setImplementingOrganizations] = useState<string[]>([""])
  const [selectedFrequencies, setSelectedFrequencies] = useState<string[]>([])
  const [frequencyDates, setFrequencyDates] = useState<Record<string, string>>({})
  const [selectedMethodologies, setSelectedMethodologies] = useState<string[]>([])
  
  // Financial Details State
  const [totalBudget, setTotalBudget] = useState("")
  const [fundingSource, setFundingSource] = useState("")

  const steps = [
    { number: 1, title: "Project Information", icon: DocumentTextIcon },
    { number: 2, title: "Financial Details", icon: BanknotesIcon },
    { number: 3, title: "Results Framework", icon: ChartBarIcon }
  ]

  const isCurrentUser = (role: string) => {
    return session?.user?.roles?.includes(role) || session?.user?.department === 'MEAL'
  }

  const canEdit = isCurrentUser('MEAL_PERSONNEL') || session?.user?.roles?.includes('admin')

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const handleFrequencyToggle = (frequency: string) => {
    setSelectedFrequencies(prev => {
      if (prev.includes(frequency)) {
        const newFreq = prev.filter(f => f !== frequency)
        const newDates = { ...frequencyDates }
        delete newDates[frequency]
        setFrequencyDates(newDates)
        return newFreq
      } else {
        return [...prev, frequency]
      }
    })
  }

  const handleMethodologyToggle = (methodology: string) => {
    setSelectedMethodologies(prev => 
      prev.includes(methodology) 
        ? prev.filter(m => m !== methodology)
        : [...prev, methodology]
    )
  }

  const handleSubmit = async () => {
    if (!canEdit) return
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      const projectData = {
        name: projectTitle,
        description,
        projectCode,
        startDate,
        endDate,
        country: "Zimbabwe", // Default for SAYWHAT
        province: "", // Can be expanded later
        budget: totalBudget ? parseFloat(totalBudget) : 0,
        fundingSource,
        categories: selectedCategories,
        projectLead,
        implementingOrganizations: implementingOrganizations.filter(org => org.trim() !== ''),
        evaluationFrequency: selectedFrequencies,
        frequencyDates,
        methodologies: selectedMethodologies
      }

      const response = await fetch('/api/programs/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      })

      const result = await response.json()

      if (result.success) {
        onSuccess()
      } else {
        throw new Error(result.error || 'Failed to create project')
      }
    } catch (error) {
      console.error('Project creation error:', error)
      setError(error instanceof Error ? error.message : 'Failed to create project. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderProjectInformation = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="projectCode">Project Code *</Label>
          <Input
            id="projectCode"
            value={projectCode}
            onChange={(e) => setProjectCode(e.target.value)}
            placeholder="Enter project code"
            disabled={!canEdit}
            className="focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <div>
          <Label htmlFor="projectTitle">Project Title *</Label>
          <Input
            id="projectTitle"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            placeholder="Enter project title"
            disabled={!canEdit}
            className="focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter project description"
          rows={4}
          disabled={!canEdit}
          className="focus:ring-green-500 focus:border-green-500"
        />
        <div className="mt-2">
          <Label>Supporting Documents</Label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-green-400 transition-colors">
            <div className="space-y-1 text-center">
              <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label htmlFor="description-files" className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-700">
                  <span>Upload detailed project summary</span>
                  <input
                    id="description-files"
                    name="description-files"
                    type="file"
                    multiple
                    className="sr-only"
                    disabled={!canEdit}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="projectLead">Project Lead *</Label>
        <Input
          id="projectLead"
          value={projectLead}
          onChange={(e) => setProjectLead(e.target.value)}
          placeholder="Enter project lead name"
          disabled={!canEdit}
          className="focus:ring-green-500 focus:border-green-500"
        />
      </div>

      <div>
        <Label>Categories *</Label>
        <div className="mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => handleCategoryToggle(category)}
              disabled={!canEdit}
              className={`p-2 text-sm rounded-lg border transition-colors ${
                selectedCategories.includes(category)
                  ? 'bg-orange-600 text-white border-orange-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-green-50 hover:border-green-400'
              } ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="startDate">Start Date *</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={!canEdit}
            className="focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <div>
          <Label htmlFor="endDate">End Date *</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={!canEdit}
            className="focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      <div>
        <Label>Implementing Organizations (up to 10)</Label>
        {implementingOrganizations.map((org, index) => (
          <div key={index} className="flex mt-2 space-x-2">
            <Input
              value={org}
              onChange={(e) => {
                const newOrgs = [...implementingOrganizations]
                newOrgs[index] = e.target.value
                setImplementingOrganizations(newOrgs)
              }}
              placeholder={`Organization ${index + 1}`}
              disabled={!canEdit}
              className="focus:ring-green-500 focus:border-green-500"
            />
            {implementingOrganizations.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setImplementingOrganizations(prev => prev.filter((_, i) => i !== index))
                }}
                disabled={!canEdit}
                className="hover:bg-red-50 hover:border-red-400"
              >
                <XMarkIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        {implementingOrganizations.length < 10 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setImplementingOrganizations(prev => [...prev, ""])}
            className="mt-2 hover:bg-green-50 hover:border-green-400"
            disabled={!canEdit}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Organization
          </Button>
        )}
      </div>

      <div>
        <Label>Evaluation Frequency</Label>
        <div className="mt-2 space-y-4">
          {evaluationFrequencies.map((frequency) => (
            <div key={frequency} className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedFrequencies.includes(frequency)}
                  onChange={() => handleFrequencyToggle(frequency)}
                  disabled={!canEdit}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span>{frequency}</span>
              </label>
              {selectedFrequencies.includes(frequency) && (
                <Input
                  type="date"
                  value={frequencyDates[frequency] || ''}
                  onChange={(e) => setFrequencyDates(prev => ({
                    ...prev,
                    [frequency]: e.target.value
                  }))}
                  placeholder={`${frequency} date`}
                  disabled={!canEdit}
                  className="ml-6 focus:ring-green-500 focus:border-green-500"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>Methodologies</Label>
        <div className="mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {methodologies.map((methodology) => (
            <button
              key={methodology}
              type="button"
              onClick={() => handleMethodologyToggle(methodology)}
              disabled={!canEdit}
              className={`p-2 text-sm rounded-lg border transition-colors ${
                selectedMethodologies.includes(methodology)
                  ? 'bg-orange-600 text-white border-orange-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-green-50 hover:border-green-400'
              } ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {methodology}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  const renderFinancialDetails = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="totalBudget">Total Budget *</Label>
          <Input
            id="totalBudget"
            type="number"
            value={totalBudget}
            onChange={(e) => setTotalBudget(e.target.value)}
            placeholder="Enter total budget"
            disabled={!canEdit}
            className="focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <div>
          <Label htmlFor="fundingSource">Funding Source *</Label>
          <Input
            id="fundingSource"
            value={fundingSource}
            onChange={(e) => setFundingSource(e.target.value)}
            placeholder="Enter funding source"
            disabled={!canEdit}
            className="focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      <div>
        <Label>Funding Source Details & Budget Breakdown</Label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-green-400 transition-colors">
          <div className="space-y-1 text-center">
            <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label htmlFor="funding-files" className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-700">
                <span>Upload budget breakdown documents</span>
                <input
                  id="funding-files"
                  name="funding-files"
                  type="file"
                  multiple
                  className="sr-only"
                  disabled={!canEdit}
                />
              </label>
            </div>
            <p className="text-xs text-gray-500">PDF, XLSX, DOC up to 10MB</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Grants e-requisite Integration</h4>
        <p className="text-sm text-blue-700">
          This project will be connected to the Grants e-requisite platform for real-time budget tracking and performance monitoring.
        </p>
      </div>
    </div>
  )

  const renderResultsFramework = () => (
    <div className="space-y-6">
      <div className="text-center text-gray-500 p-8 border-2 border-dashed border-gray-300 rounded-lg">
        <ChartBarIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Results Framework</h3>
        <p className="text-gray-600">
          The comprehensive Results Framework with nested Objectives, Outcomes, and Outputs will be implemented here.
          This will include up to 10 objectives per project, with detailed monitoring indicators and data collection methods.
        </p>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black">Create New Project</h1>
        <p className="text-gray-600 mt-2">Set up a new program with comprehensive project information, financial details, and results framework.</p>
      </div>

      {!canEdit && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            <strong>Read-only mode:</strong> Only authorized MEAL Personnel can edit project information. You have view-only access.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Step Navigation */}
      <div className="mb-8">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {steps.map((step, stepIdx) => (
              <li key={step.number} className={`${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} relative`}>
                <div className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                      currentStep >= step.number
                        ? 'bg-orange-600 border-orange-600 text-white'
                        : 'border-gray-300 text-gray-500 hover:border-green-400'
                    }`}
                  >
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className={`ml-3 text-sm font-medium transition-colors ${
                    currentStep >= step.number ? 'text-orange-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {stepIdx !== steps.length - 1 && (
                  <div className="absolute top-5 left-5 w-full h-0.5 bg-gray-300" />
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Step Content */}
      <Card className="shadow-lg border-gray-200">
        <CardHeader>
          <CardTitle className="text-black">{steps[currentStep - 1].title}</CardTitle>
          <CardDescription>
            {currentStep === 1 && "Enter basic project information and management details"}
            {currentStep === 2 && "Specify budget and funding source information"}
            {currentStep === 3 && "Define objectives, outcomes, and outputs with monitoring framework"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && renderProjectInformation()}
          {currentStep === 2 && renderFinancialDetails()}
          {currentStep === 3 && renderResultsFramework()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between">
        <div>
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="hover:bg-gray-50"
            >
              Previous
            </Button>
          )}
        </div>
        <div className="flex space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="hover:bg-gray-50"
          >
            Cancel
          </Button>
          {currentStep < 3 ? (
            <Button
              type="button"
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Next
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !canEdit}
              className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
            >
              {isSubmitting ? 'Creating Project...' : 'Create Project'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
