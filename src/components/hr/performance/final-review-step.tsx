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

  const calculateOverallRating = () => {
    if (formData.performance.categories.length === 0) return 0
    
    const totalWeightedScore = formData.performance.categories.reduce((sum, cat) => {
      return sum + (cat.rating * cat.weight / 100)
    }, 0)
    
    return Math.round(totalWeightedScore * 10) / 10
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200 shadow-md">
              <Label className="text-sm font-bold text-gray-700 mb-3 block">Calculated Overall Rating</Label>
              <div className="flex items-center space-x-4 mt-3">
                <div className="text-5xl font-bold text-blue-600">
                  {calculateOverallRating()}/5
                </div>
                <Badge className="bg-blue-500 text-white font-bold px-4 py-2 text-base shadow-md">
                  {ratingScale.find(scale => scale.value === Math.round(calculateOverallRating()))?.label || 'Not rated'}
                </Badge>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border-2 border-yellow-200 shadow-md">
              <Label className="text-sm font-bold text-gray-700 mb-3 block">Final Rating Override</Label>
              <div className="mt-3">
                <StarRating 
                  rating={formData.ratings.finalRating}
                  onRatingChange={(rating) => handleRatingChange('finalRating', rating)}
                />
                <div className="text-sm font-semibold text-gray-700 mt-3">
                  {ratingScale.find(scale => scale.value === formData.ratings.finalRating)?.label || 'Not rated'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-sm font-medium text-blue-900 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
            <svg className="w-5 h-5 inline mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            The calculated rating is based on weighted category scores. You can override this with the final rating if needed.
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
                <div className="flex justify-between">
                  <strong className="text-gray-700">Manager:</strong> 
                  <span className="text-gray-900 font-medium">{formData.employee.manager}</span>
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
