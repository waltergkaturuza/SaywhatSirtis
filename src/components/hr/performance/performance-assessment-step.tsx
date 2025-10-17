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
      <Card className="border-2 border-gray-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b-2 border-orange-200">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
            <svg className="w-6 h-6 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Performance Assessment by Category
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {formData.performance.categories.map((category) => (
            <div key={category.id} className="border-2 border-gray-200 rounded-xl p-5 bg-gradient-to-br from-gray-50 to-white shadow-sm hover:shadow-md transition-shadow duration-200 last:mb-0">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-lg text-gray-900">{category.name}</h4>
                  <Badge className="bg-orange-500 text-white font-bold px-3 py-1 mt-1 shadow-sm">Weight: {category.weight}%</Badge>
                </div>
                <div className="text-right">
                  <StarRating 
                    rating={category.rating}
                    onRatingChange={(rating) => handleCategoryRating(category.id, rating)}
                  />
                  <div className="text-sm font-semibold text-gray-700 mt-2">
                    {ratingScale.find(scale => scale.value === category.rating)?.label || 'Not rated'}
                  </div>
                </div>
              </div>
              
              <Textarea
                placeholder={`Add comments about ${category.name.toLowerCase()}...`}
                value={category.comment}
                onChange={(e) => handleCategoryComment(category.id, e.target.value)}
                className="mt-3 border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-lg"
                rows={3}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Strengths */}
      <Card className="border-2 border-gray-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b-2 border-green-200">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
            <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Key Strengths
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {formData.performance.strengths.map((strength, index) => (
            <div key={index} className="flex gap-3">
              <Textarea
                placeholder="Describe a key strength..."
                value={strength}
                onChange={(e) => handleStrengthChange(index, e.target.value)}
                className="flex-1 border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg"
                rows={2}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => removeStrength(index)}
                className="border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-500 font-semibold rounded-lg transition-all duration-200"
              >
                Remove
              </Button>
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={addStrength}
            className="w-full border-2 border-green-400 text-green-700 hover:bg-green-50 hover:border-green-500 font-semibold py-3 rounded-lg transition-all duration-200"
          >
            <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Strength
          </Button>
        </CardContent>
      </Card>

      {/* Areas for Improvement */}
      <Card className="border-2 border-gray-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-b-2 border-yellow-200">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
            <svg className="w-6 h-6 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Areas for Improvement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {formData.performance.areasForImprovement.map((area, index) => (
            <div key={index} className="flex gap-3">
              <Textarea
                placeholder="Describe an area for improvement..."
                value={area}
                onChange={(e) => handleImprovementChange(index, e.target.value)}
                className="flex-1 border-2 border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 rounded-lg"
                rows={2}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => removeImprovement(index)}
                className="border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-500 font-semibold rounded-lg transition-all duration-200"
              >
                Remove
              </Button>
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={addImprovement}
            className="w-full border-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-500 font-semibold py-3 rounded-lg transition-all duration-200"
          >
            <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Area for Improvement
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
