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
      <Card className="border-2 border-gray-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b-2 border-orange-200">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
            <svg className="w-6 h-6 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Career Aspirations
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Textarea
            placeholder="Document the employee's career development progress during this review period. Include specific achievements, skills gained, leadership growth, training completed, and concrete steps taken toward their career goals. Highlight measurable progress and future development opportunities..."
            value={formData.development.careerAspirations}
            onChange={(e) => updateFormData({
              development: {
                ...formData.development,
                careerAspirations: e.target.value
              }
            })}
            rows={6}
            className="border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-lg"
          />
        </CardContent>
      </Card>

      {/* Training & Development Needs */}
      <Card className="border-2 border-gray-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b-2 border-green-200">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
            <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Training & Development Needs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {formData.development.trainingNeeds.map((need, index) => (
            <div key={index} className="flex gap-3 items-center">
              <Input
                placeholder="Training or development need..."
                value={need}
                onChange={(e) => updateTrainingNeed(index, e.target.value)}
                className="flex-1 border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => removeTrainingNeed(index)}
                className="border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-500 font-semibold rounded-lg transition-all duration-200"
              >
                Remove
              </Button>
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={addTrainingNeed}
            className="w-full border-2 border-green-400 text-green-700 hover:bg-green-50 hover:border-green-500 font-semibold py-3 rounded-lg transition-all duration-200"
          >
            <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Training Need
          </Button>
        </CardContent>
      </Card>

      {/* Skills to Improve */}
      <Card className="border-2 border-gray-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            Skills to Improve
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {formData.development.skillsToImprove.map((skill, index) => (
            <div key={index} className="flex gap-3 items-center">
              <Input
                placeholder="Skill to improve or develop..."
                value={skill}
                onChange={(e) => updateSkillToImprove(index, e.target.value)}
                className="flex-1 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => removeSkillToImprove(index)}
                className="border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-500 font-semibold rounded-lg transition-all duration-200"
              >
                Remove
              </Button>
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={addSkillToImprove}
            className="w-full border-2 border-blue-400 text-blue-700 hover:bg-blue-50 hover:border-blue-500 font-semibold py-3 rounded-lg transition-all duration-200"
          >
            <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Skill to Improve
          </Button>
        </CardContent>
      </Card>

      {/* Development Plans */}
      <Card className="border-2 border-gray-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b-2 border-purple-200">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
            <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Development Action Plans
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
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
