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
          {formData.performance.categories.map((category) => {
            // Calculate the score for this category: (rating / 5) * weight
            const categoryScore = (category.rating / 5) * category.weight
            
            return (
              <div key={category.id} className="border-2 border-gray-200 rounded-xl p-5 bg-gradient-to-br from-gray-50 to-white shadow-sm hover:shadow-md transition-shadow duration-200 last:mb-0">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-bold text-lg text-gray-900">{category.name}</h4>
                      <Badge className="bg-orange-500 text-white font-bold px-3 py-1 shadow-sm">Weight: {category.weight}%</Badge>
                    </div>
                    {category.description && (
                      <p className="text-sm text-gray-600 italic mb-2">{category.description}</p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <StarRating 
                      rating={category.rating}
                      onRatingChange={(rating) => handleCategoryRating(category.id, rating)}
                    />
                    <div className="text-xs font-semibold text-gray-500 mt-1">
                      {category.rating} / 5 stars
                    </div>
                  </div>
                </div>
                
                {/* Live Calculation Display */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200 mb-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 font-semibold">Calculation:</span>
                    <span className="text-gray-900 font-mono">
                      ({category.rating} ÷ 5) × {category.weight}% = <span className="text-blue-600 font-bold">{categoryScore.toFixed(2)}%</span>
                    </span>
                  </div>
                </div>
                
                <Textarea
                  placeholder={`Add comments about ${category.name.toLowerCase()}...`}
                  value={category.comment}
                  onChange={(e) => handleCategoryComment(category.id, e.target.value)}
                  className="border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-lg"
                  rows={3}
                />
              </div>
            )
          })}
          
          {/* Core Values Score Summary */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-300 shadow-md mt-6">
            <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Core Values Performance Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                <div className="text-sm text-gray-600 mb-1">Total Core Values</div>
                <div className="text-2xl font-bold text-gray-900">{formData.performance.categories.length}</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                <div className="text-sm text-gray-600 mb-1">Maximum Possible</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formData.performance.categories.reduce((sum, cat) => sum + cat.weight, 0)}%
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border-2 border-green-400 text-center">
                <div className="text-sm text-gray-600 mb-1">Your Core Values Score</div>
                <div className="text-3xl font-bold text-green-600">
                  {formData.performance.categories.reduce((sum, cat) => sum + ((cat.rating / 5) * cat.weight), 0).toFixed(2)}%
                </div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-800">
                <strong>Note:</strong> Each core value is weighted equally at 20%. Your rating (1-5 stars) is converted to a percentage: 
                (Rating ÷ 5) × 20%. All five core values combine to a maximum of 100%.
              </div>
            </div>
          </div>
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
