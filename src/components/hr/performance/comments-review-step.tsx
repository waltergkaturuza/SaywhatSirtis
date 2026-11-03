'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { AppraisalFormData } from './appraisal-types'

interface FeedbackComment {
  id?: string
  name?: string
  comment?: string
  action?: string
  timestamp?: string
}

interface CommentsReviewStepProps {
  formData: AppraisalFormData
  updateFormData: (updates: Partial<AppraisalFormData>) => void
  lockSupervisorComments?: boolean
  lockReviewerComments?: boolean
  supervisorFeedback?: FeedbackComment[]
  reviewerFeedback?: FeedbackComment[]
}

export function CommentsReviewStep({
  formData,
  updateFormData,
  lockSupervisorComments = false,
  lockReviewerComments = false,
  supervisorFeedback = [],
  reviewerFeedback = []
}: CommentsReviewStepProps) {
  const handleCommentChange = (field: keyof typeof formData.comments, value: string) => {
    updateFormData({
      comments: {
        ...formData.comments,
        [field]: value
      }
    })
  }

  const supervisorComment = supervisorFeedback.filter((item) => item.comment).map((item) => item.comment).join('\n\n')
    || formData.comments.managerComments
    || (formData.comments as { supervisorComments?: string }).supervisorComments
    || ''
  const reviewerComment = reviewerFeedback.filter((item) => item.comment).map((item) => item.comment).join('\n\n')
    || formData.comments.hrComments
    || (formData.comments as { reviewerComments?: string }).reviewerComments
    || ''

  const feedbackList = (items: FeedbackComment[], emptyText: string) => {
    const written = items.filter((item) => item.comment)
    if (written.length === 0) {
      return <p className="text-sm italic text-gray-500">{emptyText}</p>
    }
    return (
      <div className="space-y-3">
        {written.map((item, index) => (
          <div key={item.id || `${item.timestamp || 'comment'}-${index}`} className="rounded-md border border-gray-200 bg-gray-50 p-3">
            <div className="mb-1 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-gray-900">{item.name || 'Comment'}</p>
              <p className="text-xs text-gray-500">
                {item.timestamp ? new Date(item.timestamp).toLocaleString() : ''}
                {item.action ? ` · ${item.action.replace(/_/g, ' ')}` : ''}
              </p>
            </div>
            <p className="whitespace-pre-wrap text-sm text-gray-800">{item.comment}</p>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-gray-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Employee Comments
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Label htmlFor="employeeComments" className="text-sm font-bold text-gray-700 flex items-center mb-3">
            <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            Employee's self-assessment and comments
          </Label>
          <Textarea
            id="employeeComments"
            placeholder="Employee's comments about their performance, challenges, and achievements..."
            value={formData.comments.employeeComments}
            onChange={(e) => handleCommentChange('employeeComments', e.target.value)}
            rows={6}
            className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
          />
        </CardContent>
      </Card>

      <Card className="border-2 border-gray-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b-2 border-green-200">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
            <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Supervisor's Comments
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Label htmlFor="managerComments" className="text-sm font-bold text-gray-700 flex items-center mb-3">
            <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Supervisor's assessment and feedback
          </Label>
          {lockSupervisorComments ? (
            feedbackList(supervisorFeedback, 'No comments yet. Supervisor feedback will appear here.')
          ) : (
            <Textarea
              id="managerComments"
              placeholder="Supervisor's comments about employee performance, observations, and recommendations..."
              value={supervisorComment}
              onChange={(e) => handleCommentChange('managerComments', e.target.value)}
              rows={6}
              className="border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg"
            />
          )}
          {lockSupervisorComments && (
            <p className="mt-2 text-sm text-gray-500">Taken from the Supervisor Review tab. Only the assigned supervisor can add it.</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-2 border-gray-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b-2 border-purple-200">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
            <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Reviewer's Comments
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Label htmlFor="hrComments" className="text-sm font-bold text-gray-700 flex items-center mb-3">
            <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Final reviewer's assessment and notes
          </Label>
          {lockReviewerComments ? (
            feedbackList(reviewerFeedback, 'No comments yet. Final reviewer feedback will appear here.')
          ) : (
            <Textarea
              id="hrComments"
              placeholder="Reviewer's comments, final assessment, and additional notes..."
              value={reviewerComment}
              onChange={(e) => handleCommentChange('hrComments', e.target.value)}
              rows={4}
              className="border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg"
            />
          )}
          {lockReviewerComments && (
            <p className="mt-2 text-sm text-gray-500">Taken from the Final Review tab. Only the assigned reviewer can add it.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
