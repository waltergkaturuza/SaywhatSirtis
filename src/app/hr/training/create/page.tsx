"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { EnhancedLayout } from "@/components/layout/enhanced-layout"
import { 
  AcademicCapIcon,
  UserGroupIcon,
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  BookOpenIcon,
  TrophyIcon
} from "@heroicons/react/24/outline"

export default function CreateTrainingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Basic Information
    title: "",
    description: "",
    category: "",
    level: "",
    duration: "",
    format: "",
    
    // Content & Curriculum
    objectives: [""],
    modules: [{ title: "", duration: "", description: "" }],
    prerequisites: "",
    materials: "",
    
    // Scheduling
    scheduleType: "",
    startDate: "",
    endDate: "",
    sessions: [{ date: "", startTime: "", endTime: "", location: "" }],
    
    // Resources
    trainer: "",
    location: "",
    maxParticipants: "",
    budget: "",
    resources: "",
    
    // Participants & Assessment
    targetAudience: "",
    departments: [],
    mandatory: false,
    assessmentRequired: false,
    certificateIssued: false,
    
    // Additional Settings
    registrationDeadline: "",
    approvalRequired: false,
    costPerParticipant: "",
    externalProvider: false,
    providerDetails: ""
  })

  const totalSteps = 5

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleArrayChange = (field: keyof typeof formData, index: number, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as any[]).map((item: any, i: number) => 
        i === index ? value : item
      )
    }))
  }

  const addArrayItem = (field: keyof typeof formData, template: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as any[]), template]
    }))
  }

  const removeArrayItem = (field: keyof typeof formData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as any[]).filter((_: any, i: number) => i !== index)
    }))
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      console.log("Creating training program:", formData)
      // await createTrainingProgram(formData)
      router.push("/hr/training")
    } catch (error) {
      console.error("Error creating training program:", error)
    }
  }

  const steps = [
    { id: 1, name: "Basic Info", icon: BookOpenIcon },
    { id: 2, name: "Content", icon: DocumentTextIcon },
    { id: 3, name: "Schedule", icon: CalendarIcon },
    { id: 4, name: "Resources", icon: UserGroupIcon },
    { id: 5, name: "Settings", icon: TrophyIcon }
  ]

  return (
    <EnhancedLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Training Program</h1>
          <p className="text-gray-600">Set up a new training program for your organization</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <nav aria-label="Progress">
            <ol className="flex items-center justify-between">
              {steps.map((step, stepIdx) => (
                <li key={step.id} className="relative flex-1">
                  <div className="flex items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                        currentStep >= step.id
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-gray-300 bg-white text-gray-400"
                      }`}
                    >
                      <step.icon className="h-5 w-5" />
                    </div>
                    {stepIdx !== steps.length - 1 && (
                      <div
                        className={`absolute top-5 left-10 w-full h-0.5 ${
                          currentStep > step.id ? "bg-indigo-600" : "bg-gray-300"
                        }`}
                      />
                    )}
                  </div>
                  <div className="mt-2">
                    <span
                      className={`text-sm font-medium ${
                        currentStep >= step.id ? "text-indigo-600" : "text-gray-500"
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* Form Content */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Training Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="e.g., Leadership Development Program"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={4}
                    placeholder="Provide a detailed description of the training program..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange("category", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="leadership">Leadership Development</option>
                      <option value="technical">Technical Skills</option>
                      <option value="soft-skills">Soft Skills</option>
                      <option value="compliance">Compliance & Safety</option>
                      <option value="onboarding">Onboarding</option>
                      <option value="professional">Professional Development</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Level *
                    </label>
                    <select
                      value={formData.level}
                      onChange={(e) => handleInputChange("level", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select Level</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration *
                    </label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => handleInputChange("duration", e.target.value)}
                      placeholder="e.g., 3 days, 2 weeks"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Training Format *
                  </label>
                  <select
                    value={formData.format}
                    onChange={(e) => handleInputChange("format", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select Format</option>
                    <option value="in-person">In-Person</option>
                    <option value="virtual">Virtual/Online</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="self-paced">Self-Paced</option>
                    <option value="workshop">Workshop</option>
                    <option value="seminar">Seminar</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: Content & Curriculum */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Content & Curriculum</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Learning Objectives
                  </label>
                  {formData.objectives.map((objective, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={objective}
                        onChange={(e) => handleArrayChange("objectives", index, e.target.value)}
                        placeholder={`Learning objective ${index + 1}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem("objectives", index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem("objectives", "")}
                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                  >
                    + Add Objective
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Training Modules
                  </label>
                  {formData.modules.map((module, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input
                          type="text"
                          value={module.title}
                          onChange={(e) => handleArrayChange("modules", index, { ...module, title: e.target.value })}
                          placeholder={`Module ${index + 1} title`}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <input
                          type="text"
                          value={module.duration}
                          onChange={(e) => handleArrayChange("modules", index, { ...module, duration: e.target.value })}
                          placeholder="Duration (e.g., 2 hours)"
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <textarea
                        value={module.description}
                        onChange={(e) => handleArrayChange("modules", index, { ...module, description: e.target.value })}
                        placeholder="Module description..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem("modules", index)}
                          className="mt-2 text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove Module
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem("modules", { title: "", duration: "", description: "" })}
                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                  >
                    + Add Module
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prerequisites
                    </label>
                    <textarea
                      value={formData.prerequisites}
                      onChange={(e) => handleInputChange("prerequisites", e.target.value)}
                      rows={3}
                      placeholder="List any prerequisites for this training..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Training Materials
                    </label>
                    <textarea
                      value={formData.materials}
                      onChange={(e) => handleInputChange("materials", e.target.value)}
                      rows={3}
                      placeholder="List required materials, handouts, etc..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8 border-t">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => router.push("/hr/training")}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                
                {currentStep === totalSteps ? (
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                  >
                    Create Training Program
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </EnhancedLayout>
  )
}
