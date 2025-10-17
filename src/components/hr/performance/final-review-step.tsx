'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { StarIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline'
import { AppraisalFormData, recommendationTypes, ratingScale } from './appraisal-types'

interface FinalReviewStepProps {
  formData: AppraisalFormData
  updateFormData: (updates: Partial<AppraisalFormData>) => void
}

export function FinalReviewStep({ formData, updateFormData }: FinalReviewStepProps) {
  const handleRatingChange = (field: keyof typeof formData.ratings, value: string | number) => {
    updateFormData({
      ratings: {
        ...formData.ratings,
        [field]: value
      }
    })
  }

  const StarRating = ({ rating, onRatingChange }: { rating: number, onRatingChange: (rating: number) => void }) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(star)}
          className="focus:outline-none"
        >
          {star <= rating ? (
            <StarIcon className="h-8 w-8 text-yellow-400" />
          ) : (
            <StarOutlineIcon className="h-8 w-8 text-gray-300" />
          )}
        </button>
      ))}
    </div>
  )

  // Calculate actual points based on key responsibilities ratings
  const calculateActualPoints = () => {
    if (!formData.achievements.keyResponsibilities || formData.achievements.keyResponsibilities.length === 0) return 0
    
    return formData.achievements.keyResponsibilities.reduce((sum, resp) => {
      // Get the rating points based on achievement status
      const ratingPoints = resp.achievementStatus === 'achieved' ? 50 : 
                          resp.achievementStatus === 'partially-achieved' ? 30 : 10
      return sum + ratingPoints
    }, 0)
  }

  // Calculate maximum possible points
  const calculateMaxPoints = () => {
    if (!formData.achievements.keyResponsibilities || formData.achievements.keyResponsibilities.length === 0) return 0
    
    // Maximum points = number of responsibilities × 50 (A1 rating)
    return formData.achievements.keyResponsibilities.length * 50
  }

  // Calculate percentage using SAYWHAT formula
  const calculatePerformancePercentage = () => {
    const actualPoints = calculateActualPoints()
    const maxPoints = calculateMaxPoints()
    
    if (maxPoints === 0) return 0
    return Math.round((actualPoints / maxPoints) * 100)
  }

  // Get rating code based on percentage
  const getRatingCode = () => {
    const percentage = calculatePerformancePercentage()
    if (percentage >= 90) return 'A1'
    if (percentage >= 75) return 'A2'
    if (percentage >= 60) return 'B1'
    if (percentage >= 50) return 'B2'
    if (percentage >= 40) return 'C1'
    return 'C2'
  }

  // Get rating label from code
  const getRatingLabel = () => {
    const code = getRatingCode()
    const rating = ratingScale.find(r => r.code === code)
    return rating ? rating.label : 'Not rated'
  }

  return (
    <div className="space-y-6">
      {/* Performance Summary */}
      <Card className="border-2 border-gray-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b-2 border-orange-200">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
            <svg className="w-6 h-6 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Calculation Formula Display */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-xl border-2 border-orange-200 shadow-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              SAYWHAT Rating Calculation Formula
            </h3>
            <div className="bg-white p-4 rounded-lg border border-orange-200 font-mono text-center text-lg">
              <div className="text-gray-700 mb-2">
                (Sum of Actual Points) ÷ (Sum of Best Possible Points) × 100 = <span className="font-bold text-orange-600">Percentage</span>
              </div>
              <div className="text-gray-600 text-sm mt-3">
                ({calculateActualPoints()} ÷ {calculateMaxPoints()}) × 100 = <span className="font-bold text-orange-600">{calculatePerformancePercentage()}%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200 shadow-md">
              <Label className="text-sm font-bold text-gray-700 mb-3 block">Calculated Performance Rating</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-600">Percentage:</span>
                  <span className="text-3xl font-bold text-blue-600">{calculatePerformancePercentage()}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-600">Rating Code:</span>
                  <Badge className="bg-blue-500 text-white font-bold px-4 py-2 text-lg shadow-md">
                    {getRatingCode()}
                  </Badge>
                </div>
                <div className="text-sm text-gray-700 mt-2 p-3 bg-white rounded-lg border border-blue-200">
                  {getRatingLabel()}
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 border-green-200 shadow-md">
              <Label className="text-sm font-bold text-gray-700 mb-3 block">Rating Scale Reference</Label>
              <div className="space-y-2 text-sm">
                {ratingScale.map((scale) => (
                  <div key={scale.code} className="flex justify-between items-center p-2 bg-white rounded border border-gray-200">
                    <div>
                      <span className="font-bold text-gray-900">{scale.code}</span>
                      <span className="text-gray-600 ml-2">{scale.label}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className="bg-gray-100 text-gray-700 font-semibold">{scale.points} pts</Badge>
                      <span className="text-xs text-gray-500">{scale.range}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="text-sm font-medium text-blue-900 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
            <svg className="w-5 h-5 inline mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <strong>Note:</strong> The rating is automatically calculated based on Key Responsibilities achievement status. Each responsibility rated as "Achieved" gets 50 points (A1), "Partially Achieved" gets 30 points (B1), and "Not Achieved" gets 10 points (C2). The final percentage determines your performance rating code.
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="border-2 border-gray-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b-2 border-green-200">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
            <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div>
            <Label htmlFor="recommendation" className="text-sm font-bold text-gray-700 mb-2 block">Employment Recommendation</Label>
            <Select
              value={formData.ratings.recommendation}
              onValueChange={(value) => handleRatingChange('recommendation', value)}
            >
              <SelectTrigger className="mt-2 border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg">
                <SelectValue placeholder="Select recommendation" />
              </SelectTrigger>
              <SelectContent>
                {recommendationTypes.map((rec) => (
                  <SelectItem key={rec.value} value={rec.value}>
                    <div>
                      <div className="font-bold">{rec.label}</div>
                      <div className="text-sm text-gray-600">{rec.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="salaryRecommendation" className="text-sm font-bold text-gray-700 mb-2 block">Salary/Compensation Recommendation</Label>
            <Input
              id="salaryRecommendation"
              placeholder="e.g., 5% increase, promotion to Grade 7, etc."
              value={formData.ratings.salaryRecommendation}
              onChange={(e) => handleRatingChange('salaryRecommendation', e.target.value)}
              className="mt-2 border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg"
            />
          </div>
        </CardContent>
      </Card>

      {/* Appraisal Summary */}
      <Card className="border-2 border-gray-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b-2 border-purple-200">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
            <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Appraisal Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border-2 border-gray-200 shadow-sm">
              <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Employee Information
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <strong className="text-gray-700">Name:</strong> 
                  <span className="text-gray-900 font-medium">{formData.employee.name}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <strong className="text-gray-700">Position:</strong> 
                  <span className="text-gray-900 font-medium">{formData.employee.position}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <strong className="text-gray-700">Department:</strong> 
                  <span className="text-gray-900 font-medium">{formData.employee.department}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <strong className="text-gray-700">Supervisor:</strong> 
                  <span className="text-gray-900 font-medium">{formData.employee.manager}</span>
                </div>
                <div className="flex justify-between">
                  <strong className="text-gray-700">Reviewer:</strong> 
                  <span className="text-gray-900 font-medium">{formData.employee.reviewer || 'Not assigned'}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border-2 border-gray-200 shadow-sm">
              <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Review Period
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <strong className="text-gray-700">Start:</strong> 
                  <span className="text-gray-900 font-medium">{formData.employee.reviewPeriod.startDate}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <strong className="text-gray-700">End:</strong> 
                  <span className="text-gray-900 font-medium">{formData.employee.reviewPeriod.endDate}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <strong className="text-gray-700">Key Responsibilities:</strong> 
                  <span className="text-gray-900 font-medium">{formData.achievements.keyResponsibilities.length}</span>
                </div>
                <div className="flex justify-between">
                  <strong className="text-gray-700">Training Needs:</strong> 
                  <span className="text-gray-900 font-medium">{formData.development.trainingNeeds.length}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
