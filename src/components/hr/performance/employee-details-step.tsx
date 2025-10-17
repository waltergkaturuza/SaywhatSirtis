'use client'

import React, { useEffect, useState } from 'react'
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

interface Department {
  id: string
  name: string
}

export function EmployeeDetailsStep({ formData, updateFormData }: EmployeeDetailsStepProps) {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loadingDepartments, setLoadingDepartments] = useState(true)

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      setLoadingDepartments(true)
      const response = await fetch('/api/hr/departments')
      if (response.ok) {
        const data = await response.json()
        setDepartments(data.departments || [])
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
    } finally {
      setLoadingDepartments(false)
    }
  }

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
      <Card className="border-2 border-gray-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b-2 border-orange-200">
          <CardTitle className="flex items-center space-x-2 text-xl font-bold text-gray-900">
            <UserIcon className="h-6 w-6 text-orange-600" />
            <span>Employee Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="employeeName" className="text-sm font-bold text-gray-700">Employee Name *</Label>
              <Input
                id="employeeName"
                value={formData.employee.name}
                onChange={(e) => handleEmployeeChange('name', e.target.value)}
                placeholder="Enter employee name"
                required
                readOnly
                className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-300 rounded-lg mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="employeeEmail" className="text-sm font-bold text-gray-700">Email Address *</Label>
              <Input
                id="employeeEmail"
                type="email"
                value={formData.employee.email}
                onChange={(e) => handleEmployeeChange('email', e.target.value)}
                placeholder="employee@saywhat.co.zw"
                required
                readOnly
                className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-300 rounded-lg mt-1"
              />
            </div>

            <div>
              <Label htmlFor="department" className="text-sm font-bold text-gray-700">Department *</Label>
              <Input
                id="department"
                value={formData.employee.department}
                placeholder={loadingDepartments ? "Loading departments..." : "Department will be auto-filled"}
                readOnly
                className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-300 rounded-lg mt-1"
              />
            </div>

            <div>
              <Label htmlFor="position" className="text-sm font-bold text-gray-700">Position/Job Title *</Label>
              <Input
                id="position"
                value={formData.employee.position}
                onChange={(e) => handleEmployeeChange('position', e.target.value)}
                placeholder="Enter job title"
                required
                readOnly
                className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-300 rounded-lg mt-1"
              />
            </div>

            <div>
              <Label htmlFor="manager" className="text-sm font-bold text-gray-700">Direct Supervisor *</Label>
              <Input
                id="manager"
                value={formData.employee.manager}
                onChange={(e) => handleEmployeeChange('manager', e.target.value)}
                placeholder="Enter supervisor name"
                required
                readOnly
                className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-300 rounded-lg mt-1"
              />
            </div>

            <div>
              <Label htmlFor="reviewer" className="text-sm font-bold text-gray-700">Final Reviewer *</Label>
              <Input
                id="reviewer"
                value={formData.employee.reviewer || ''}
                onChange={(e) => handleEmployeeChange('reviewer', e.target.value)}
                placeholder="Enter reviewer name"
                required
                readOnly
                className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-300 rounded-lg mt-1"
              />
            </div>

            <div>
              <Label htmlFor="hireDate" className="text-sm font-bold text-gray-700">Hire Date</Label>
              <Input
                id="hireDate"
                type="date"
                value={formData.employee.hireDate}
                onChange={(e) => handleEmployeeChange('hireDate', e.target.value)}
                readOnly
                className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-300 rounded-lg mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-gray-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b-2 border-green-200">
          <CardTitle className="flex items-center space-x-2 text-xl font-bold text-gray-900">
            <CalendarIcon className="h-6 w-6 text-green-600" />
            <span>Review Period</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="startDate" className="text-sm font-bold text-gray-700">Review Period Start *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.employee.reviewPeriod.startDate}
                onChange={(e) => handleReviewPeriodChange('startDate', e.target.value)}
                required
                className="border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg mt-1"
              />
            </div>

            <div>
              <Label htmlFor="endDate" className="text-sm font-bold text-gray-700">Review Period End *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.employee.reviewPeriod.endDate}
                onChange={(e) => handleReviewPeriodChange('endDate', e.target.value)}
                required
                className="border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg mt-1"
              />
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
            <p className="text-sm text-blue-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              This appraisal covers the performance period from the start date to the end date above.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
