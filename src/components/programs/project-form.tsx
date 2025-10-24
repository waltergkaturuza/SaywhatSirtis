'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Loader2, 
  FolderOpen, 
  Save, 
  X, 
  Calendar as CalendarIcon,
  Users,
  Target,
  DollarSign,
  MapPin,
  Clock,
  AlertTriangle
} from 'lucide-react'
import { ResultsFramework, ResultsFrameworkData } from './results-framework'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface Project {
  id?: string
  name: string
  projectGoal?: string
  description: string
  objectives: string
  category: string
  status: string
  priority: string
  
  // Timeline
  startDate: Date
  endDate: Date
  
  // Budget
  budget: number
  currency: string
  spent: number
  
  // Location
  location: string
  coordinates?: string
  
  // Team
  projectManager: string
  teamMembers: string[]
  stakeholders: string[]
  
  // Targets
  targetBeneficiaries: number
  directBeneficiaries: number
  indirectBeneficiaries: number
  
  // Settings
  isActive: boolean
  isPublic: boolean
  allowVolunteers: boolean
  
  // Monitoring
  indicators: ProjectIndicator[]
  risks: ProjectRisk[]
  
  // Results Framework
  resultsFramework?: ResultsFrameworkData
}

interface ProjectIndicator {
  id?: string
  name: string
  description: string
  target: number
  unit: string
  baseline: number
  current: number
}

interface ProjectRisk {
  id?: string
  description: string
  likelihood: string
  impact: string
  mitigation: string
  status: string
}

interface ProjectFormProps {
  project?: Project
  onSubmit: (project: Project) => Promise<void>
  onCancel: () => void
  isEditing?: boolean
}

const categories = [
  'Health',
  'Education',
  'Water & Sanitation',
  'Food Security',
  'Economic Development',
  'Infrastructure',
  'Environment',
  'Emergency Response',
  'Capacity Building',
  'Advocacy',
  'Research'
]

const statuses = [
  'Planning',
  'Active',
  'On Hold',
  'Completed',
  'Cancelled',
  'Under Review'
]

const priorities = [
  'Low',
  'Medium',
  'High',
  'Critical'
]

const riskLevels = [
  'Very Low',
  'Low',
  'Medium',
  'High',
  'Very High'
]

const riskStatuses = [
  'Open',
  'Monitoring',
  'Mitigated',
  'Closed'
]

const currencies = [
  'USD', 'ZWL', 'ZAR', 'GBP', 'EUR'
]

export function ProjectForm({ project, onSubmit, onCancel, isEditing = false }: ProjectFormProps) {
  // Helper function to ensure resultsFramework data structure is properly initialized
  const initializeResultsFramework = (rf?: any): ResultsFrameworkData => {
    // If no resultsFramework exists, create a default structure
    if (!rf || typeof rf !== 'object') {
      return { 
        objectives: [], 
        projectDuration: 1 
      }
    }
    
    // Ensure projectDuration exists
    const projectDuration = typeof rf.projectDuration === 'number' ? rf.projectDuration : 1
    
    // Ensure objectives array exists and is properly structured
    const objectives = Array.isArray(rf.objectives) ? rf.objectives.map((obj: any) => ({
      id: obj.id || `objective_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: obj.title || '',
      description: obj.description || '',
      isExpanded: obj.isExpanded || false,
      outcomes: Array.isArray(obj.outcomes) ? obj.outcomes.map((outcome: any) => ({
        id: outcome.id || `outcome_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: outcome.title || '',
        description: outcome.description || '',
        isExpanded: outcome.isExpanded || false,
        indicators: Array.isArray(outcome.indicators) ? outcome.indicators : [],
        outputs: Array.isArray(outcome.outputs) ? outcome.outputs.map((output: any) => ({
          id: output.id || `output_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: output.title || '',
          description: output.description || '',
          isExpanded: output.isExpanded || false,
          indicators: Array.isArray(output.indicators) ? output.indicators : []
        })) : []
      })) : []
    })) : []
    
    return {
      objectives,
      projectDuration
    }
  }

  const [formData, setFormData] = useState<Project>({
    name: '',
    projectGoal: '',
    description: '',
    objectives: '',
    category: '',
    status: 'Planning',
    priority: 'Medium',
    startDate: new Date(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    budget: 0,
    currency: 'USD',
    spent: 0,
    location: '',
    projectManager: '',
    teamMembers: [],
    stakeholders: [],
    targetBeneficiaries: 0,
    directBeneficiaries: 0,
    indirectBeneficiaries: 0,
    isActive: true,
    isPublic: false,
    allowVolunteers: false,
    indicators: [],
    risks: [],
    ...project,
    resultsFramework: initializeResultsFramework(project?.resultsFramework)
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [newIndicator, setNewIndicator] = useState<ProjectIndicator>({
    name: '',
    description: '',
    target: 0,
    unit: '',
    baseline: 0,
    current: 0
  })
  const [newRisk, setNewRisk] = useState<ProjectRisk>({
    description: '',
    likelihood: 'Medium',
    impact: 'Medium',
    mitigation: '',
    status: 'Open'
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }))
    if (error) setError('')
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError('')
  }

  const handleDateChange = (name: string, date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        [name]: date
      }))
    }
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }))
  }

  const handleTeamMemberAdd = (member: string) => {
    if (member.trim() && !formData.teamMembers.includes(member.trim())) {
      setFormData(prev => ({
        ...prev,
        teamMembers: [...prev.teamMembers, member.trim()]
      }))
    }
  }

  const handleTeamMemberRemove = (member: string) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter(m => m !== member)
    }))
  }

  const handleStakeholderAdd = (stakeholder: string) => {
    if (stakeholder.trim() && !formData.stakeholders.includes(stakeholder.trim())) {
      setFormData(prev => ({
        ...prev,
        stakeholders: [...prev.stakeholders, stakeholder.trim()]
      }))
    }
  }

  const handleStakeholderRemove = (stakeholder: string) => {
    setFormData(prev => ({
      ...prev,
      stakeholders: prev.stakeholders.filter(s => s !== stakeholder)
    }))
  }

  const handleIndicatorAdd = () => {
    if (newIndicator.name.trim() && newIndicator.unit.trim()) {
      setFormData(prev => ({
        ...prev,
        indicators: [...prev.indicators, { ...newIndicator, id: Date.now().toString() }]
      }))
      setNewIndicator({
        name: '',
        description: '',
        target: 0,
        unit: '',
        baseline: 0,
        current: 0
      })
    }
  }

  const handleIndicatorRemove = (id: string) => {
    setFormData(prev => ({
      ...prev,
      indicators: prev.indicators.filter(i => i.id !== id)
    }))
  }

  const handleRiskAdd = () => {
    if (newRisk.description.trim()) {
      setFormData(prev => ({
        ...prev,
        risks: [...prev.risks, { ...newRisk, id: Date.now().toString() }]
      }))
      setNewRisk({
        description: '',
        likelihood: 'Medium',
        impact: 'Medium',
        mitigation: '',
        status: 'Open'
      })
    }
  }

  const handleRiskRemove = (id: string) => {
    setFormData(prev => ({
      ...prev,
      risks: prev.risks.filter(r => r.id !== id)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Validation
      if (!formData.name.trim() || !formData.description.trim()) {
        setError('Project name and description are required')
        return
      }

      if (!formData.category || !formData.projectManager) {
        setError('Category and project manager are required')
        return
      }

      if (formData.endDate <= formData.startDate) {
        setError('End date must be after start date')
        return
      }

      if (formData.budget <= 0) {
        setError('Budget must be greater than 0')
        return
      }

      await onSubmit(formData)
    } catch (error) {
      console.error('Error submitting project form:', error)
      setError('An error occurred while saving the project')
    } finally {
      setIsLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'destructive'
      case 'High': return 'default'
      case 'Medium': return 'secondary'
      case 'Low': return 'outline'
      default: return 'secondary'
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Very High': return 'destructive'
      case 'High': return 'destructive'
      case 'Medium': return 'default'
      case 'Low': return 'secondary'
      case 'Very Low': return 'outline'
      default: return 'secondary'
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="w-full max-w-full mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <FolderOpen className="h-5 w-5" />
          <CardTitle>
            {isEditing ? 'Edit Project' : 'Create New Project'}
          </CardTitle>
        </div>
        <CardDescription>
          {isEditing 
            ? 'Update project information, timeline, and monitoring details'
            : 'Create a new project with objectives, timeline, budget, and monitoring framework'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="location">Location & Lead</TabsTrigger>
              <TabsTrigger value="budget">Budget & Objectives</TabsTrigger>
              <TabsTrigger value="team">Team & Stakeholders</TabsTrigger>
              <TabsTrigger value="targets">Targets & Impact</TabsTrigger>
              <TabsTrigger value="risks">Risks</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              {/* Project Goal - Highlighted and Prominent */}
              <div className="space-y-2 bg-gradient-to-r from-orange-50 to-orange-100 p-5 rounded-xl border-2 border-orange-400 shadow-md">
                <Label htmlFor="projectGoal" className="text-orange-700 font-bold text-base flex items-center">
                  <span className="w-3 h-3 bg-orange-500 rounded-full mr-2 animate-pulse"></span>
                  🎯 PROJECT GOAL *
                </Label>
                <Textarea
                  id="projectGoal"
                  name="projectGoal"
                  value={formData.projectGoal || ''}
                  onChange={handleInputChange}
                  placeholder="Enter the main goal or objective of this project (e.g., Improve water access for 50,000 people in rural communities)"
                  disabled={isLoading}
                  rows={3}
                  className="border-2 border-orange-400 focus:border-orange-600 focus:ring-2 focus:ring-orange-500 bg-white font-medium text-gray-900"
                  required
                />
                <p className="text-xs text-orange-700 font-semibold bg-white bg-opacity-50 p-2 rounded">
                  💡 This field is REQUIRED for tracking project objectives and outcomes in the Results Framework
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter project name"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleSelectChange('category', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange('status', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => handleSelectChange('priority', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          <Badge variant={getPriorityColor(priority) as any} className="mr-2">
                            {priority}
                          </Badge>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Provide a detailed description of the project"
                  required
                  disabled={isLoading}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="objectives">Objectives</Label>
                <Textarea
                  id="objectives"
                  name="objectives"
                  value={formData.objectives}
                  onChange={handleInputChange}
                  placeholder="List the main objectives and expected outcomes"
                  disabled={isLoading}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Project location or area of operation"
                    className="pl-9"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked: boolean) => handleSwitchChange('isActive', checked)}
                    disabled={isLoading}
                  />
                  <Label htmlFor="isActive">Active Project</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPublic"
                    checked={formData.isPublic}
                    onCheckedChange={(checked: boolean) => handleSwitchChange('isPublic', checked)}
                    disabled={isLoading}
                  />
                  <Label htmlFor="isPublic">Public Visibility</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="allowVolunteers"
                    checked={formData.allowVolunteers}
                    onCheckedChange={(checked: boolean) => handleSwitchChange('allowVolunteers', checked)}
                    disabled={isLoading}
                  />
                  <Label htmlFor="allowVolunteers">Accept Volunteers</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        disabled={isLoading}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(formData.startDate, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.startDate}
                        onSelect={(date) => handleDateChange('startDate', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        disabled={isLoading}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(formData.endDate, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.endDate}
                        onSelect={(date) => handleDateChange('endDate', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Total Budget *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="budget"
                      name="budget"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.budget}
                      onChange={handleInputChange}
                      className="pl-9"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => handleSelectChange('currency', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="spent">Amount Spent</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="spent"
                      name="spent"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.spent}
                      onChange={handleInputChange}
                      className="pl-9"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Project Duration</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Duration: {Math.ceil((formData.endDate.getTime() - formData.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                </p>
                <p className="text-sm text-muted-foreground">
                  Budget utilization: {formData.budget > 0 ? ((formData.spent / formData.budget) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </TabsContent>

            <TabsContent value="location" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Enter project location"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coordinates">Coordinates (Optional)</Label>
                  <Input
                    id="coordinates"
                    name="coordinates"
                    value={formData.coordinates || ''}
                    onChange={(e) => setFormData({ ...formData, coordinates: e.target.value })}
                    placeholder="Latitude, Longitude"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="budget" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Total Budget *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="budget"
                      name="budget"
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spent">Actual Spent</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="spent"
                      name="spent"
                      type="number"
                      value={formData.spent}
                      onChange={(e) => setFormData({ ...formData, spent: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Results Framework Section */}
              <div className="border-t pt-6">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Objectives, Outcomes & Outputs</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Define objectives, outcomes, and outputs with comprehensive monitoring indicators
                  </p>
                </div>
                
                <ResultsFramework
                  data={formData.resultsFramework || { objectives: [], projectDuration: 1 }}
                  onChange={(data) => setFormData({ ...formData, resultsFramework: data })}
                  readonly={false}
                />
              </div>
            </TabsContent>

            <TabsContent value="team" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectManager">Project Manager *</Label>
                <Input
                  id="projectManager"
                  name="projectManager"
                  value={formData.projectManager}
                  onChange={handleInputChange}
                  placeholder="Name of the project manager"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label>Team Members</Label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add team member name"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleTeamMemberAdd(e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      const input = e.currentTarget.parentElement?.querySelector('input')
                      if (input?.value) {
                        handleTeamMemberAdd(input.value)
                        input.value = ''
                      }
                    }}
                    disabled={isLoading}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.teamMembers.map((member, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer">
                      <Users className="h-3 w-3 mr-1" />
                      {member}
                      <X 
                        className="h-3 w-3 ml-1" 
                        onClick={() => handleTeamMemberRemove(member)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Stakeholders</Label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add stakeholder name or organization"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleStakeholderAdd(e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      const input = e.currentTarget.parentElement?.querySelector('input')
                      if (input?.value) {
                        handleStakeholderAdd(input.value)
                        input.value = ''
                      }
                    }}
                    disabled={isLoading}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.stakeholders.map((stakeholder, index) => (
                    <Badge key={index} variant="outline" className="cursor-pointer">
                      {stakeholder}
                      <X 
                        className="h-3 w-3 ml-1" 
                        onClick={() => handleStakeholderRemove(stakeholder)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="targets" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetBeneficiaries">Target Beneficiaries</Label>
                  <div className="relative">
                    <Target className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="targetBeneficiaries"
                      name="targetBeneficiaries"
                      type="number"
                      min="0"
                      value={formData.targetBeneficiaries}
                      onChange={handleInputChange}
                      className="pl-9"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="directBeneficiaries">Direct Beneficiaries</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="directBeneficiaries"
                      name="directBeneficiaries"
                      type="number"
                      min="0"
                      value={formData.directBeneficiaries}
                      onChange={handleInputChange}
                      className="pl-9"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="indirectBeneficiaries">Indirect Beneficiaries</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="indirectBeneficiaries"
                      name="indirectBeneficiaries"
                      type="number"
                      min="0"
                      value={formData.indirectBeneficiaries}
                      onChange={handleInputChange}
                      className="pl-9"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Impact Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total Target:</span>
                    <p className="font-semibold">{formData.targetBeneficiaries.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Direct Impact:</span>
                    <p className="font-semibold">{formData.directBeneficiaries.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Indirect Impact:</span>
                    <p className="font-semibold">{formData.indirectBeneficiaries.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </TabsContent>


            <TabsContent value="risks" className="space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-4">Add New Risk</h4>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Risk description"
                    value={newRisk.description}
                    onChange={(e) => setNewRisk(prev => ({ ...prev, description: e.target.value }))}
                    disabled={isLoading}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Select
                      value={newRisk.likelihood}
                      onValueChange={(value) => setNewRisk(prev => ({ ...prev, likelihood: value }))}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Likelihood" />
                      </SelectTrigger>
                      <SelectContent>
                        {riskLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={newRisk.impact}
                      onValueChange={(value) => setNewRisk(prev => ({ ...prev, impact: value }))}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Impact" />
                      </SelectTrigger>
                      <SelectContent>
                        {riskLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={newRisk.status}
                      onValueChange={(value) => setNewRisk(prev => ({ ...prev, status: value }))}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {riskStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Textarea
                    placeholder="Mitigation strategy"
                    value={newRisk.mitigation}
                    onChange={(e) => setNewRisk(prev => ({ ...prev, mitigation: e.target.value }))}
                    disabled={isLoading}
                  />
                  <Button type="button" onClick={handleRiskAdd} disabled={isLoading}>
                    Add Risk
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {formData.risks.map((risk, index) => (
                  <div key={risk.id || index} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          <Badge variant={getRiskColor(risk.likelihood) as any}>
                            {risk.likelihood} Likelihood
                          </Badge>
                          <Badge variant={getRiskColor(risk.impact) as any}>
                            {risk.impact} Impact
                          </Badge>
                          <Badge variant="outline">{risk.status}</Badge>
                        </div>
                        <p className="text-sm mb-2">{risk.description}</p>
                        {risk.mitigation && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Mitigation:</strong> {risk.mitigation}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRiskRemove(risk.id!)}
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? 'Update Project' : 'Create Project'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
    </div>
  )
}
