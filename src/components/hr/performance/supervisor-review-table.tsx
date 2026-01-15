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

  const handleSave = async () => {
    setIsSavingRatings(true)
    try {
      const ratingsArray = Object.entries(supervisorRatings).map(([categoryId, data]) => ({
        categoryId,
        supervisorRating: data.rating,
        supervisorComment: data.comment
      }))
      await onSave(ratingsArray)
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
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-300 mb-6">
                  <thead className="bg-gradient-to-r from-blue-100 to-blue-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                        Key Responsibility
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                        Weight
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                        Achievement %
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                        Score
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.achievements.keyResponsibilities.map((resp) => {
                      const achievementPct = resp.achievementPercentage || 0
                      const totalScore = resp.totalScore || resp.weight || 0
                      const achievedScore = resp.achievedScore || 0
                      
                      return (
                        <tr key={resp.id} className="hover:bg-blue-50 transition-colors">
                          <td className="px-4 py-4 border-r border-gray-300">
                            <div className="text-sm font-medium text-gray-900">{resp.description}</div>
                            {resp.tasks && (
                              <div className="text-xs text-gray-500 mt-1">{resp.tasks}</div>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center border-r border-gray-300">
                            <Badge className="bg-blue-500 text-white font-bold">
                              {resp.weight}%
                            </Badge>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center border-r border-gray-300">
                            <div className="text-sm font-medium text-gray-900">{achievementPct}%</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center border-r border-gray-300">
                            <div className="text-sm font-semibold text-gray-900">
                              {achievedScore.toFixed(1)} / {totalScore.toFixed(1)}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <Badge className={
                              resp.achievementStatus === 'achieved' ? 'bg-green-500 text-white' :
                              resp.achievementStatus === 'partially-achieved' ? 'bg-yellow-500 text-white' :
                              'bg-red-500 text-white'
                            }>
                              {resp.achievementStatus === 'achieved' ? 'Achieved' :
                               resp.achievementStatus === 'partially-achieved' ? 'Partial' :
                               'Not Achieved'}
                            </Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
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
                    Your Rating
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider min-w-96">
                    Your Comments
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
                          placeholder={`Explain why you gave ${supervisorData.rating || 'this'} rating...`}
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
                <div className="text-sm text-gray-600 mb-1">Your Rating</div>
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
