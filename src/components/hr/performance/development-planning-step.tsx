'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AppraisalFormData } from './appraisal-types'

interface DevelopmentPlanningStepProps {
  formData: AppraisalFormData
  updateFormData: (updates: Partial<AppraisalFormData>) => void
}

export function DevelopmentPlanningStep({ formData, updateFormData }: DevelopmentPlanningStepProps) {
  const addTrainingNeed = () => {
    updateFormData({
      development: {
        ...formData.development,
        trainingNeeds: [...formData.development.trainingNeeds, '']
      }
    })
  }

  const updateTrainingNeed = (index: number, value: string) => {
    const newNeeds = [...formData.development.trainingNeeds]
    newNeeds[index] = value
    updateFormData({
      development: {
        ...formData.development,
        trainingNeeds: newNeeds
      }
    })
  }

  const removeTrainingNeed = (index: number) => {
    const newNeeds = formData.development.trainingNeeds.filter((_, i) => i !== index)
    updateFormData({
      development: {
        ...formData.development,
        trainingNeeds: newNeeds
      }
    })
  }

  const addSkillToImprove = () => {
    updateFormData({
      development: {
        ...formData.development,
        skillsToImprove: [...formData.development.skillsToImprove, '']
      }
    })
  }

  const updateSkillToImprove = (index: number, value: string) => {
    const newSkills = [...formData.development.skillsToImprove]
    newSkills[index] = value
    updateFormData({
      development: {
        ...formData.development,
        skillsToImprove: newSkills
      }
    })
  }

  const removeSkillToImprove = (index: number) => {
    const newSkills = formData.development.skillsToImprove.filter((_, i) => i !== index)
    updateFormData({
      development: {
        ...formData.development,
        skillsToImprove: newSkills
      }
    })
  }

  const addDevelopmentPlan = () => {
    updateFormData({
      development: {
        ...formData.development,
        developmentPlan: [...formData.development.developmentPlan, {
          objective: '',
          actions: [''],
          timeline: '',
          resources: ['']
        }]
      }
    })
  }

  const updateDevelopmentPlan = (index: number, field: string, value: string | string[]) => {
    const newPlans = [...formData.development.developmentPlan]
    newPlans[index] = { ...newPlans[index], [field]: value }
    updateFormData({
      development: {
        ...formData.development,
        developmentPlan: newPlans
      }
    })
  }

  const removeDevelopmentPlan = (index: number) => {
    const newPlans = formData.development.developmentPlan.filter((_, i) => i !== index)
    updateFormData({
      development: {
        ...formData.development,
        developmentPlan: newPlans
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Career Aspirations */}
      <Card>
        <CardHeader>
          <CardTitle>Career Aspirations</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Describe career goals and aspirations..."
            value={formData.development.careerAspirations}
            onChange={(e) => updateFormData({
              development: {
                ...formData.development,
                careerAspirations: e.target.value
              }
            })}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Training & Development Needs */}
      <Card>
        <CardHeader>
          <CardTitle>Training & Development Needs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.development.trainingNeeds.map((need, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="Training or development need..."
                value={need}
                onChange={(e) => updateTrainingNeed(index, e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => removeTrainingNeed(index)}
              >
                Remove
              </Button>
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={addTrainingNeed}
            className="w-full"
          >
            Add Training Need
          </Button>
        </CardContent>
      </Card>

      {/* Skills to Improve */}
      <Card>
        <CardHeader>
          <CardTitle>Skills to Improve</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.development.skillsToImprove.map((skill, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="Skill to improve or develop..."
                value={skill}
                onChange={(e) => updateSkillToImprove(index, e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => removeSkillToImprove(index)}
              >
                Remove
              </Button>
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={addSkillToImprove}
            className="w-full"
          >
            Add Skill to Improve
          </Button>
        </CardContent>
      </Card>

      {/* Development Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Development Action Plans</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {formData.development.developmentPlan.map((plan, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">Development Plan {index + 1}</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeDevelopmentPlan(index)}
                >
                  Remove Plan
                </Button>
              </div>
              
              <div>
                <Input
                  placeholder="Development objective..."
                  value={plan.objective}
                  onChange={(e) => updateDevelopmentPlan(index, 'objective', e.target.value)}
                />
              </div>
              
              <div>
                <Input
                  placeholder="Timeline (e.g., 6 months, Q1 2024)..."
                  value={plan.timeline}
                  onChange={(e) => updateDevelopmentPlan(index, 'timeline', e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium mb-2">Actions Required</h5>
                  {plan.actions.map((action, actionIndex) => (
                    <div key={actionIndex} className="flex gap-2 mb-2">
                      <Input
                        placeholder="Action item..."
                        value={action}
                        onChange={(e) => {
                          const newActions = [...plan.actions]
                          newActions[actionIndex] = e.target.value
                          updateDevelopmentPlan(index, 'actions', newActions)
                        }}
                        className="flex-1"
                      />
                      {plan.actions.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newActions = plan.actions.filter((_, i) => i !== actionIndex)
                            updateDevelopmentPlan(index, 'actions', newActions)
                          }}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newActions = [...plan.actions, '']
                      updateDevelopmentPlan(index, 'actions', newActions)
                    }}
                  >
                    Add Action
                  </Button>
                </div>
                
                <div>
                  <h5 className="font-medium mb-2">Resources Needed</h5>
                  {plan.resources.map((resource, resourceIndex) => (
                    <div key={resourceIndex} className="flex gap-2 mb-2">
                      <Input
                        placeholder="Resource needed..."
                        value={resource}
                        onChange={(e) => {
                          const newResources = [...plan.resources]
                          newResources[resourceIndex] = e.target.value
                          updateDevelopmentPlan(index, 'resources', newResources)
                        }}
                        className="flex-1"
                      />
                      {plan.resources.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newResources = plan.resources.filter((_, i) => i !== resourceIndex)
                            updateDevelopmentPlan(index, 'resources', newResources)
                          }}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newResources = [...plan.resources, '']
                      updateDevelopmentPlan(index, 'resources', newResources)
                    }}
                  >
                    Add Resource
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={addDevelopmentPlan}
            className="w-full"
          >
            Add Development Plan
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
