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
        keyResponsibilities: [...formData.achievements.keyResponsibilities, {
          id: Date.now().toString(),
          description: '',
          tasks: '',
          weight: 0,
          targetDate: '',
          status: 'Not Started',
          achievementStatus: 'not-achieved',
          comment: '',
          successIndicators: [{
            id: '1',
            indicator: '',
            target: '',
            actualValue: '',
            measurement: '',
            achieved: false
          }]
        }]
      }
    })
  }

  const updateGoal = (goalId: string, field: string, value: string) => {
    const updatedGoals = formData.achievements.keyResponsibilities.map(goal =>
      goal.id === goalId ? { ...goal, [field]: value } : goal
    )
    
    updateFormData({
      achievements: {
        ...formData.achievements,
        keyResponsibilities: updatedGoals
      }
    })
  }

  const removeGoal = (goalId: string) => {
    const updatedGoals = formData.achievements.keyResponsibilities.filter(goal => goal.id !== goalId)
    updateFormData({
      achievements: {
        ...formData.achievements,
        keyResponsibilities: updatedGoals
      }
    })
  }

  // Removed deprecated keyAccomplishments functions - now using keyResponsibilities only

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
      <Card className="border-2 border-gray-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b-2 border-orange-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-900">Key Responsibilities</CardTitle>
            <Button 
              type="button" 
              onClick={addResponsibility}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-5 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Responsibility
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {formData.achievements.keyResponsibilities.length === 0 && (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-300 shadow-inner">
              <div className="text-gray-600 mb-6">
                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-xl font-bold text-gray-900 mb-3">No Key Responsibilities Found</p>
                <p className="text-sm text-gray-600 mb-2 max-w-md mx-auto">Key responsibilities from your job description will appear here automatically.</p>
                <p className="text-xs text-gray-500 max-w-md mx-auto">If you don't have a job description or want to add custom responsibilities, click the button below.</p>
              </div>
              <button
                onClick={addResponsibility}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Responsibility Manually
              </button>
            </div>
          )}
          {formData.achievements.keyResponsibilities.map((responsibility, respIndex) => (
              <div key={responsibility.id} className="border-2 border-orange-200 rounded-xl p-6 space-y-4 bg-gradient-to-br from-orange-50 to-white shadow-md hover:shadow-lg transition-shadow duration-200">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h4 className="text-lg font-bold text-gray-900">
                        Responsibility #{respIndex + 1}
                      </h4>
                      <Badge className="bg-orange-500 text-white font-bold px-3 py-1 shadow-sm">
                        Weight: {responsibility.weight}%
                      </Badge>
                    </div>
                  <Input
                    placeholder="Enter responsibility description..."
                    value={responsibility.description}
                    onChange={(e) => updateResponsibility(responsibility.id, 'description', e.target.value)}
                    className="border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-lg"
                  />
                  </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => removeResponsibility(responsibility.id)}
                  className="border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-500 font-semibold px-4 py-2 rounded-lg transition-all duration-200"
                >
                  Remove
                </Button>
                </div>

                {/* Tasks/Activities */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    <span className="inline-flex items-center">
                      <svg className="w-4 h-4 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <circle cx="10" cy="10" r="8" />
                      </svg>
                      Tasks / Activities
                    </span>
                  </label>
                <Textarea
                  placeholder="List specific tasks and activities for this responsibility..."
                  value={responsibility.tasks}
                  onChange={(e) => updateResponsibility(responsibility.id, 'tasks', e.target.value)}
                  className="w-full border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-lg"
                  rows={3}
                />
                </div>

              {/* Weight, Target Date, Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Weight (%)</label>
                  <Input 
                    type="number" 
                    value={responsibility.weight} 
                    onChange={(e) => updateResponsibility(responsibility.id, 'weight', Number(e.target.value))}
                    className="border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Target Date</label>
                  <Input 
                    type="date" 
                    value={responsibility.targetDate || ''} 
                    onChange={(e) => updateResponsibility(responsibility.id, 'targetDate', e.target.value)}
                    className="border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                  <Select value={responsibility.status || 'Not Started'} onValueChange={(v) => updateResponsibility(responsibility.id, 'status', v)}>
                    <SelectTrigger className="border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
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
              <div className="rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-white p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-gray-900 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Success Indicators for this Responsibility
                  </span>
                  <Button 
                    type="button" 
                    size="sm" 
                    onClick={() => addIndicator(responsibility.id)}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Indicator
                  </Button>
                </div>
                {responsibility.successIndicators && responsibility.successIndicators.length > 0 ? (
                  responsibility.successIndicators.map((indicator, indIndex) => (
                    <div key={indicator.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2">Indicator Name</label>
                        <Input 
                          value={indicator.indicator} 
                          onChange={(e) => updateSuccessIndicator(responsibility.id, indicator.id, 'indicator', e.target.value)}
                          className="border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2">Target Value</label>
                        <Input 
                          value={indicator.target} 
                          onChange={(e) => updateSuccessIndicator(responsibility.id, indicator.id, 'target', e.target.value)}
                          className="border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2">Actual / Achieved Value</label>
                        <Input 
                          value={indicator.actualValue} 
                          onChange={(e) => updateSuccessIndicator(responsibility.id, indicator.id, 'actualValue', e.target.value)}
                          className="border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg"
                        />
                      </div>
                      <div className="grid grid-cols-5 gap-2">
                        <div className="col-span-4">
                          <label className="block text-xs font-bold text-gray-700 mb-2">Measurement Method</label>
                          <Input 
                            value={indicator.measurement} 
                            onChange={(e) => updateSuccessIndicator(responsibility.id, indicator.id, 'measurement', e.target.value)}
                            className="border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg"
                          />
                        </div>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => removeIndicator(responsibility.id, indicator.id)}
                          className="border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-500 font-semibold rounded-lg transition-all duration-200"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic bg-white p-3 rounded-lg border border-dashed border-gray-300">No success indicators yet. Click "Add Indicator" to create one.</p>
                )}
              </div>

                {/* Additional Comments */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  Additional Comments
                </label>
                <Textarea
                  placeholder="Any additional comments or notes..."
                  value={responsibility.comment}
                  onChange={(e) => updateResponsibility(responsibility.id, 'comment', e.target.value)}
                  rows={3}
                  className="w-full border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-lg"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
