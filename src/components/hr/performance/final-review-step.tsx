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
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Calculated Overall Rating</Label>
              <div className="flex items-center space-x-3 mt-2">
                <div className="text-3xl font-bold text-blue-600">
                  {calculateOverallRating()}/5
                </div>
                <Badge className="bg-blue-100 text-blue-800">
                  {ratingScale.find(scale => scale.value === Math.round(calculateOverallRating()))?.label || 'Not rated'}
                </Badge>
              </div>
            </div>
            
            <div>
              <Label>Final Rating Override</Label>
              <div className="mt-2">
                <StarRating 
                  rating={formData.ratings.finalRating}
                  onRatingChange={(rating) => handleRatingChange('finalRating', rating)}
                />
                <div className="text-sm text-gray-600 mt-1">
                  {ratingScale.find(scale => scale.value === formData.ratings.finalRating)?.label || 'Not rated'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
            The calculated rating is based on weighted category scores. You can override this with the final rating if needed.
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="recommendation">Employment Recommendation</Label>
            <Select
              value={formData.ratings.recommendation}
              onValueChange={(value) => handleRatingChange('recommendation', value)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select recommendation" />
              </SelectTrigger>
              <SelectContent>
                {recommendationTypes.map((rec) => (
                  <SelectItem key={rec.value} value={rec.value}>
                    <div>
                      <div className="font-medium">{rec.label}</div>
                      <div className="text-sm text-gray-600">{rec.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="salaryRecommendation">Salary/Compensation Recommendation</Label>
            <Input
              id="salaryRecommendation"
              placeholder="e.g., 5% increase, promotion to Grade 7, etc."
              value={formData.ratings.salaryRecommendation}
              onChange={(e) => handleRatingChange('salaryRecommendation', e.target.value)}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Appraisal Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Appraisal Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Employee Information</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Name:</strong> {formData.employee.name}</div>
                <div><strong>Position:</strong> {formData.employee.position}</div>
                <div><strong>Department:</strong> {formData.employee.department}</div>
                <div><strong>Manager:</strong> {formData.employee.manager}</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Review Period</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Start:</strong> {formData.employee.reviewPeriod.startDate}</div>
                <div><strong>End:</strong> {formData.employee.reviewPeriod.endDate}</div>
                <div><strong>Goals Reviewed:</strong> {formData.achievements.goals.length}</div>
                <div><strong>Training Needs:</strong> {formData.development.trainingNeeds.length}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
