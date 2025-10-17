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

  // Calculate actual weighted score across all responsibilities
  const calculateActualPoints = () => {
    if (!formData.achievements.keyResponsibilities || formData.achievements.keyResponsibilities.length === 0) return 0
    
    return formData.achievements.keyResponsibilities.reduce((totalScore, resp) => {
      // For each responsibility, calculate its weighted score based on indicators
      if (!resp.successIndicators || resp.successIndicators.length === 0) return totalScore
      
      const respWeight = Number(resp.weight) || 0
      
      // Calculate the responsibility's achievement percentage from its indicators
      const indicatorsTotalWeight = resp.successIndicators.reduce((sum, ind) => sum + (Number(ind.weight) || 0), 0)
      
      if (indicatorsTotalWeight === 0) return totalScore
      
      const respAchievedScore = resp.successIndicators.reduce((sum, ind) => {
        const target = Number(ind.target) || 0
        const actual = Number(ind.actualValue) || 0
        const weight = Number(ind.weight) || 0
        const achievementPct = target > 0 ? (actual / target) : 0
        return sum + (weight * achievementPct)
      }, 0)
      
      // Calculate this responsibility's contribution to overall score
      const respAchievementRate = respAchievedScore / indicatorsTotalWeight
      const respContribution = respWeight * respAchievementRate
      
      return totalScore + respContribution
    }, 0)
  }

  // Calculate maximum possible points (sum of all responsibility weights)
  const calculateMaxPoints = () => {
    if (!formData.achievements.keyResponsibilities || formData.achievements.keyResponsibilities.length === 0) return 0
    
    return formData.achievements.keyResponsibilities.reduce((sum, resp) => {
      return sum + (Number(resp.weight) || 0)
    }, 0)
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
          {/* Detailed Score Breakdown by Responsibility */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200 shadow-md mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Detailed Score Breakdown by Key Responsibility
            </h3>
            
            <div className="space-y-4">
              {formData.achievements.keyResponsibilities && formData.achievements.keyResponsibilities.length > 0 ? (
                formData.achievements.keyResponsibilities.map((resp, idx) => {
                  const respWeight = Number(resp.weight) || 0
                  const indicatorsTotalWeight = resp.successIndicators?.reduce((sum, ind) => sum + (Number(ind.weight) || 0), 0) || 0
                  
                  const respAchievedScore = resp.successIndicators?.reduce((sum, ind) => {
                    const target = Number(ind.target) || 0
                    const actual = Number(ind.actualValue) || 0
                    const weight = Number(ind.weight) || 0
                    const achievementPct = target > 0 ? (actual / target) : 0
                    return sum + (weight * achievementPct)
                  }, 0) || 0
                  
                  const respAchievementRate = indicatorsTotalWeight > 0 ? (respAchievedScore / indicatorsTotalWeight) * 100 : 0
                  const respContribution = respWeight * (respAchievementRate / 100)
                  
                  return (
                    <div key={resp.id} className="bg-white p-5 rounded-xl border-2 border-gray-200 shadow-sm">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className="bg-orange-500 text-white font-bold">KR #{idx + 1}</Badge>
                            <span className="font-bold text-gray-900">{resp.description || 'Untitled Responsibility'}</span>
                          </div>
                          <div className="text-sm text-gray-600 mb-3">Weight: <span className="font-bold text-gray-900">{respWeight}%</span></div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500 mb-1">Achievement Rate</div>
                          <Badge className={`${respAchievementRate >= 90 ? 'bg-green-500' : respAchievementRate >= 75 ? 'bg-blue-500' : respAchievementRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'} text-white font-bold text-lg px-3 py-1`}>
                            {respAchievementRate.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Success Indicators Breakdown */}
                      {resp.successIndicators && resp.successIndicators.length > 0 && (
                        <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-lg border border-gray-200 mb-3">
                          <div className="text-sm font-bold text-gray-700 mb-3">Success Indicators:</div>
                          <div className="space-y-2">
                            {resp.successIndicators.map((ind, indIdx) => {
                              const target = Number(ind.target) || 0
                              const actual = Number(ind.actualValue) || 0
                              const weight = Number(ind.weight) || 0
                              const achievementPct = target > 0 ? ((actual / target) * 100) : 0
                              const indicatorScore = weight * (achievementPct / 100)
                              
                              return (
                                <div key={ind.id} className="flex items-center justify-between text-xs bg-white p-3 rounded border border-gray-200">
                                  <div className="flex-1">
                                    <span className="font-semibold text-gray-700">{ind.indicator || `Indicator ${indIdx + 1}`}</span>
                                    <div className="text-gray-500 mt-1">
                                      Target: {target} | Actual: {actual} | Weight: {weight}%
                                    </div>
                                  </div>
                                  <div className="text-right ml-4">
                                    <div className="font-bold text-gray-900">{achievementPct.toFixed(1)}%</div>
                                    <div className="text-gray-600">Score: {indicatorScore.toFixed(2)}/{weight}</div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                      
                      {/* Responsibility Score Summary */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-300">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-xs text-gray-600 mb-1">Max Score</div>
                            <div className="text-lg font-bold text-gray-900">{respWeight}%</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600 mb-1">Achieved Score</div>
                            <div className="text-lg font-bold text-green-600">{respContribution.toFixed(2)}%</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600 mb-1">Achievement</div>
                            <div className="text-lg font-bold text-blue-600">{respAchievementRate.toFixed(1)}%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No key responsibilities to display
                </div>
              )}
            </div>
          </div>

          {/* Core Values Assessment Breakdown */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200 shadow-md mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              SAYWHAT Core Values Assessment
            </h3>
            
            <div className="space-y-3">
              {formData.performance.categories.map((category, idx) => {
                const categoryScore = (category.rating / 5) * category.weight
                
                return (
                  <div key={category.id} className="bg-white p-4 rounded-lg border-2 border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-purple-500 text-white font-bold">CV #{idx + 1}</Badge>
                        <span className="font-bold text-gray-900">{category.name}</span>
                        <span className="text-sm text-gray-500">Weight: {category.weight}%</span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 mb-1">Rating</div>
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <StarIcon key={star} className={`h-4 w-4 ${star <= category.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                          <span className="ml-2 font-bold text-gray-900">{category.rating}/5</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-white p-3 rounded border border-purple-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">Calculation: ({category.rating} ÷ 5) × {category.weight}%</span>
                        <Badge className="bg-purple-600 text-white font-bold text-base px-3 py-1">
                          {categoryScore.toFixed(2)}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Core Values Total */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-300 mt-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg text-gray-900">Total Core Values Score:</span>
                <Badge className="bg-green-600 text-white font-bold text-2xl px-5 py-2 shadow-lg">
                  {formData.performance.categories.reduce((sum, cat) => sum + ((cat.rating / 5) * cat.weight), 0).toFixed(2)}%
                </Badge>
              </div>
              <div className="text-sm text-gray-600 mt-2">
                Maximum possible: {formData.performance.categories.reduce((sum, cat) => sum + cat.weight, 0)}% (All 5 core values at 5 stars)
              </div>
            </div>
          </div>

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
                ({calculateActualPoints().toFixed(2)} ÷ {calculateMaxPoints()}) × 100 = <span className="font-bold text-orange-600">{calculatePerformancePercentage()}%</span>
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
              <SelectTrigger className="mt-2 border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg bg-white">
                <SelectValue placeholder="Select recommendation">
                  {formData.ratings.recommendation && (
                    <div className="font-semibold text-gray-900">
                      {recommendationTypes.find(r => r.value === formData.ratings.recommendation)?.label || 'Select recommendation'}
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white">
                {recommendationTypes.map((rec) => (
                  <SelectItem 
                    key={rec.value} 
                    value={rec.value}
                    className="bg-white hover:bg-gray-100 focus:bg-gray-100 cursor-pointer py-3"
                  >
                    <div className="flex flex-col space-y-1">
                      <div className="font-bold text-gray-900">{rec.label}</div>
                      <div className="text-xs text-gray-600">{rec.description}</div>
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
