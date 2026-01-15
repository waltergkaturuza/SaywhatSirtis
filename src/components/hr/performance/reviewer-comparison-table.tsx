'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { StarIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline'
import { AppraisalFormData } from './appraisal-types'

interface ReviewerComparisonTableProps {
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
  onSave: (ratings: Array<{
    categoryId: string
    reviewerRating: number
    reviewerComment?: string
  }>) => Promise<void>
  isSaving?: boolean
}

export function ReviewerComparisonTable({
  appraisal,
  formData,
  onSave,
  isSaving = false
}: ReviewerComparisonTableProps) {
  const [reviewerRatings, setReviewerRatings] = useState<Record<string, { rating: number; comment: string }>>({})
  const [isSavingRatings, setIsSavingRatings] = useState(false)

  // Initialize reviewer ratings from formData
  useEffect(() => {
    const ratings: Record<string, { rating: number; comment: string }> = {}
    formData.performance.categories.forEach(cat => {
      ratings[cat.id] = {
        rating: cat.reviewerRating || 0,
        comment: cat.reviewerComment || ''
      }
    })
    setReviewerRatings(ratings)
  }, [formData])

  const handleRatingChange = (categoryId: string, rating: number) => {
    setReviewerRatings(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        rating
      }
    }))
  }

  const handleCommentChange = (categoryId: string, comment: string) => {
    setReviewerRatings(prev => ({
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
      const ratingsArray = Object.entries(reviewerRatings).map(([categoryId, data]) => ({
        categoryId,
        reviewerRating: data.rating,
        reviewerComment: data.comment
      }))
      await onSave(ratingsArray)
    } finally {
      setIsSavingRatings(false)
    }
  }

  const StarRating = ({ rating, onRatingChange }: { 
    rating: number
    onRatingChange: (rating: number) => void
  }) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(star)}
          className="focus:outline-none cursor-pointer"
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

  return (
    <div className="space-y-6">
      <Card className="border-2 border-purple-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b-2 border-purple-200">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
            <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Final Review - Employee vs Supervisor Comparison
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

          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
              <thead className="bg-gradient-to-r from-purple-100 to-purple-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    Performance Category
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    Weight
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-blue-700 uppercase tracking-wider border-r border-gray-300 bg-blue-50">
                    Employee Self-Rating
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-orange-700 uppercase tracking-wider border-r border-gray-300 bg-orange-50">
                    Supervisor Rating
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-purple-700 uppercase tracking-wider border-r border-gray-300 bg-purple-50">
                    Your Final Rating
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Comments (Optional)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {formData.performance.categories.map((category) => {
                  const employeeScore = (category.rating / 5) * category.weight
                  const supervisorScore = ((category.supervisorRating || 0) / 5) * category.weight
                  const reviewerData = reviewerRatings[category.id] || { rating: 0, comment: '' }
                  const reviewerScore = (reviewerData.rating / 5) * category.weight

                  return (
                    <tr key={category.id} className="hover:bg-purple-50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap border-r border-gray-300">
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                        {category.description && (
                          <div className="text-xs text-gray-500 mt-1">{category.description}</div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center border-r border-gray-300">
                        <Badge className="bg-purple-500 text-white font-bold">
                          {category.weight}%
                        </Badge>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center border-r border-gray-300 bg-blue-50">
                        <div className="flex flex-col items-center space-y-1">
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <StarIcon 
                                key={star} 
                                className={`h-4 w-4 ${star <= category.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <div className="text-xs font-semibold text-blue-700">
                            {category.rating}/5 ({employeeScore.toFixed(1)}%)
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center border-r border-gray-300 bg-orange-50">
                        <div className="flex flex-col items-center space-y-1">
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <StarIcon 
                                key={star} 
                                className={`h-4 w-4 ${star <= (category.supervisorRating || 0) ? 'text-yellow-400' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <div className="text-xs font-semibold text-orange-700">
                            {category.supervisorRating || 0}/5 ({supervisorScore.toFixed(1)}%)
                          </div>
                          {category.supervisorComment && (
                            <div className="text-xs text-orange-600 italic max-w-xs text-center mt-1">
                              "{category.supervisorComment.substring(0, 40)}..."
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center border-r border-gray-300 bg-purple-50">
                        <div className="flex flex-col items-center space-y-2">
                          <StarRating
                            rating={reviewerData.rating}
                            onRatingChange={(rating) => handleRatingChange(category.id, rating)}
                          />
                          <div className="text-xs font-semibold text-purple-700">
                            {reviewerData.rating}/5 ({reviewerScore.toFixed(1)}%)
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Textarea
                          value={reviewerData.comment}
                          onChange={(e) => handleCommentChange(category.id, e.target.value)}
                          placeholder="Optional comments..."
                          className="w-full text-sm border-gray-300 focus:border-purple-500 focus:ring-purple-200"
                          rows={2}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Overall Rating Summary */}
          <div className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border-2 border-purple-300">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Employee</div>
                <div className="text-2xl font-bold text-blue-600">
                  {formData.performance.categories.reduce((sum, cat) => sum + ((cat.rating / 5) * cat.weight), 0).toFixed(1)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Supervisor</div>
                <div className="text-2xl font-bold text-orange-600">
                  {formData.performance.categories.reduce((sum, cat) => sum + (((cat.supervisorRating || 0) / 5) * cat.weight), 0).toFixed(1)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Your Final Rating</div>
                <div className="text-2xl font-bold text-purple-600">
                  {formData.performance.categories.reduce((sum, cat) => {
                    const revData = reviewerRatings[cat.id] || { rating: 0 }
                    return sum + ((revData.rating / 5) * cat.weight)
                  }, 0).toFixed(1)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Final Score</div>
                <div className="text-3xl font-bold text-green-600">
                  {formData.performance.categories.reduce((sum, cat) => {
                    const revData = reviewerRatings[cat.id] || { rating: 0 }
                    return sum + ((revData.rating / 5) * cat.weight)
                  }, 0).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isSavingRatings || isSaving}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2"
            >
              {isSavingRatings || isSaving ? 'Saving...' : 'Save Final Ratings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
