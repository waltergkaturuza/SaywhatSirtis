'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Plus, X, Save, FileText, DollarSign, Users, MapPin } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface JobPostingFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (jobData: any) => Promise<void>
  editingJob?: any
  isLoading?: boolean
}

const departments = [
  'Technology',
  'Human Resources', 
  'Programs',
  'Call Centre',
  'Analytics',
  'Finance',
  'Operations',
  'Marketing'
]

const jobTypes = [
  { value: 'full-time', label: 'Full Time' },
  { value: 'part-time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'temporary', label: 'Temporary' }
]

const jobLevels = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior Level' },
  { value: 'executive', label: 'Executive' }
]

const jobStatuses = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'closed', label: 'Closed' }
]

export default function JobPostingForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingJob, 
  isLoading = false 
}: JobPostingFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    type: '',
    level: '',
    status: 'draft',
    description: '',
    requirements: [] as string[],
    responsibilities: [] as string[],
    salary: {
      min: '',
      max: '',
      currency: 'USD'
    },
    benefits: [] as string[],
    postedDate: null as Date | null,
    closingDate: null as Date | null
  })

  const [currentRequirement, setCurrentRequirement] = useState('')
  const [currentResponsibility, setCurrentResponsibility] = useState('')
  const [currentBenefit, setCurrentBenefit] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset form when modal opens/closes or editing job changes
  useEffect(() => {
    if (isOpen) {
      if (editingJob) {
        setFormData({
          title: editingJob.title || '',
          department: editingJob.department || '',
          location: editingJob.location || '',
          type: editingJob.type || '',
          level: editingJob.level || '',
          status: editingJob.status || 'draft',
          description: editingJob.description || '',
          requirements: editingJob.requirements || [],
          responsibilities: editingJob.responsibilities || [],
          salary: {
            min: editingJob.salary?.min?.toString() || '',
            max: editingJob.salary?.max?.toString() || '',
            currency: editingJob.salary?.currency || 'USD'
          },
          benefits: editingJob.benefits || [],
          postedDate: editingJob.postedDate ? new Date(editingJob.postedDate) : null,
          closingDate: editingJob.closingDate ? new Date(editingJob.closingDate) : null
        })
      } else {
        // Reset to empty form for new job
        setFormData({
          title: '',
          department: '',
          location: '',
          type: '',
          level: '',
          status: 'draft',
          description: '',
          requirements: [],
          responsibilities: [],
          salary: {
            min: '',
            max: '',
            currency: 'USD'
          },
          benefits: [],
          postedDate: null,
          closingDate: null
        })
      }
      setErrors({})
    }
  }, [isOpen, editingJob])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = 'Job title is required'
    if (!formData.department) newErrors.department = 'Department is required'
    if (!formData.location.trim()) newErrors.location = 'Location is required'
    if (!formData.type) newErrors.type = 'Job type is required'
    if (!formData.level) newErrors.level = 'Job level is required'
    if (!formData.description.trim()) newErrors.description = 'Job description is required'

    if (formData.salary.min && formData.salary.max) {
      const minSalary = parseFloat(formData.salary.min)
      const maxSalary = parseFloat(formData.salary.max)
      if (minSalary >= maxSalary) {
        newErrors.salary = 'Maximum salary must be greater than minimum salary'
      }
    }

    if (formData.postedDate && formData.closingDate && formData.postedDate >= formData.closingDate) {
      newErrors.closingDate = 'Closing date must be after posted date'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const submitData = {
      ...formData,
      salary: {
        min: formData.salary.min ? parseFloat(formData.salary.min) : null,
        max: formData.salary.max ? parseFloat(formData.salary.max) : null,
        currency: formData.salary.currency
      }
    }

    if (editingJob) {
      submitData.id = editingJob.id
    }

    try {
      await onSubmit(submitData)
      onClose()
    } catch (error) {
      console.error('Error submitting job posting:', error)
    }
  }

  const addRequirement = () => {
    if (currentRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, currentRequirement.trim()]
      }))
      setCurrentRequirement('')
    }
  }

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }))
  }

  const addResponsibility = () => {
    if (currentResponsibility.trim()) {
      setFormData(prev => ({
        ...prev,
        responsibilities: [...prev.responsibilities, currentResponsibility.trim()]
      }))
      setCurrentResponsibility('')
    }
  }

  const removeResponsibility = (index: number) => {
    setFormData(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.filter((_, i) => i !== index)
    }))
  }

  const addBenefit = () => {
    if (currentBenefit.trim()) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, currentBenefit.trim()]
      }))
      setCurrentBenefit('')
    }
  }

  const removeBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            {editingJob ? 'Edit Job Posting' : 'Create New Job Posting'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Job Details</TabsTrigger>
              <TabsTrigger value="compensation">Compensation</TabsTrigger>
              <TabsTrigger value="dates">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Job Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g. Senior Software Engineer"
                        className={errors.title ? 'border-red-500' : ''}
                      />
                      {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
                    </div>

                    <div>
                      <Label htmlFor="department">Department *</Label>
                      <Select
                        value={formData.department}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                      >
                        <SelectTrigger className={errors.department ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.department && <p className="text-sm text-red-500 mt-1">{errors.department}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="location">Location *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="e.g. Remote, New York, NY"
                          className={cn("pl-10", errors.location ? 'border-red-500' : '')}
                        />
                      </div>
                      {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location}</p>}
                    </div>

                    <div>
                      <Label htmlFor="type">Job Type *</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {jobTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.type && <p className="text-sm text-red-500 mt-1">{errors.type}</p>}
                    </div>

                    <div>
                      <Label htmlFor="level">Job Level *</Label>
                      <Select
                        value={formData.level}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, level: value }))}
                      >
                        <SelectTrigger className={errors.level ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          {jobLevels.map((level) => (
                            <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.level && <p className="text-sm text-red-500 mt-1">{errors.level}</p>}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobStatuses.map((status) => (
                          <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Job Description & Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="description">Job Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                      className={cn("min-h-[120px]", errors.description ? 'border-red-500' : '')}
                    />
                    {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
                  </div>

                  <div>
                    <Label>Requirements</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={currentRequirement}
                          onChange={(e) => setCurrentRequirement(e.target.value)}
                          placeholder="Add a requirement..."
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                        />
                        <Button type="button" onClick={addRequirement} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.requirements.map((req, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {req}
                            <X 
                              className="h-3 w-3 cursor-pointer hover:text-red-500" 
                              onClick={() => removeRequirement(index)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Key Responsibilities</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={currentResponsibility}
                          onChange={(e) => setCurrentResponsibility(e.target.value)}
                          placeholder="Add a responsibility..."
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addResponsibility())}
                        />
                        <Button type="button" onClick={addResponsibility} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.responsibilities.map((resp, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {resp}
                            <X 
                              className="h-3 w-3 cursor-pointer hover:text-red-500" 
                              onClick={() => removeResponsibility(index)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compensation" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Compensation & Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Salary Range</Label>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Input
                          type="number"
                          value={formData.salary.min}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            salary: { ...prev.salary, min: e.target.value }
                          }))}
                          placeholder="Minimum"
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          value={formData.salary.max}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            salary: { ...prev.salary, max: e.target.value }
                          }))}
                          placeholder="Maximum"
                        />
                      </div>
                      <div>
                        <Select
                          value={formData.salary.currency}
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            salary: { ...prev.salary, currency: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {errors.salary && <p className="text-sm text-red-500 mt-1">{errors.salary}</p>}
                  </div>

                  <div>
                    <Label>Benefits & Perks</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={currentBenefit}
                          onChange={(e) => setCurrentBenefit(e.target.value)}
                          placeholder="Add a benefit..."
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                        />
                        <Button type="button" onClick={addBenefit} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.benefits.map((benefit, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {benefit}
                            <X 
                              className="h-3 w-3 cursor-pointer hover:text-red-500" 
                              onClick={() => removeBenefit(index)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dates" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Timeline & Dates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Posted Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.postedDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.postedDate ? format(formData.postedDate, "PPP") : "Select posted date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.postedDate}
                            onSelect={(date) => setFormData(prev => ({ ...prev, postedDate: date }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label>Closing Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.closingDate && "text-muted-foreground",
                              errors.closingDate && "border-red-500"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.closingDate ? format(formData.closingDate, "PPP") : "Select closing date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.closingDate}
                            onSelect={(date) => setFormData(prev => ({ ...prev, closingDate: date }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.closingDate && <p className="text-sm text-red-500 mt-1">{errors.closingDate}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {isLoading ? 'Saving...' : (editingJob ? 'Update Job' : 'Create Job')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
