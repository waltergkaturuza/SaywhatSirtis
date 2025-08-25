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

  return (
    <div className="space-y-6">
      {/* Goals Review */}
      <Card>
        <CardHeader>
          <CardTitle>Goals Achievement Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.achievements.goals.map((goal) => (
            <div key={goal.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <Input
                  placeholder="Goal description..."
                  value={goal.description}
                  onChange={(e) => updateGoal(goal.id, 'description', e.target.value)}
                  className="flex-1 mr-3"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => removeGoal(goal.id)}
                >
                  Remove
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Select
                    value={goal.status}
                    onValueChange={(value) => updateGoal(goal.id, 'status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {goalStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full bg-${status.color}-500`}></div>
                            <span>{status.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Badge className={`self-start ${
                  goal.status === 'achieved' ? 'bg-green-100 text-green-800' :
                  goal.status === 'partially-achieved' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {goalStatuses.find(s => s.value === goal.status)?.label}
                </Badge>
              </div>
              
              <Textarea
                placeholder="Comments on goal achievement..."
                value={goal.comment}
                onChange={(e) => updateGoal(goal.id, 'comment', e.target.value)}
                rows={2}
              />
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={addGoal}
            className="w-full"
          >
            Add Goal
          </Button>
        </CardContent>
      </Card>

      {/* Key Accomplishments */}
      <Card>
        <CardHeader>
          <CardTitle>Key Accomplishments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.achievements.keyAccomplishments.map((accomplishment, index) => (
            <div key={index} className="flex gap-2">
              <Textarea
                placeholder="Describe a key accomplishment..."
                value={accomplishment}
                onChange={(e) => updateAccomplishment(index, e.target.value)}
                className="flex-1"
                rows={2}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => removeAccomplishment(index)}
                className="mt-2"
              >
                Remove
              </Button>
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={addAccomplishment}
            className="w-full"
          >
            Add Accomplishment
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
