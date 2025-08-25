'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CalendarDaysIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface PayrollPeriod {
  name: string
  startDate: string
  endDate: string
  payDate: string
  description?: string
  type: 'monthly' | 'bi-weekly' | 'weekly' | 'quarterly'
}

interface CreatePeriodModalProps {
  isOpen: boolean
  onClose: () => void
  onCreatePeriod: (period: PayrollPeriod) => void
  existingPeriods?: PayrollPeriod[]
}

export function CreatePeriodModal({
  isOpen,
  onClose,
  onCreatePeriod,
  existingPeriods = []
}: CreatePeriodModalProps) {
  const [formData, setFormData] = useState<PayrollPeriod>({
    name: '',
    startDate: '',
    endDate: '',
    payDate: '',
    description: '',
    type: 'monthly'
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: keyof PayrollPeriod, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Period name is required'
    } else if (existingPeriods.some(p => p.name.toLowerCase() === formData.name.toLowerCase())) {
      newErrors.name = 'A period with this name already exists'
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required'
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required'
    } else if (formData.startDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date'
    }

    if (!formData.payDate) {
      newErrors.payDate = 'Pay date is required'
    } else if (formData.endDate && new Date(formData.payDate) < new Date(formData.endDate)) {
      newErrors.payDate = 'Pay date should be after the period end date'
    }

    if (!formData.type) {
      newErrors.type = 'Period type is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const generatePeriodName = (type: string, startDate: string) => {
    if (!startDate) return ''
    
    const date = new Date(startDate)
    const month = date.toLocaleLString('en-US', { month: 'long' })
    const year = date.getFullYear()
    
    switch (type) {
      case 'monthly':
        return `${month} ${year}`
      case 'bi-weekly':
        const weekNumber = Math.ceil(date.getDate() / 14)
        return `${month} ${year} - Week ${weekNumber * 2 - 1}-${weekNumber * 2}`
      case 'weekly':
        const weekNum = Math.ceil(date.getDate() / 7)
        return `${month} ${year} - Week ${weekNum}`
      case 'quarterly':
        const quarter = Math.ceil((date.getMonth() + 1) / 3)
        return `Q${quarter} ${year}`
      default:
        return `${month} ${year}`
    }
  }

  const handleTypeChange = (type: string) => {
    const newFormData = { ...formData, type: type as PayrollPeriod['type'] }
    
    if (formData.startDate) {
      newFormData.name = generatePeriodName(type, formData.startDate)
    }
    
    setFormData(newFormData)
  }

  const handleStartDateChange = (startDate: string) => {
    const newFormData = { ...formData, startDate }
    
    if (startDate && formData.type) {
      newFormData.name = generatePeriodName(formData.type, startDate)
      
      // Auto-calculate end date based on period type
      const start = new Date(startDate)
      let endDate = new Date(start)
      
      switch (formData.type) {
        case 'weekly':
          endDate.setDate(start.getDate() + 6)
          break
        case 'bi-weekly':
          endDate.setDate(start.getDate() + 13)
          break
        case 'monthly':
          endDate.setMonth(start.getMonth() + 1)
          endDate.setDate(0) // Last day of month
          break
        case 'quarterly':
          endDate.setMonth(start.getMonth() + 3)
          endDate.setDate(0) // Last day of quarter
          break
      }
      
      newFormData.endDate = endDate.toISOString().split('T')[0]
      
      // Set pay date (typically a few days after end date)
      const payDate = new Date(endDate)
      payDate.setDate(endDate.getDate() + 3)
      newFormData.payDate = payDate.toISOString().split('T')[0]
    }
    
    setFormData(newFormData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onCreatePeriod(formData)
      
      // Reset form
      setFormData({
        name: '',
        startDate: '',
        endDate: '',
        payDate: '',
        description: '',
        type: 'monthly'
      })
      
      onClose()
    } catch (error) {
      console.error('Error creating period:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      startDate: '',
      endDate: '',
      payDate: '',
      description: '',
      type: 'monthly'
    })
    setErrors({})
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDaysIcon className="h-5 w-5 text-orange-600" />
            Create New Payroll Period
          </DialogTitle>
          <DialogDescription>
            Define a new payroll period with start date, end date, and pay date.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Period Type</Label>
              <Select value={formData.type} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-sm text-red-600 mt-1">{errors.type}</p>}
            </div>

            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className={errors.startDate ? 'border-red-300' : ''}
              />
              {errors.startDate && <p className="text-sm text-red-600 mt-1">{errors.startDate}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="name">Period Name</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., January 2024"
              className={errors.name ? 'border-red-300' : ''}
            />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className={errors.endDate ? 'border-red-300' : ''}
              />
              {errors.endDate && <p className="text-sm text-red-600 mt-1">{errors.endDate}</p>}
            </div>

            <div>
              <Label htmlFor="payDate">Pay Date</Label>
              <Input
                id="payDate"
                type="date"
                value={formData.payDate}
                onChange={(e) => handleInputChange('payDate', e.target.value)}
                className={errors.payDate ? 'border-red-300' : ''}
              />
              {errors.payDate && <p className="text-sm text-red-600 mt-1">{errors.payDate}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Additional notes about this payroll period..."
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? 'Creating...' : 'Create Period'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
