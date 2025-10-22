"use client"

import { useState } from "react"
import { 
  PlusIcon, 
  TrashIcon, 
  ChevronDownIcon, 
  ChevronRightIcon,
  DocumentTextIcon,
  ChartBarIcon,
  FlagIcon
} from "@heroicons/react/24/outline"

// Types for the Results Framework
export interface Indicator {
  description: string
  baseline: string
  baselineUnit: string
  targets: Record<string, string> // Year 1, Year 2, etc.
  targetUnit: string
  monitoringMethod: string
  dataCollection: {
    frequency: string
    source: string
    disaggregation: string
  }
  comment: string
}

export interface Output {
  id: string
  title: string
  description: string
  indicators: Indicator[]
  isExpanded: boolean
}

export interface Outcome {
  id: string
  title: string
  description: string
  indicators: Indicator[]
  outputs: Output[]
  isExpanded: boolean
}

export interface Objective {
  id: string
  title: string
  description: string
  outcomes: Outcome[]
  isExpanded: boolean
}

export interface ResultsFrameworkData {
  objectives: Objective[]
  projectDuration: number // in years
}

interface ResultsFrameworkProps {
  data: ResultsFrameworkData
  onChange: (data: ResultsFrameworkData) => void
  readonly?: boolean
}

const frequencies = [
  "Monthly", "Quarterly", "Semi-annually", "Annually", "Bi-annually", "As needed"
]

const disaggregationOptions = [
  "Age", "Gender", "Location", "Disability", "Education level", "Income level", "None"
]

export function ResultsFramework({ data, onChange, readonly = false }: ResultsFrameworkProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  const createEmptyIndicator = (): Indicator => ({
    description: "",
    baseline: "",
    targets: {},
    monitoringMethod: "",
    dataCollection: {
      frequency: "",
      source: "",
      disaggregation: ""
    },
    comment: ""
  })

  const createEmptyOutput = (): Output => ({
    id: `output_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: "",
    description: "",
    indicators: [],
    isExpanded: false
  })

  const createEmptyOutcome = (): Outcome => ({
    id: `outcome_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: "",
    description: "",
    indicators: [],
    outputs: [],
    isExpanded: false
  })

  const createEmptyObjective = (): Objective => ({
    id: `objective_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: "",
    description: "",
    outcomes: [],
    isExpanded: false
  })

  const updateData = (newData: ResultsFrameworkData) => {
    onChange(newData)
  }

  const addObjective = () => {
    if (data.objectives.length >= 10) return
    
    const newObjective = createEmptyObjective()
    updateData({
      ...data,
      objectives: [...data.objectives, newObjective]
    })
  }

  const removeObjective = (objectiveId: string) => {
    updateData({
      ...data,
      objectives: data.objectives.filter(obj => obj.id !== objectiveId)
    })
  }

  const updateObjective = (objectiveId: string, updates: Partial<Objective>) => {
    updateData({
      ...data,
      objectives: data.objectives.map(obj => 
        obj.id === objectiveId ? { ...obj, ...updates } : obj
      )
    })
  }

  const addOutcome = (objectiveId: string) => {
    const objective = data.objectives.find(obj => obj.id === objectiveId)
    if (!objective || objective.outcomes.length >= 10) return

    const newOutcome = createEmptyOutcome()
    updateObjective(objectiveId, {
      outcomes: [...objective.outcomes, newOutcome]
    })
  }

  const removeOutcome = (objectiveId: string, outcomeId: string) => {
    const objective = data.objectives.find(obj => obj.id === objectiveId)
    if (!objective) return

    updateObjective(objectiveId, {
      outcomes: objective.outcomes.filter(outcome => outcome.id !== outcomeId)
    })
  }

  const updateOutcome = (objectiveId: string, outcomeId: string, updates: Partial<Outcome>) => {
    const objective = data.objectives.find(obj => obj.id === objectiveId)
    if (!objective) return

    updateObjective(objectiveId, {
      outcomes: objective.outcomes.map(outcome => 
        outcome.id === outcomeId ? { ...outcome, ...updates } : outcome
      )
    })
  }

  const addOutput = (objectiveId: string, outcomeId: string) => {
    const objective = data.objectives.find(obj => obj.id === objectiveId)
    const outcome = objective?.outcomes.find(out => out.id === outcomeId)
    if (!outcome || outcome.outputs.length >= 10) return

    const newOutput = createEmptyOutput()
    updateOutcome(objectiveId, outcomeId, {
      outputs: [...outcome.outputs, newOutput]
    })
  }

  const removeOutput = (objectiveId: string, outcomeId: string, outputId: string) => {
    const objective = data.objectives.find(obj => obj.id === objectiveId)
    const outcome = objective?.outcomes.find(out => out.id === outcomeId)
    if (!outcome) return

    updateOutcome(objectiveId, outcomeId, {
      outputs: outcome.outputs.filter(output => output.id !== outputId)
    })
  }

  const updateOutput = (objectiveId: string, outcomeId: string, outputId: string, updates: Partial<Output>) => {
    const objective = data.objectives.find(obj => obj.id === objectiveId)
    const outcome = objective?.outcomes.find(out => out.id === outcomeId)
    if (!outcome) return

    updateOutcome(objectiveId, outcomeId, {
      outputs: outcome.outputs.map(output => 
        output.id === outputId ? { ...output, ...updates } : output
      )
    })
  }

  // Create default indicator
  const createEmptyIndicator = (): Indicator => ({
    description: '',
    baseline: '',
    baselineUnit: '',
    targets: {},
    targetUnit: '',
    monitoringMethod: '',
    dataCollection: {
      frequency: 'monthly',
      source: '',
      disaggregation: ''
    },
    comment: ''
  })

  // Add indicator to outcome
  const addIndicatorToOutcome = (objectiveId: string, outcomeId: string) => {
    const objective = data.objectives.find(obj => obj.id === objectiveId)
    const outcome = objective?.outcomes.find(out => out.id === outcomeId)
    if (!outcome) return

    const newIndicator = createEmptyIndicator()
    updateOutcome(objectiveId, outcomeId, {
      indicators: [...(outcome.indicators || []), newIndicator]
    })
  }

  // Remove indicator from outcome
  const removeIndicatorFromOutcome = (objectiveId: string, outcomeId: string, indicatorIndex: number) => {
    const objective = data.objectives.find(obj => obj.id === objectiveId)
    const outcome = objective?.outcomes.find(out => out.id === outcomeId)
    if (!outcome) return

    const newIndicators = [...(outcome.indicators || [])]
    newIndicators.splice(indicatorIndex, 1)
    updateOutcome(objectiveId, outcomeId, {
      indicators: newIndicators
    })
  }

  // Update indicator in outcome
  const updateIndicatorInOutcome = (objectiveId: string, outcomeId: string, indicatorIndex: number, field: string, value: any) => {
    const objective = data.objectives.find(obj => obj.id === objectiveId)
    const outcome = objective?.outcomes.find(out => out.id === outcomeId)
    if (!outcome) return

    const newIndicators = [...(outcome.indicators || [])]
    const indicator = { ...newIndicators[indicatorIndex] }
    
    if (field.startsWith('dataCollection.')) {
      const dcField = field.split('.')[1]
      indicator.dataCollection = { ...indicator.dataCollection, [dcField]: value }
    } else if (field.startsWith('targets.')) {
      const year = field.split('.')[1]
      indicator.targets = { ...indicator.targets, [year]: value }
    } else {
      indicator[field as keyof Indicator] = value
    }

    newIndicators[indicatorIndex] = indicator
    updateOutcome(objectiveId, outcomeId, {
      indicators: newIndicators
    })
  }

  // Add indicator to output
  const addIndicatorToOutput = (objectiveId: string, outcomeId: string, outputId: string) => {
    const objective = data.objectives.find(obj => obj.id === objectiveId)
    const outcome = objective?.outcomes.find(out => out.id === outcomeId)
    const output = outcome?.outputs.find(out => out.id === outputId)
    if (!output) return

    const newIndicator = createEmptyIndicator()
    updateOutput(objectiveId, outcomeId, outputId, {
      indicators: [...(output.indicators || []), newIndicator]
    })
  }

  // Remove indicator from output
  const removeIndicatorFromOutput = (objectiveId: string, outcomeId: string, outputId: string, indicatorIndex: number) => {
    const objective = data.objectives.find(obj => obj.id === objectiveId)
    const outcome = objective?.outcomes.find(out => out.id === outcomeId)
    const output = outcome?.outputs.find(out => out.id === outputId)
    if (!output) return

    const newIndicators = [...(output.indicators || [])]
    newIndicators.splice(indicatorIndex, 1)
    updateOutput(objectiveId, outcomeId, outputId, {
      indicators: newIndicators
    })
  }

  // Update indicator in output
  const updateIndicatorInOutput = (objectiveId: string, outcomeId: string, outputId: string, indicatorIndex: number, field: string, value: any) => {
    const objective = data.objectives.find(obj => obj.id === objectiveId)
    const outcome = objective?.outcomes.find(out => out.id === outcomeId)
    const output = outcome?.outputs.find(out => out.id === outputId)
    if (!output) return

    const newIndicators = [...(output.indicators || [])]
    const indicator = { ...newIndicators[indicatorIndex] }
    
    if (field.startsWith('dataCollection.')) {
      const dcField = field.split('.')[1]
      indicator.dataCollection = { ...indicator.dataCollection, [dcField]: value }
    } else if (field.startsWith('targets.')) {
      const year = field.split('.')[1]
      indicator.targets = { ...indicator.targets, [year]: value }
    } else {
      indicator[field as keyof Indicator] = value
    }

    newIndicators[indicatorIndex] = indicator
    updateOutput(objectiveId, outcomeId, outputId, {
      indicators: newIndicators
    })
  }

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedSections(newExpanded)
  }

  const renderTargetInputs = (indicator: Indicator, updateFn: (field: string, value: string) => void) => {
    const years = Array.from({ length: data.projectDuration || 5 }, (_, i) => `Year ${i + 1}`)
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {years.map(year => (
          <div key={year}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target {year}
            </label>
            <input
              type="text"
              value={indicator.targets[year] || ""}
              onChange={(e) => updateFn(`targets.${year}`, e.target.value)}
              disabled={readonly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
              placeholder={`${year} target`}
            />
          </div>
        ))}
      </div>
    )
  }

  const renderIndicatorForm = (
    indicator: Indicator, 
    updateFn: (field: string, value: string) => void,
    title: string
  ) => (
    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
      <h5 className="font-medium text-gray-900">{title} Indicator</h5>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Indicator Description *
        </label>
        <textarea
          value={indicator.description}
          onChange={(e) => updateFn('description', e.target.value)}
          disabled={readonly}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
          placeholder="Describe the specific, measurable indicator..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Baseline
          </label>
          <input
            type="text"
            value={indicator.baseline}
            onChange={(e) => updateFn('baseline', e.target.value)}
            disabled={readonly}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
            placeholder="Current status/value"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Baseline Unit
          </label>
          <input
            type="text"
            value={indicator.baselineUnit || ""}
            onChange={(e) => updateFn('baselineUnit', e.target.value)}
            disabled={readonly}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
            placeholder="e.g., people, %, number, etc."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Method for Result Monitoring
          </label>
          <input
            type="text"
            value={indicator.monitoringMethod}
            onChange={(e) => updateFn('monitoringMethod', e.target.value)}
            disabled={readonly}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
            placeholder="How will this be measured?"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Targets by Year</label>
        {renderTargetInputs(indicator, updateFn)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Unit
          </label>
          <input
            type="text"
            value={indicator.targetUnit || ""}
            onChange={(e) => updateFn('targetUnit', e.target.value)}
            disabled={readonly}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
            placeholder="e.g., people, %, number, etc."
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <h6 className="font-medium text-gray-900 mb-3">Data Collection</h6>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frequency
            </label>
            <select
              value={indicator.dataCollection.frequency}
              onChange={(e) => updateFn('dataCollection.frequency', e.target.value)}
              disabled={readonly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
            >
              <option value="">Select frequency</option>
              {frequencies.map(freq => (
                <option key={freq} value={freq}>{freq}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Source
            </label>
            <input
              type="text"
              value={indicator.dataCollection.source}
              onChange={(e) => updateFn('dataCollection.source', e.target.value)}
              disabled={readonly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
              placeholder="Where data comes from"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Disaggregation
            </label>
            <select
              value={indicator.dataCollection.disaggregation}
              onChange={(e) => updateFn('dataCollection.disaggregation', e.target.value)}
              disabled={readonly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
            >
              <option value="">Select disaggregation</option>
              {disaggregationOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Comments
        </label>
        <textarea
          value={indicator.comment}
          onChange={(e) => updateFn('comment', e.target.value)}
          disabled={readonly}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
          placeholder="Additional notes or comments..."
        />
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Results Framework</h3>
          <p className="text-sm text-gray-600 mt-1">
            Define objectives, outcomes, and outputs with comprehensive monitoring indicators
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Duration (Years)
            </label>
            <select
              value={data.projectDuration || 5}
              onChange={(e) => updateData({ ...data, projectDuration: parseInt(e.target.value) })}
              disabled={readonly}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
            >
              {[1, 2, 3, 4, 5].map(year => (
                <option key={year} value={year}>{year} Year{year > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
          
          {!readonly && (
            <button
              onClick={addObjective}
              disabled={data.objectives.length >= 10}
              className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Objective
            </button>
          )}
        </div>
      </div>

      {data.objectives.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <ChartBarIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Objectives Yet</h4>
          <p className="text-gray-600 mb-4">Start building your results framework by adding an objective.</p>
          {!readonly && (
            <button
              onClick={addObjective}
              className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add First Objective
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {data.objectives.map((objective, objIndex) => (
            <div key={objective.id} className="border border-gray-200 rounded-lg">
              <div className="bg-blue-50 px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleExpanded(objective.id)}
                      className="p-1 hover:bg-blue-100 rounded"
                    >
                      {expandedSections.has(objective.id) ? (
                        <ChevronDownIcon className="h-5 w-5 text-blue-600" />
                      ) : (
                        <ChevronRightIcon className="h-5 w-5 text-blue-600" />
                      )}
                    </button>
                    <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">
                      Objective {objIndex + 1}
                      {objective.title && `: ${objective.title}`}
                    </span>
                  </div>
                  
                  {!readonly && (
                    <button
                      onClick={() => removeObjective(objective.id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {expandedSections.has(objective.id) && (
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Objective Title *
                      </label>
                      <input
                        type="text"
                        value={objective.title}
                        onChange={(e) => updateObjective(objective.id, { title: e.target.value })}
                        disabled={readonly}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                        placeholder="Enter objective title"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={objective.description}
                        onChange={(e) => updateObjective(objective.id, { description: e.target.value })}
                        disabled={readonly}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                        placeholder="Describe the objective"
                      />
                    </div>
                  </div>

                  {/* Outcomes Section */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Outcomes</h4>
                      {!readonly && (
                        <button
                          onClick={() => addOutcome(objective.id)}
                          disabled={objective.outcomes.length >= 10}
                          className="flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300"
                        >
                          <PlusIcon className="h-4 w-4 mr-1" />
                          Add Outcome
                        </button>
                      )}
                    </div>

                    {objective.outcomes.map((outcome, outcomeIndex) => (
                      <div key={outcome.id} className="mb-6 border border-green-200 rounded-lg">
                        <div className="bg-green-50 px-4 py-3 border-b border-green-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => toggleExpanded(outcome.id)}
                                className="p-1 hover:bg-green-100 rounded"
                              >
                                {expandedSections.has(outcome.id) ? (
                                  <ChevronDownIcon className="h-4 w-4 text-green-600" />
                                ) : (
                                  <ChevronRightIcon className="h-4 w-4 text-green-600" />
                                )}
                              </button>
                              <FlagIcon className="h-4 w-4 text-green-600" />
                              <span className="font-medium text-green-900">
                                Outcome {outcomeIndex + 1}
                                {outcome.title && `: ${outcome.title}`}
                              </span>
                            </div>
                            
                            {!readonly && (
                              <button
                                onClick={() => removeOutcome(objective.id, outcome.id)}
                                className="p-1 text-red-600 hover:bg-red-100 rounded"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {expandedSections.has(outcome.id) && (
                          <div className="p-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Outcome Title *
                                </label>
                                <input
                                  type="text"
                                  value={outcome.title}
                                  onChange={(e) => updateOutcome(objective.id, outcome.id, { title: e.target.value })}
                                  disabled={readonly}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                                  placeholder="Enter outcome title"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Description
                                </label>
                                <textarea
                                  value={outcome.description}
                                  onChange={(e) => updateOutcome(objective.id, outcome.id, { description: e.target.value })}
                                  disabled={readonly}
                                  rows={2}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                                  placeholder="Describe the outcome"
                                />
                              </div>
                            </div>

                            {/* Outcome Indicators */}
                            <div className="border-t pt-4">
                              <div className="flex items-center justify-between mb-4">
                                <h5 className="font-medium text-gray-900">Outcome Indicators</h5>
                                {!readonly && (
                                  <button
                                    onClick={() => addIndicatorToOutcome(objective.id, outcome.id)}
                                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                                  >
                                    <PlusIcon className="h-4 w-4 mr-1" />
                                    Add Indicator
                                  </button>
                                )}
                              </div>
                              
                              {outcome.indicators && outcome.indicators.length > 0 ? (
                                <div className="space-y-4">
                                  {outcome.indicators.map((indicator, indicatorIndex) => (
                                    <div key={indicatorIndex} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                      <div className="flex items-center justify-between mb-4">
                                        <h6 className="font-medium text-gray-900">Indicator {indicatorIndex + 1}</h6>
                                        {!readonly && (
                                          <button
                                            onClick={() => removeIndicatorFromOutcome(objective.id, outcome.id, indicatorIndex)}
                                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                                          >
                                            <TrashIcon className="h-4 w-4" />
                                          </button>
                                        )}
                                      </div>
                                      
                                      {renderIndicatorForm(
                                        indicator,
                                        (field, value) => updateIndicatorInOutcome(objective.id, outcome.id, indicatorIndex, field, value),
                                        "Outcome"
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-4 text-gray-500">
                                  <ChartBarIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                  <p className="text-sm">No indicators defined yet. Click "Add Indicator" to get started.</p>
                                </div>
                              )}
                            </div>

                            {/* Outputs Section */}
                            <div className="border-t pt-4">
                              <div className="flex items-center justify-between mb-4">
                                <h5 className="font-medium text-gray-900">Outputs</h5>
                                {!readonly && (
                                  <button
                                    onClick={() => addOutput(objective.id, outcome.id)}
                                    disabled={outcome.outputs.length >= 10}
                                    className="flex items-center px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-300"
                                  >
                                    <PlusIcon className="h-4 w-4 mr-1" />
                                    Add Output
                                  </button>
                                )}
                              </div>

                              {outcome.outputs.map((output, outputIndex) => (
                                <div key={output.id} className="mb-4 border border-purple-200 rounded-lg">
                                  <div className="bg-purple-50 px-4 py-3 border-b border-purple-200">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-3">
                                        <button
                                          onClick={() => toggleExpanded(output.id)}
                                          className="p-1 hover:bg-purple-100 rounded"
                                        >
                                          {expandedSections.has(output.id) ? (
                                            <ChevronDownIcon className="h-4 w-4 text-purple-600" />
                                          ) : (
                                            <ChevronRightIcon className="h-4 w-4 text-purple-600" />
                                          )}
                                        </button>
                                        <ChartBarIcon className="h-4 w-4 text-purple-600" />
                                        <span className="font-medium text-purple-900">
                                          Output {outputIndex + 1}
                                          {output.title && `: ${output.title}`}
                                        </span>
                                      </div>
                                      
                                      {!readonly && (
                                        <button
                                          onClick={() => removeOutput(objective.id, outcome.id, output.id)}
                                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                                        >
                                          <TrashIcon className="h-4 w-4" />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {expandedSections.has(output.id) && (
                                    <div className="p-4 space-y-4">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Output Title *
                                          </label>
                                          <input
                                            type="text"
                                            value={output.title}
                                            onChange={(e) => updateOutput(objective.id, outcome.id, output.id, { title: e.target.value })}
                                            disabled={readonly}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                                            placeholder="Enter output title"
                                          />
                                        </div>
                                        
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description
                                          </label>
                                          <textarea
                                            value={output.description}
                                            onChange={(e) => updateOutput(objective.id, outcome.id, output.id, { description: e.target.value })}
                                            disabled={readonly}
                                            rows={2}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                                            placeholder="Describe the output"
                                          />
                                        </div>
                                      </div>

                                      {/* Output Indicators */}
                                      <div className="border-t pt-4">
                                        <div className="flex items-center justify-between mb-4">
                                          <h6 className="font-medium text-gray-900">Output Indicators</h6>
                                          {!readonly && (
                                            <button
                                              onClick={() => addIndicatorToOutput(objective.id, outcome.id, output.id)}
                                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                            >
                                              <PlusIcon className="h-4 w-4 mr-1" />
                                              Add Indicator
                                            </button>
                                          )}
                                        </div>
                                        
                                        {output.indicators && output.indicators.length > 0 ? (
                                          <div className="space-y-4">
                                            {output.indicators.map((indicator, indicatorIndex) => (
                                              <div key={indicatorIndex} className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                                                <div className="flex items-center justify-between mb-4">
                                                  <h6 className="font-medium text-gray-900">Indicator {indicatorIndex + 1}</h6>
                                                  {!readonly && (
                                                    <button
                                                      onClick={() => removeIndicatorFromOutput(objective.id, outcome.id, output.id, indicatorIndex)}
                                                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                                                    >
                                                      <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                  )}
                                                </div>
                                                
                                                {renderIndicatorForm(
                                                  indicator,
                                                  (field, value) => updateIndicatorInOutput(objective.id, outcome.id, output.id, indicatorIndex, field, value),
                                                  "Output"
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          <div className="text-center py-4 text-gray-500">
                                            <ChartBarIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                            <p className="text-sm">No indicators defined yet. Click "Add Indicator" to get started.</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Framework Summary</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Objectives:</span>
            <span className="ml-2 font-medium">{data.objectives.length}/10</span>
          </div>
          <div>
            <span className="text-gray-600">Outcomes:</span>
            <span className="ml-2 font-medium">
              {data.objectives.reduce((sum, obj) => sum + obj.outcomes.length, 0)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Outputs:</span>
            <span className="ml-2 font-medium">
              {data.objectives.reduce((sum, obj) => 
                sum + obj.outcomes.reduce((outSum, outcome) => outSum + outcome.outputs.length, 0), 0
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
