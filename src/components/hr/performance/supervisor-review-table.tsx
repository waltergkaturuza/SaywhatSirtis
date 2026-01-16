'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { StarIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline'
import { AppraisalFormData } from './appraisal-types'

interface SupervisorReviewTableProps {
  appraisal: {
    id: string
    employeeName: string
    employeeId: string
    department: string
    position: string
    reviewPeriod: {
      startDate: string
      endDate: string
    }
  }
  formData: AppraisalFormData
  performancePlan?: {
    keyResponsibilities?: Array<{
      id: string
      description: string
      weight: number
      progress?: number
      achievementPercentage?: number
      totalScore?: number
      achievedScore?: number
    }>
  }
  onSave: (ratings: Array<{
    categoryId: string
    supervisorRating: number
    supervisorComment: string
  }>, responsibilities?: Array<{
    responsibilityId: string
    supervisorAchievementPercentage: number
    supervisorAchievedScore: number
  }>) => Promise<void>
  isSaving?: boolean
}

export function SupervisorReviewTable({
  appraisal,
  formData,
  performancePlan,
  onSave,
  isSaving = false
}: SupervisorReviewTableProps) {
  const [supervisorRatings, setSupervisorRatings] = useState<Record<string, { rating: number; comment: string }>>({})
  const [supervisorResponsibilities, setSupervisorResponsibilities] = useState<Record<string, Record<string, { actualValue: number }>>>({})
  const [isSavingRatings, setIsSavingRatings] = useState(false)

  // Initialize supervisor ratings from formData
  useEffect(() => {
    const ratings: Record<string, { rating: number; comment: string }> = {}
    formData.performance.categories.forEach(cat => {
      ratings[cat.id] = {
        rating: cat.supervisorRating || 0,
        comment: cat.supervisorComment || ''
      }
    })
    setSupervisorRatings(ratings)
    
    // Initialize supervisor responsibilities assessments - store actual values for each indicator
    const responsibilities: Record<string, Record<string, { actualValue: number }>> = {}
    formData.achievements?.keyResponsibilities?.forEach(resp => {
      const indicatorValues: Record<string, { actualValue: number }> = {}
      resp.successIndicators?.forEach(ind => {
        // Try to get supervisor's actual value, fallback to employee's actual value
        indicatorValues[ind.id] = {
          actualValue: (ind as any).supervisorActualValue ?? ind.actualValue ?? 0
        }
      })
      responsibilities[resp.id] = indicatorValues
    })
    setSupervisorResponsibilities(responsibilities)
  }, [formData])

  const handleRatingChange = (categoryId: string, rating: number) => {
    setSupervisorRatings(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        rating
      }
    }))
  }

  const handleCommentChange = (categoryId: string, comment: string) => {
    setSupervisorRatings(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        comment
      }
    }))
  }

  // Calculate achievement from indicators using the same formula as employee form
  const calculateResponsibilityAchievement = (responsibility: any, indicatorActualValues: Record<string, number>) => {
    if (!responsibility.successIndicators || responsibility.successIndicators.length === 0) {
      return {
        achievementPercentage: 0,
        achievedScore: 0,
        totalScore: responsibility.weight || 0
      }
    }

    // Calculate total weight of all indicators
    const totalIndicatorWeight = responsibility.successIndicators.reduce(
      (sum: number, ind: any) => sum + (Number(ind.weight) || 0), 
      0
    )

    if (totalIndicatorWeight === 0) {
      return {
        achievementPercentage: 0,
        achievedScore: 0,
        totalScore: responsibility.weight || 0
      }
    }

    // Calculate achieved score from indicators
    // For each indicator: score = weight * (actualValue / targetValue)
    const achievedScore = responsibility.successIndicators.reduce((sum: number, ind: any) => {
      const target = Number(ind.target) || 0
      const actual = indicatorActualValues[ind.id] ?? Number(ind.actualValue) ?? 0
      const weight = Number(ind.weight) || 0
      const achievementPct = target > 0 ? (actual / target) : 0
      return sum + (weight * achievementPct)
    }, 0)

    // Achievement percentage = (achieved score / total indicator weight) * 100
    const achievementPercentage = totalIndicatorWeight > 0 
      ? (achievedScore / totalIndicatorWeight) * 100 
      : 0

    // Total score for the responsibility = responsibility weight
    const totalScore = responsibility.weight || 0

    // Achieved score for the responsibility = (achievement percentage / 100) * total score
    const responsibilityAchievedScore = (achievementPercentage / 100) * totalScore

    return {
      achievementPercentage: Math.round(achievementPercentage * 100) / 100,
      achievedScore: Math.round(responsibilityAchievedScore * 100) / 100,
      totalScore
    }
  }

  const handleIndicatorActualValueChange = (respId: string, indicatorId: string, actualValue: number) => {
    setSupervisorResponsibilities(prev => ({
      ...prev,
      [respId]: {
        ...(prev[respId] || {}),
        [indicatorId]: {
          actualValue
        }
      }
    }))
  }

  const handleSave = async () => {
    setIsSavingRatings(true)
    try {
      const ratingsArray = Object.entries(supervisorRatings).map(([categoryId, data]) => ({
        categoryId,
        supervisorRating: data.rating,
        supervisorComment: data.comment
      }))
      
      // Include responsibility assessments - calculate from indicator actual values
      const responsibilitiesArray = Object.entries(supervisorResponsibilities).map(([respId, indicatorValues]) => {
        const responsibility = formData.achievements?.keyResponsibilities?.find(r => r.id === respId)
        if (!responsibility) return null
        
        // Convert indicator values to actual values map
        const actualValues: Record<string, number> = {}
        Object.entries(indicatorValues).forEach(([indId, data]) => {
          actualValues[indId] = data.actualValue
        })
        
        // Calculate achievement using same formula as employee
        const calculated = calculateResponsibilityAchievement(responsibility, actualValues)
        
        return {
          responsibilityId: respId,
          supervisorAchievementPercentage: calculated.achievementPercentage,
          supervisorAchievedScore: calculated.achievedScore,
          supervisorIndicators: Object.entries(indicatorValues).map(([indId, data]) => ({
            indicatorId: indId,
            actualValue: data.actualValue
          }))
        }
      }).filter(Boolean) as any[]
      
      await onSave(ratingsArray, responsibilitiesArray)
    } finally {
      setIsSavingRatings(false)
    }
  }

  const StarRating = ({ rating, onRatingChange, disabled = false }: { 
    rating: number
    onRatingChange: (rating: number) => void
    disabled?: boolean
  }) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !disabled && onRatingChange(star)}
          disabled={disabled}
          className={`focus:outline-none ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {star <= rating ? (
            <StarIcon className="h-5 w-5 text-yellow-400" />
          ) : (
            <StarOutlineIcon className="h-5 w-5 text-gray-300" />
          )}
        </button>
      ))}
    </div>
  )

  // Calculate achievement percentage from performance plan
  const getAchievementPercentage = (categoryName: string): number => {
    // Try to match category with key responsibilities from plan
    // For now, return a default or calculate from plan progress
    if (performancePlan?.keyResponsibilities && performancePlan.keyResponsibilities.length > 0) {
      // Calculate average progress from all responsibilities
      const totalProgress = performancePlan.keyResponsibilities.reduce((sum, resp) => 
        sum + (resp.progress || resp.achievementPercentage || 0), 0
      )
      return performancePlan.keyResponsibilities.length > 0 
        ? Math.round(totalProgress / performancePlan.keyResponsibilities.length) 
        : 0
    }
    return 0
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-orange-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b-2 border-orange-200">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
            <svg className="w-6 h-6 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Supervisor Review - Performance Assessment Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Employee Details Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Employee Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <span className="ml-2 font-medium text-gray-900">{appraisal.employeeName}</span>
              </div>
              <div>
                <span className="text-gray-600">Department:</span>
                <span className="ml-2 font-medium text-gray-900">{appraisal.department}</span>
              </div>
              <div>
                <span className="text-gray-600">Position:</span>
                <span className="ml-2 font-medium text-gray-900">{appraisal.position}</span>
              </div>
              <div>
                <span className="text-gray-600">Review Period:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {appraisal.reviewPeriod.startDate && appraisal.reviewPeriod.endDate
                    ? `${new Date(appraisal.reviewPeriod.startDate).toLocaleDateString()} - ${new Date(appraisal.reviewPeriod.endDate).toLocaleDateString()}`
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Key Responsibilities Section */}
          {formData.achievements?.keyResponsibilities && formData.achievements.keyResponsibilities.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Responsibility Areas & Achievements</h3>
              <div className="space-y-6">
                {formData.achievements.keyResponsibilities.map((resp) => {
                  // Employee's achievement data (calculated from indicators)
                  const employeeAchievementPct = resp.achievementPercentage || 0
                  const employeeTotalScore = resp.totalScore || resp.weight || 0
                  const employeeAchievedScore = resp.achievedScore || 0
                  
                  // Supervisor's indicator actual values
                  const supervisorIndicatorValues = supervisorResponsibilities[resp.id] || {}
                  const supervisorActualValues: Record<string, number> = {}
                  Object.entries(supervisorIndicatorValues).forEach(([indId, data]) => {
                    supervisorActualValues[indId] = data.actualValue
                  })
                  
                  // Calculate supervisor's achievement using same formula
                  const supervisorCalculated = calculateResponsibilityAchievement(resp, supervisorActualValues)
                  const supervisorAchievementPct = supervisorCalculated.achievementPercentage
                  const supervisorAchievedScore = supervisorCalculated.achievedScore
                  const supervisorTotalScore = supervisorCalculated.totalScore
                  
                  return (
                    <div key={resp.id} className="bg-white border-2 border-gray-200 rounded-lg p-4 shadow-sm">
                      {/* Responsibility Header */}
                      <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-gray-200">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">{resp.description}</h4>
                          {resp.tasks && (
                            <p className="text-sm text-gray-600 mt-1">{resp.tasks}</p>
                          )}
                        </div>
                        <Badge className="bg-blue-500 text-white font-bold text-lg px-3 py-1">
                          Weight: {resp.weight}%
                        </Badge>
                      </div>
                      
                      {/* Success Indicators Table */}
                      {resp.successIndicators && resp.successIndicators.length > 0 && (
                        <div className="mb-4">
                          <h5 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Success Indicators
                          </h5>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                              <thead className="bg-gradient-to-r from-green-100 to-green-50">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase border-r border-gray-300">Indicator</th>
                                  <th className="px-3 py-2 text-center text-xs font-bold text-gray-700 uppercase border-r border-gray-300">Weight</th>
                                  <th className="px-3 py-2 text-center text-xs font-bold text-gray-700 uppercase border-r border-gray-300">Target</th>
                                  <th className="px-3 py-2 text-center text-xs font-bold text-blue-700 uppercase border-r border-gray-300 bg-blue-50">Employee Actual</th>
                                  <th className="px-3 py-2 text-center text-xs font-bold text-blue-700 uppercase border-r border-gray-300 bg-blue-50">Employee Achievement</th>
                                  <th className="px-3 py-2 text-center text-xs font-bold text-blue-700 uppercase border-r border-gray-300 bg-blue-50">Employee Score</th>
                                  <th className="px-3 py-2 text-center text-xs font-bold text-orange-700 uppercase border-r border-gray-300 bg-orange-50">Your Actual</th>
                                  <th className="px-3 py-2 text-center text-xs font-bold text-orange-700 uppercase border-r border-gray-300 bg-orange-50">Your Achievement</th>
                                  <th className="px-3 py-2 text-center text-xs font-bold text-orange-700 uppercase bg-orange-50">Your Score</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {resp.successIndicators.map((ind) => {
                                  const target = Number(ind.target) || 0
                                  const employeeActual = Number(ind.actualValue) || 0
                                  const supervisorActual = supervisorActualValues[ind.id] ?? employeeActual
                                  const weight = Number(ind.weight) || 0
                                  
                                  // Employee calculations
                                  const employeeAchievementPct = target > 0 ? Math.round((employeeActual / target) * 100) : 0
                                  const employeeIndicatorScore = weight * (employeeAchievementPct / 100)
                                  
                                  // Supervisor calculations
                                  const supervisorAchievementPct = target > 0 ? Math.round((supervisorActual / target) * 100) : 0
                                  const supervisorIndicatorScore = weight * (supervisorAchievementPct / 100)
                                  
                                  return (
                                    <tr key={ind.id} className="hover:bg-gray-50">
                                      <td className="px-3 py-2 border-r border-gray-300">
                                        <div className="text-sm font-medium text-gray-900">{ind.indicator}</div>
                                        <div className="text-xs text-gray-500">{ind.measurement}</div>
                                      </td>
                                      <td className="px-3 py-2 text-center border-r border-gray-300">
                                        <Badge className="bg-gray-500 text-white font-bold">{weight}%</Badge>
                                      </td>
                                      <td className="px-3 py-2 text-center border-r border-gray-300">
                                        <span className="text-sm font-medium">{target}</span>
                                      </td>
                                      <td className="px-3 py-2 text-center border-r border-gray-300 bg-blue-50">
                                        <span className="text-sm font-medium text-blue-700">{employeeActual}</span>
                                      </td>
                                      <td className="px-3 py-2 text-center border-r border-gray-300 bg-blue-50">
                                        <Badge className={`${employeeAchievementPct >= 100 ? 'bg-green-500' : employeeAchievementPct >= 75 ? 'bg-blue-500' : employeeAchievementPct >= 50 ? 'bg-yellow-500' : 'bg-red-500'} text-white font-bold`}>
                                          {employeeAchievementPct}%
                                        </Badge>
                                      </td>
                                      <td className="px-3 py-2 text-center border-r border-gray-300 bg-blue-50">
                                        <Badge className="bg-purple-500 text-white font-bold">
                                          {employeeIndicatorScore.toFixed(2)} / {weight}
                                        </Badge>
                                      </td>
                                      <td className="px-3 py-2 text-center border-r border-gray-300 bg-orange-50">
                                        <input
                                          type="number"
                                          min="0"
                                          step="0.1"
                                          value={supervisorActual}
                                          onChange={(e) => handleIndicatorActualValueChange(resp.id, ind.id, parseFloat(e.target.value) || 0)}
                                          className="w-20 px-2 py-1 text-sm text-center border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                                        />
                                      </td>
                                      <td className="px-3 py-2 text-center border-r border-gray-300 bg-orange-50">
                                        <Badge className={`${supervisorAchievementPct >= 100 ? 'bg-green-500' : supervisorAchievementPct >= 75 ? 'bg-blue-500' : supervisorAchievementPct >= 50 ? 'bg-yellow-500' : 'bg-red-500'} text-white font-bold`}>
                                          {supervisorAchievementPct}%
                                        </Badge>
                                      </td>
                                      <td className="px-3 py-2 text-center bg-orange-50">
                                        <Badge className="bg-purple-500 text-white font-bold">
                                          {supervisorIndicatorScore.toFixed(2)} / {weight}
                                        </Badge>
                                      </td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>
                          
                          {/* Responsibility Summary */}
                          <div className="mt-4 bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg border-2 border-orange-200">
                            <h5 className="font-bold text-gray-900 mb-3">Responsibility Summary</h5>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Total Indicators:</span>
                                <span className="ml-2 font-bold text-gray-900">{resp.successIndicators.length}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Total Weight:</span>
                                <span className="ml-2 font-bold text-gray-900">
                                  {resp.successIndicators.reduce((sum, ind) => sum + (Number(ind.weight) || 0), 0)}%
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Employee Achievement:</span>
                                <span className="ml-2 font-bold text-blue-700">{employeeAchievementPct.toFixed(1)}%</span>
                                <div className="text-xs text-blue-600">
                                  Score: {employeeAchievedScore.toFixed(2)} / {employeeTotalScore.toFixed(1)}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-600">Your Achievement:</span>
                                <span className="ml-2 font-bold text-orange-700">{supervisorAchievementPct.toFixed(1)}%</span>
                                <div className="text-xs text-orange-600">
                                  Score: {supervisorAchievedScore.toFixed(2)} / {supervisorTotalScore.toFixed(1)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Performance Categories Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
              <thead className="bg-gradient-to-r from-orange-100 to-orange-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300 w-64">
                    Performance Category
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300 w-20">
                    Weight
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300 w-28">
                    Achievement %
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300 w-40">
                    Employee Self-Rating
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300 w-32">
                    Supervisor Rating
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider min-w-96">
                    Supervisor Comments
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {formData.performance.categories.map((category) => {
                  const achievementPercentage = getAchievementPercentage(category.name)
                  const employeeScore = (category.rating / 5) * category.weight
                  const supervisorData = supervisorRatings[category.id] || { rating: 0, comment: '' }
                  const supervisorScore = (supervisorData.rating / 5) * category.weight

                  return (
                    <tr key={category.id} className="hover:bg-orange-50 transition-colors">
                      <td className="px-4 py-4 border-r border-gray-300">
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                        {category.description && (
                          <div className="text-xs text-gray-500 mt-1 max-w-xs">{category.description}</div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center border-r border-gray-300">
                        <Badge className="bg-orange-500 text-white font-bold">
                          {category.weight}%
                        </Badge>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center border-r border-gray-300">
                        <div className="text-sm font-medium text-gray-900">{achievementPercentage}%</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center border-r border-gray-300">
                        <div className="flex flex-col items-center space-y-1">
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <StarIcon 
                                key={star} 
                                className={`h-4 w-4 ${star <= category.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <div className="text-xs font-semibold text-gray-600">
                            {category.rating}/5 ({employeeScore.toFixed(1)}%)
                          </div>
                          {category.comment && (
                            <div className="text-xs text-gray-500 italic max-w-xs text-center">
                              "{category.comment.substring(0, 50)}..."
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center border-r border-gray-300">
                        <div className="flex flex-col items-center space-y-2">
                          <StarRating
                            rating={supervisorData.rating}
                            onRatingChange={(rating) => handleRatingChange(category.id, rating)}
                          />
                          <div className="text-xs font-semibold text-gray-600">
                            {supervisorData.rating}/5 ({supervisorScore.toFixed(1)}%)
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 min-w-96">
                        <Textarea
                          value={supervisorData.comment}
                          onChange={(e) => handleCommentChange(category.id, e.target.value)}
                          placeholder={`Explain why you gave this supervisor rating...`}
                          className="w-full text-sm border-gray-300 focus:border-orange-500 focus:ring-orange-200 min-w-96"
                          rows={4}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Overall Rating Summary */}
          <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Employee Self-Rating</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formData.performance.categories.reduce((sum, cat) => sum + ((cat.rating / 5) * cat.weight), 0).toFixed(1)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Supervisor Rating</div>
                <div className="text-2xl font-bold text-orange-600">
                  {formData.performance.categories.reduce((sum, cat) => {
                    const supData = supervisorRatings[cat.id] || { rating: 0 }
                    return sum + ((supData.rating / 5) * cat.weight)
                  }, 0).toFixed(1)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Difference</div>
                <div className="text-2xl font-bold text-blue-600">
                  {(
                    formData.performance.categories.reduce((sum, cat) => {
                      const supData = supervisorRatings[cat.id] || { rating: 0 }
                      return sum + ((supData.rating / 5) * cat.weight)
                    }, 0) - 
                    formData.performance.categories.reduce((sum, cat) => sum + ((cat.rating / 5) * cat.weight), 0)
                  ).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isSavingRatings || isSaving}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2"
            >
              {isSavingRatings || isSaving ? 'Saving...' : 'Save Supervisor Ratings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
