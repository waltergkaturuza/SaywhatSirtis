'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { AppraisalFormData } from './appraisal-types'

interface CommentsReviewStepProps {
  formData: AppraisalFormData
  updateFormData: (updates: Partial<AppraisalFormData>) => void
}

export function CommentsReviewStep({ formData, updateFormData }: CommentsReviewStepProps) {
  const handleCommentChange = (field: keyof typeof formData.comments, value: string) => {
    updateFormData({
      comments: {
        ...formData.comments,
        [field]: value
      }
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Employee Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="employeeComments">
            Employee's self-assessment and comments
          </Label>
          <Textarea
            id="employeeComments"
            placeholder="Employee's comments about their performance, challenges, and achievements..."
            value={formData.comments.employeeComments}
            onChange={(e) => handleCommentChange('employeeComments', e.target.value)}
            rows={6}
            className="mt-2"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manager Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="managerComments">
            Manager's assessment and feedback
          </Label>
          <Textarea
            id="managerComments"
            placeholder="Manager's comments about employee performance, observations, and recommendations..."
            value={formData.comments.managerComments}
            onChange={(e) => handleCommentChange('managerComments', e.target.value)}
            rows={6}
            className="mt-2"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>HR Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="hrComments">
            HR department comments and notes
          </Label>
          <Textarea
            id="hrComments"
            placeholder="HR comments, policy considerations, and additional notes..."
            value={formData.comments.hrComments}
            onChange={(e) => handleCommentChange('hrComments', e.target.value)}
            rows={4}
            className="mt-2"
          />
        </CardContent>
      </Card>
    </div>
  )
}
