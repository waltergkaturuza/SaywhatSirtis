'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { StarIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline'
import { AppraisalFormData, ratingScale } from './appraisal-types'

interface PerformanceAssessmentStepProps {
  formData: AppraisalFormData
  updateFormData: (updates: Partial<AppraisalFormData>) => void
}

export function PerformanceAssessmentStep({ formData, updateFormData }: PerformanceAssessmentStepProps) {
  const handleCategoryRating = (categoryId: string, rating: number) => {
    const updatedCategories = formData.performance.categories.map(cat =>
      cat.id === categoryId ? { ...cat, rating } : cat
    )
    
    updateFormData({
      performance: {
        ...formData.performance,
        categories: updatedCategories
      }
    })
  }

  const handleCategoryComment = (categoryId: string, comment: string) => {
    const updatedCategories = formData.performance.categories.map(cat =>
      cat.id === categoryId ? { ...cat, comment } : cat
    )
    
    updateFormData({
      performance: {
        ...formData.performance,
        categories: updatedCategories
      }
    })
  }

  const handleStrengthChange = (index: number, value: string) => {
    const newStrengths = [...formData.performance.strengths]
    newStrengths[index] = value
    
    updateFormData({
      performance: {
        ...formData.performance,
        strengths: newStrengths
      }
    })
  }

  const handleImprovementChange = (index: number, value: string) => {
    const newImprovements = [...formData.performance.areasForImprovement]
    newImprovements[index] = value
    
    updateFormData({
      performance: {
        ...formData.performance,
        areasForImprovement: newImprovements
      }
    })
  }

  const addStrength = () => {
    updateFormData({
      performance: {
        ...formData.performance,
        strengths: [...formData.performance.strengths, '']
      }
    })
  }

  const addImprovement = () => {
    updateFormData({
      performance: {
        ...formData.performance,
        areasForImprovement: [...formData.performance.areasForImprovement, '']
      }
    })
  }

  const removeStrength = (index: number) => {
    const newStrengths = formData.performance.strengths.filter((_, i) => i !== index)
    updateFormData({
      performance: {
        ...formData.performance,
        strengths: newStrengths
      }
    })
  }

  const removeImprovement = (index: number) => {
    const newImprovements = formData.performance.areasForImprovement.filter((_, i) => i !== index)
    updateFormData({
      performance: {
        ...formData.performance,
        areasForImprovement: newImprovements
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
            <StarIcon className="h-6 w-6 text-yellow-400" />
          ) : (
            <StarOutlineIcon className="h-6 w-6 text-gray-300" />
          )}
        </button>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Performance Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Assessment by Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {formData.performance.categories.map((category) => (
            <div key={category.id} className="border-b pb-6 last:border-b-0">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium text-lg">{category.name}</h4>
                  <Badge variant="outline">Weight: {category.weight}%</Badge>
                </div>
                <div className="text-right">
                  <StarRating 
                    rating={category.rating}
                    onRatingChange={(rating) => handleCategoryRating(category.id, rating)}
                  />
                  <div className="text-sm text-gray-600 mt-1">
                    {ratingScale.find(scale => scale.value === category.rating)?.label || 'Not rated'}
                  </div>
                </div>
              </div>
              
              <Textarea
                placeholder={`Add comments about ${category.name.toLowerCase()}...`}
                value={category.comment}
                onChange={(e) => handleCategoryComment(category.id, e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Strengths */}
      <Card>
        <CardHeader>
          <CardTitle>Key Strengths</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.performance.strengths.map((strength, index) => (
            <div key={index} className="flex gap-2">
              <Textarea
                placeholder="Describe a key strength..."
                value={strength}
                onChange={(e) => handleStrengthChange(index, e.target.value)}
                className="flex-1"
                rows={2}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => removeStrength(index)}
                className="mt-2"
              >
                Remove
              </Button>
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={addStrength}
            className="w-full"
          >
            Add Strength
          </Button>
        </CardContent>
      </Card>

      {/* Areas for Improvement */}
      <Card>
        <CardHeader>
          <CardTitle>Areas for Improvement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.performance.areasForImprovement.map((area, index) => (
            <div key={index} className="flex gap-2">
              <Textarea
                placeholder="Describe an area for improvement..."
                value={area}
                onChange={(e) => handleImprovementChange(index, e.target.value)}
                className="flex-1"
                rows={2}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => removeImprovement(index)}
                className="mt-2"
              >
                Remove
              </Button>
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={addImprovement}
            className="w-full"
          >
            Add Area for Improvement
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
