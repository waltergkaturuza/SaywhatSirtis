"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ModulePage } from '@/components/layout/enhanced-layout'
import { ArrowLeftIcon, CheckIcon, PlusIcon, TrashIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

interface Project {
  id: string
  name: string
  projectGoal?: string
  description: string
  projectLead: string
  status: string
  priority: string
  health: string
  startDate: string
  endDate: string
  budget: number
  progress: number
  location: string
  donor: string
  targetBeneficiaries: number
  actualBeneficiaries: number
  objectives: string
  activities: string
  expectedOutcomes: string
  kpis: string
  sustainabilityPlan: string
  outcomes?: any
  indicators?: any
  outputs?: any
}

export default function EditProjectPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // New fields for outcomes, indicators, and outputs
  const [outcomes, setOutcomes] = useState<Array<{id: string, description: string, target: string, unit: string}>>([])
  const [indicators, setIndicators] = useState<Array<{id: string, name: string, description: string, target: string, unit: string, frequency: string}>>([])
  const [outputs, setOutputs] = useState<Array<{id: string, description: string, target: string, unit: string}>>([])

  useEffect(() => {
    fetchProject()
  }, [projectId])

  const fetchProject = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/programs/projects/${projectId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch project')
      }

      const result = await response.json()
      if (result.success && result.data) {
        setProject({
          ...result.data,
          startDate: result.data.startDate.split('T')[0],
          endDate: result.data.endDate.split('T')[0]
        })
        
        // Load the new fields
        if (result.data.outcomes) {
          try {
            const parsedOutcomes = typeof result.data.outcomes === 'string' 
              ? JSON.parse(result.data.outcomes) 
              : result.data.outcomes
            setOutcomes(Array.isArray(parsedOutcomes) ? parsedOutcomes : [])
          } catch {
            setOutcomes([])
          }
        }
        
        if (result.data.indicators) {
          try {
            const parsedIndicators = typeof result.data.indicators === 'string' 
              ? JSON.parse(result.data.indicators) 
              : result.data.indicators
            setIndicators(Array.isArray(parsedIndicators) ? parsedIndicators : [])
          } catch {
            setIndicators([])
          }
        }
        
        if (result.data.outputs) {
          try {
            const parsedOutputs = typeof result.data.outputs === 'string' 
              ? JSON.parse(result.data.outputs) 
              : result.data.outputs
            setOutputs(Array.isArray(parsedOutputs) ? parsedOutputs : [])
          } catch {
            setOutputs([])
          }
        }
      }
    } catch (err) {
      console.error('Error fetching project:', err)
      setError('Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!project) return

    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`/api/programs/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...project,
          outcomes: outcomes,
          indicators: indicators,
          outputs: outputs
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update project')
      }

      const result = await response.json()
      if (result.success) {
        router.push('/programs?success=project-updated')
      } else {
        throw new Error(result.error || 'Failed to update project')
      }
    } catch (err) {
      console.error('Error updating project:', err)
      setError(err instanceof Error ? err.message : 'Failed to update project')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof Project, value: string | number) => {
    if (project) {
      setProject({ ...project, [field]: value })
    }
  }

  // Helper functions for managing iterative fields
  const addOutcome = () => {
    const newOutcome = {
      id: Date.now().toString(),
      description: '',
      target: '',
      unit: ''
    }
    setOutcomes([...outcomes, newOutcome])
  }

  const removeOutcome = (id: string) => {
    setOutcomes(outcomes.filter(outcome => outcome.id !== id))
  }

  const updateOutcome = (id: string, field: string, value: string) => {
    setOutcomes(outcomes.map(outcome => 
      outcome.id === id ? { ...outcome, [field]: value } : outcome
    ))
  }

  const addIndicator = () => {
    const newIndicator = {
      id: Date.now().toString(),
      name: '',
      description: '',
      target: '',
      unit: '',
      frequency: 'monthly'
    }
    setIndicators([...indicators, newIndicator])
  }

  const removeIndicator = (id: string) => {
    setIndicators(indicators.filter(indicator => indicator.id !== id))
  }

  const updateIndicator = (id: string, field: string, value: string) => {
    setIndicators(indicators.map(indicator => 
      indicator.id === id ? { ...indicator, [field]: value } : indicator
    ))
  }

  const addOutput = () => {
    const newOutput = {
      id: Date.now().toString(),
      description: '',
      target: '',
      unit: ''
    }
    setOutputs([...outputs, newOutput])
  }

  const removeOutput = (id: string) => {
    setOutputs(outputs.filter(output => output.id !== id))
  }

  const updateOutput = (id: string, field: string, value: string) => {
    setOutputs(outputs.map(output => 
      output.id === id ? { ...output, [field]: value } : output
    ))
  }

  if (loading) {
    return (
      <ModulePage
        metadata={{
          title: "Edit Project",
          description: "Loading project details...",
          breadcrumbs: [
            { name: "Programs", href: "/programs" },
            { name: "Edit Project" }
          ]
        }}
        actions={<></>}
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ModulePage>
    )
  }

  if (error || !project) {
    return (
      <ModulePage
        metadata={{
          title: "Edit Project",
          description: "Error loading project",
          breadcrumbs: [
            { name: "Programs", href: "/programs" },
            { name: "Edit Project" }
          ]
        }}
        actions={<></>}
      >
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            {error || 'Project not found'}
          </div>
          <Link
            href="/programs"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Programs
          </Link>
        </div>
      </ModulePage>
    )
  }

  const metadata = {
    title: `Edit Project: ${project.name}`,
    description: "Edit project details and settings",
    breadcrumbs: [
      { name: "Programs", href: "/programs" },
      { name: project.name, href: `/programs/projects/${projectId}` },
      { name: "Edit" }
    ]
  }

  const actions = (
    <>
      <Link
        href="/programs"
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Cancel
      </Link>
      <Button
        onClick={handleSave}
        disabled={saving}
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
      >
        <CheckIcon className="h-4 w-4 mr-2" />
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </>
  )

  return (
    <ModulePage
      metadata={metadata}
      actions={actions}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-800">{error}</div>
          </div>
        )}

        {/* Basic Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                value={project.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="projectLead">Project Lead</Label>
              <Input
                id="projectLead"
                value={project.projectLead}
                onChange={(e) => handleInputChange('projectLead', e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={project.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLANNING">Planning</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="ON_HOLD">On Hold</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={project.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={project.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={project.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="budget">Budget ($)</Label>
              <Input
                id="budget"
                type="number"
                value={project.budget}
                onChange={(e) => handleInputChange('budget', parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="progress">Progress (%)</Label>
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                value={project.progress}
                onChange={(e) => handleInputChange('progress', parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={project.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="donor">Donor</Label>
              <Input
                id="donor"
                value={project.donor}
                onChange={(e) => handleInputChange('donor', e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="targetBeneficiaries">Target Beneficiaries</Label>
              <Input
                id="targetBeneficiaries"
                type="number"
                value={project.targetBeneficiaries}
                onChange={(e) => handleInputChange('targetBeneficiaries', parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="actualBeneficiaries">Actual Beneficiaries</Label>
              <Input
                id="actualBeneficiaries"
                type="number"
                value={project.actualBeneficiaries}
                onChange={(e) => handleInputChange('actualBeneficiaries', parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="mt-6">
            <Label htmlFor="projectGoal">Project Goal</Label>
            <Textarea
              id="projectGoal"
              value={project.projectGoal || ''}
              onChange={(e) => handleInputChange('projectGoal', e.target.value)}
              rows={3}
              className="mt-1"
              placeholder="Enter project goal"
            />
          </div>

          <div className="mt-6">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={project.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="mt-1"
            />
          </div>
        </div>

        {/* Project Details */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Project Details</h3>
          <div className="space-y-6">
            <div>
              <Label htmlFor="objectives">Objectives</Label>
              <Textarea
                id="objectives"
                value={project.objectives}
                onChange={(e) => handleInputChange('objectives', e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="activities">Activities</Label>
              <Textarea
                id="activities"
                value={project.activities}
                onChange={(e) => handleInputChange('activities', e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="expectedOutcomes">Expected Outcomes</Label>
              <Textarea
                id="expectedOutcomes"
                value={project.expectedOutcomes}
                onChange={(e) => handleInputChange('expectedOutcomes', e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="kpis">Key Performance Indicators (KPIs)</Label>
              <Textarea
                id="kpis"
                value={project.kpis}
                onChange={(e) => handleInputChange('kpis', e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="sustainabilityPlan">Sustainability Plan</Label>
              <Textarea
                id="sustainabilityPlan"
                value={project.sustainabilityPlan}
                onChange={(e) => handleInputChange('sustainabilityPlan', e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Project Outcomes */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Project Outcomes</h3>
            <Button
              type="button"
              onClick={addOutcome}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Outcome
            </Button>
          </div>
          
          {outcomes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ChartBarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No outcomes defined yet. Click "Add Outcome" to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {outcomes.map((outcome, index) => (
                <div key={outcome.id} className="border rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Outcome {index + 1}</h4>
                    <Button
                      type="button"
                      onClick={() => removeOutcome(outcome.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`outcome-description-${outcome.id}`}>Description</Label>
                      <Textarea
                        id={`outcome-description-${outcome.id}`}
                        value={outcome.description}
                        onChange={(e) => updateOutcome(outcome.id, 'description', e.target.value)}
                        placeholder="Describe the expected outcome"
                        rows={3}
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`outcome-target-${outcome.id}`}>Target</Label>
                        <Input
                          id={`outcome-target-${outcome.id}`}
                          value={outcome.target}
                          onChange={(e) => updateOutcome(outcome.id, 'target', e.target.value)}
                          placeholder="Target value"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`outcome-unit-${outcome.id}`}>Unit</Label>
                        <Input
                          id={`outcome-unit-${outcome.id}`}
                          value={outcome.unit}
                          onChange={(e) => updateOutcome(outcome.id, 'unit', e.target.value)}
                          placeholder="Unit of measurement"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Project Indicators */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Project Indicators</h3>
            <Button
              type="button"
              onClick={addIndicator}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Indicator
            </Button>
          </div>
          
          {indicators.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ChartBarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No indicators defined yet. Click "Add Indicator" to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {indicators.map((indicator, index) => (
                <div key={indicator.id} className="border rounded-lg p-4 bg-green-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Indicator {index + 1}</h4>
                    <Button
                      type="button"
                      onClick={() => removeIndicator(indicator.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`indicator-name-${indicator.id}`}>Indicator Name</Label>
                      <Input
                        id={`indicator-name-${indicator.id}`}
                        value={indicator.name}
                        onChange={(e) => updateIndicator(indicator.id, 'name', e.target.value)}
                        placeholder="Enter indicator name"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`indicator-frequency-${indicator.id}`}>Frequency</Label>
                      <select
                        id={`indicator-frequency-${indicator.id}`}
                        value={indicator.frequency}
                        onChange={(e) => updateIndicator(indicator.id, 'frequency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-1"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="annually">Annually</option>
                      </select>
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label htmlFor={`indicator-description-${indicator.id}`}>Description</Label>
                      <Textarea
                        id={`indicator-description-${indicator.id}`}
                        value={indicator.description}
                        onChange={(e) => updateIndicator(indicator.id, 'description', e.target.value)}
                        placeholder="Describe what this indicator measures"
                        rows={2}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`indicator-target-${indicator.id}`}>Target</Label>
                      <Input
                        id={`indicator-target-${indicator.id}`}
                        value={indicator.target}
                        onChange={(e) => updateIndicator(indicator.id, 'target', e.target.value)}
                        placeholder="Target value"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`indicator-unit-${indicator.id}`}>Unit</Label>
                      <Input
                        id={`indicator-unit-${indicator.id}`}
                        value={indicator.unit}
                        onChange={(e) => updateIndicator(indicator.id, 'unit', e.target.value)}
                        placeholder="Unit of measurement"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Project Outputs */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Project Outputs</h3>
            <Button
              type="button"
              onClick={addOutput}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Output
            </Button>
          </div>
          
          {outputs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ChartBarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No outputs defined yet. Click "Add Output" to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {outputs.map((output, index) => (
                <div key={output.id} className="border rounded-lg p-4 bg-purple-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Output {index + 1}</h4>
                    <Button
                      type="button"
                      onClick={() => removeOutput(output.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`output-description-${output.id}`}>Description</Label>
                      <Textarea
                        id={`output-description-${output.id}`}
                        value={output.description}
                        onChange={(e) => updateOutput(output.id, 'description', e.target.value)}
                        placeholder="Describe the expected output"
                        rows={3}
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`output-target-${output.id}`}>Target</Label>
                        <Input
                          id={`output-target-${output.id}`}
                          value={output.target}
                          onChange={(e) => updateOutput(output.id, 'target', e.target.value)}
                          placeholder="Target value"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`output-unit-${output.id}`}>Unit</Label>
                        <Input
                          id={`output-unit-${output.id}`}
                          value={output.unit}
                          onChange={(e) => updateOutput(output.id, 'unit', e.target.value)}
                          placeholder="Unit of measurement"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ModulePage>
  )
}