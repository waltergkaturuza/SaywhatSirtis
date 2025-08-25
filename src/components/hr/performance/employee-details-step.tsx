'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarIcon, UserIcon } from '@heroicons/react/24/outline'
import { AppraisalFormData } from './appraisal-types'

interface EmployeeDetailsStepProps {
  formData: AppraisalFormData
  updateFormData: (updates: Partial<AppraisalFormData>) => void
}

export function EmployeeDetailsStep({ formData, updateFormData }: EmployeeDetailsStepProps) {
  const handleEmployeeChange = (field: string, value: string) => {
    updateFormData({
      employee: {
        ...formData.employee,
        [field]: value
      }
    })
  }

  const handleReviewPeriodChange = (field: string, value: string) => {
    updateFormData({
      employee: {
        ...formData.employee,
        reviewPeriod: {
          ...formData.employee.reviewPeriod,
          [field]: value
        }
      }
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserIcon className="h-5 w-5" />
            <span>Employee Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employeeName">Employee Name *</Label>
              <Input
                id="employeeName"
                value={formData.employee.name}
                onChange={(e) => handleEmployeeChange('name', e.target.value)}
                placeholder="Enter employee name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="employeeEmail">Email Address *</Label>
              <Input
                id="employeeEmail"
                type="email"
                value={formData.employee.email}
                onChange={(e) => handleEmployeeChange('email', e.target.value)}
                placeholder="employee@saywhat.co.zw"
                required
              />
            </div>

            <div>
              <Label htmlFor="department">Department *</Label>
              <Select
                value={formData.employee.department}
                onValueChange={(value) => handleEmployeeChange('department', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="hr">Human Resources</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="position">Position/Job Title *</Label>
              <Input
                id="position"
                value={formData.employee.position}
                onChange={(e) => handleEmployeeChange('position', e.target.value)}
                placeholder="Enter job title"
                required
              />
            </div>

            <div>
              <Label htmlFor="manager">Direct Manager *</Label>
              <Input
                id="manager"
                value={formData.employee.manager}
                onChange={(e) => handleEmployeeChange('manager', e.target.value)}
                placeholder="Enter manager name"
                required
              />
            </div>

            <div>
              <Label htmlFor="hireDate">Hire Date</Label>
              <Input
                id="hireDate"
                type="date"
                value={formData.employee.hireDate}
                onChange={(e) => handleEmployeeChange('hireDate', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5" />
            <span>Review Period</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Review Period Start *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.employee.reviewPeriod.startDate}
                onChange={(e) => handleReviewPeriodChange('startDate', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="endDate">Review Period End *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.employee.reviewPeriod.endDate}
                onChange={(e) => handleReviewPeriodChange('endDate', e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            This appraisal covers the performance period from the start date to the end date above.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
