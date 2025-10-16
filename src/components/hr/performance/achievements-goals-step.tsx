'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { AppraisalFormData, goalStatuses } from './appraisal-types'

interface AchievementsGoalsStepProps {
  formData: AppraisalFormData
  updateFormData: (updates: Partial<AppraisalFormData>) => void
}

export function AchievementsGoalsStep({ formData, updateFormData }: AchievementsGoalsStepProps) {
  // Key Responsibilities handlers
  const updateResponsibility = (respId: string, field: string, value: any) => {
    const updatedResponsibilities = formData.achievements.keyResponsibilities.map(resp =>
      resp.id === respId ? { ...resp, [field]: value } : resp
    )
    
    updateFormData({
      achievements: {
        ...formData.achievements,
        keyResponsibilities: updatedResponsibilities
      }
    })
  }

  const updateSuccessIndicator = (respId: string, indicatorId: string, field: string, value: any) => {
    const updatedResponsibilities = formData.achievements.keyResponsibilities.map(resp => {
      if (resp.id === respId) {
        const updatedIndicators = resp.successIndicators.map(ind =>
          ind.id === indicatorId ? { ...ind, [field]: value } : ind
        )
        return { ...resp, successIndicators: updatedIndicators }
      }
      return resp
    })
    
    updateFormData({
      achievements: {
        ...formData.achievements,
        keyResponsibilities: updatedResponsibilities
      }
    })
  }

  const addGoal = () => {
    updateFormData({
      achievements: {
        ...formData.achievements,
        goals: [...formData.achievements.goals, {
          id: Date.now().toString(),
          description: '',
          status: 'not-achieved',
          comment: ''
        }]
      }
    })
  }

  const updateGoal = (goalId: string, field: string, value: string) => {
    const updatedGoals = formData.achievements.goals.map(goal =>
      goal.id === goalId ? { ...goal, [field]: value } : goal
    )
    
    updateFormData({
      achievements: {
        ...formData.achievements,
        goals: updatedGoals
      }
    })
  }

  const removeGoal = (goalId: string) => {
    const updatedGoals = formData.achievements.goals.filter(goal => goal.id !== goalId)
    updateFormData({
      achievements: {
        ...formData.achievements,
        goals: updatedGoals
      }
    })
  }

  const addAccomplishment = () => {
    updateFormData({
      achievements: {
        ...formData.achievements,
        keyAccomplishments: [...formData.achievements.keyAccomplishments, '']
      }
    })
  }

  const updateAccomplishment = (index: number, value: string) => {
    const newAccomplishments = [...formData.achievements.keyAccomplishments]
    newAccomplishments[index] = value
    updateFormData({
      achievements: {
        ...formData.achievements,
        keyAccomplishments: newAccomplishments
      }
    })
  }

  const removeAccomplishment = (index: number) => {
    const newAccomplishments = formData.achievements.keyAccomplishments.filter((_, i) => i !== index)
    updateFormData({
      achievements: {
        ...formData.achievements,
        keyAccomplishments: newAccomplishments
      }
    })
  }

  // New: responsibilities helpers to match performance plan UI
  const addResponsibility = () => {
    updateFormData({
      achievements: {
        ...formData.achievements,
        keyResponsibilities: [
          ...formData.achievements.keyResponsibilities,
          {
            id: `resp-${Date.now()}`,
            description: '',
            tasks: '',
            weight: 0,
            targetDate: '',
            status: 'Not Started',
            achievementStatus: 'not-achieved',
            comment: '',
            successIndicators: [
              { id: `ind-${Date.now()}`, indicator: '', target: '', actualValue: '', measurement: '', achieved: false }
            ]
          }
        ]
      }
    })
  }

  const removeResponsibility = (respId: string) => {
    updateFormData({
      achievements: {
        ...formData.achievements,
        keyResponsibilities: formData.achievements.keyResponsibilities.filter(r => r.id !== respId)
      }
    })
  }

  const addIndicator = (respId: string) => {
    const updated = formData.achievements.keyResponsibilities.map(r => {
      if (r.id !== respId) return r
      const newInd = { id: `ind-${Date.now()}`, indicator: '', target: '', actualValue: '', measurement: '', achieved: false }
      return { ...r, successIndicators: [...r.successIndicators, newInd] }
    })
    updateFormData({ achievements: { ...formData.achievements, keyResponsibilities: updated } })
  }

  // Note: Data loading is handled by parent component, not here
  // This matches the Performance Plan approach

  const removeIndicator = (respId: string, indicatorId: string) => {
    const updated = formData.achievements.keyResponsibilities.map(r => {
      if (r.id !== respId) return r
      return { ...r, successIndicators: r.successIndicators.filter(ind => ind.id !== indicatorId) }
    })
    updateFormData({ achievements: { ...formData.achievements, keyResponsibilities: updated } })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">Key Responsibilities</CardTitle>
            <Button type="button" onClick={addResponsibility}>Add Responsibility</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {formData.achievements.keyResponsibilities.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Loading key responsibilities from your job description...</p>
              <p className="text-sm mt-2">If none appear, click "Add Responsibility" to create manually.</p>
            </div>
          )}
          {formData.achievements.keyResponsibilities.map((responsibility, respIndex) => (
              <div key={responsibility.id} className="border-2 border-orange-100 rounded-lg p-5 space-y-4 bg-orange-50/30">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">
                        Responsibility #{respIndex + 1}
                      </h4>
                      <Badge className="bg-orange-100 text-orange-800 font-semibold">
                        Weight: {responsibility.weight}%
                      </Badge>
                    </div>
                  <Input
                    placeholder="Enter responsibility description..."
                    value={responsibility.description}
                    onChange={(e) => updateResponsibility(responsibility.id, 'description', e.target.value)}
                  />
                  </div>
                <Button type="button" variant="outline" onClick={() => removeResponsibility(responsibility.id)}>Remove</Button>
                </div>

                {/* Tasks/Activities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🟢 Tasks / Activities
                  </label>
                <Textarea
                  placeholder="List specific tasks and activities for this responsibility..."
                  value={responsibility.tasks}
                  onChange={(e) => updateResponsibility(responsibility.id, 'tasks', e.target.value)}
                  className="w-full border-gray-300"
                  rows={2}
                />
                </div>

              {/* Weight, Target Date, Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weight (%)</label>
                  <Input type="number" value={responsibility.weight} onChange={(e) => updateResponsibility(responsibility.id, 'weight', Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Date</label>
                  <Input type="date" value={responsibility.targetDate || ''} onChange={(e) => updateResponsibility(responsibility.id, 'targetDate', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <Select value={responsibility.status || 'Not Started'} onValueChange={(v) => updateResponsibility(responsibility.id, 'status', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Not Started">Not Started</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

                {/* Success Indicators */}
              <div className="rounded-md border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Success Indicators for this Responsibility</span>
                  <Button type="button" size="sm" onClick={() => addIndicator(responsibility.id)}>Add Indicator</Button>
                </div>
                {responsibility.successIndicators && responsibility.successIndicators.length > 0 ? (
                  responsibility.successIndicators.map((indicator, indIndex) => (
                    <div key={indicator.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                      <div>
                        <label className="block text-xs font-medium mb-1">Indicator Name</label>
                        <Input value={indicator.indicator} onChange={(e) => updateSuccessIndicator(responsibility.id, indicator.id, 'indicator', e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Target Value</label>
                        <Input value={indicator.target} onChange={(e) => updateSuccessIndicator(responsibility.id, indicator.id, 'target', e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Actual / Achieved Value</label>
                        <Input value={indicator.actualValue} onChange={(e) => updateSuccessIndicator(responsibility.id, indicator.id, 'actualValue', e.target.value)} />
                      </div>
                      <div className="grid grid-cols-5 gap-2">
                        <div className="col-span-4">
                          <label className="block text-xs font-medium mb-1">Measurement Method</label>
                          <Input value={indicator.measurement} onChange={(e) => updateSuccessIndicator(responsibility.id, indicator.id, 'measurement', e.target.value)} />
                        </div>
                        <Button type="button" variant="outline" onClick={() => removeIndicator(responsibility.id, indicator.id)}>Remove</Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No success indicators yet. Click "Add Indicator" to create one.</p>
                )}
              </div>

                {/* Additional Comments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Comments</label>
                <Textarea
                  placeholder="Any additional comments or notes..."
                  value={responsibility.comment}
                  onChange={(e) => updateResponsibility(responsibility.id, 'comment', e.target.value)}
                  rows={3}
                  className="w-full border-gray-300"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
