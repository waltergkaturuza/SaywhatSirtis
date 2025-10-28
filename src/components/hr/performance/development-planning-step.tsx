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

      {/* Training & Development Achievements */}
      <Card className="border-2 border-gray-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b-2 border-green-200">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
            <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Training & Development Achievements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {formData.development.trainingNeeds.map((need, index) => (
            <div key={index} className="flex gap-3 items-center">
              <Input
                placeholder="Training or development achievement..."
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
            Add Training Achievement
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

    </div>
  )
}
