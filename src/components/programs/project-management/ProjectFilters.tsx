import React, { useState } from "react"
import { 
  FunnelIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  CalendarIcon,
  UserIcon,
  TagIcon,
  CurrencyDollarIcon
} from "@heroicons/react/24/outline"
import { ProjectFilters, Project } from "../project-management"

interface ProjectFiltersProps {
  filters: ProjectFilters
  onFiltersChange: (filters: ProjectFilters) => void
  projects: Project[]
  isOpen: boolean
  onToggle: () => void
}

const ProjectFiltersComponent: React.FC<ProjectFiltersProps> = ({
  filters,
  onFiltersChange,
  projects,
  isOpen,
  onToggle
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'saved'>('basic')

  // Extract unique values from projects for filter options
  const uniqueValues = {
    statuses: Array.from(new Set(projects.map(p => p.status))),
    priorities: Array.from(new Set(projects.map(p => p.priority))),
    managers: Array.from(new Set(projects.map(p => p.manager.name))),
    departments: Array.from(new Set(projects.map(p => p.department))),
    tags: Array.from(new Set(projects.flatMap(p => p.tags))),
    healthStatuses: Array.from(new Set(projects.map(p => p.health)))
  }

  const updateFilters = (updates: Partial<ProjectFilters>) => {
    onFiltersChange({ ...filters, ...updates })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      status: [],
      priority: [],
      manager: [],
      department: [],
      tags: [],
      health: [],
      budgetRange: { min: undefined, max: undefined },
      progressRange: { min: undefined, max: undefined },
      dateRange: { start: undefined, end: undefined },
      showOverdue: false,
      showUpcoming: false
    })
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.status.length > 0) count++
    if (filters.priority.length > 0) count++
    if (filters.manager.length > 0) count++
    if (filters.department.length > 0) count++
    if (filters.tags.length > 0) count++
    if (filters.health.length > 0) count++
    if (filters.budgetRange.min !== undefined || filters.budgetRange.max !== undefined) count++
    if (filters.progressRange.min !== undefined || filters.progressRange.max !== undefined) count++
    if (filters.dateRange.start || filters.dateRange.end) count++
    if (filters.showOverdue) count++
    if (filters.showUpcoming) count++
    return count
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      notation: 'compact'
    }).format(amount)
  }

  const MultiSelectFilter: React.FC<{
    label: string
    value: string[]
    options: string[]
    onChange: (value: string[]) => void
    icon?: React.ReactNode
  }> = ({ label, value, options, onChange, icon }) => {
    const [isOpen, setIsOpen] = useState(false)

    const toggleOption = (option: string) => {
      const newValue = value.includes(option)
        ? value.filter(v => v !== option)
        : [...value, option]
      onChange(newValue)
    }

    return (
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {icon && <span className="mr-1">{icon}</span>}
          {label}
        </label>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-full bg-white border border-gray-300 rounded-md pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <span className="block truncate">
            {value.length === 0
              ? `Select ${label.toLowerCase()}`
              : `${value.length} selected`
            }
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDownIcon className="h-5 w-5 text-gray-400" />
          </span>
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
              {options.map((option) => (
                <div
                  key={option}
                  className={`cursor-pointer select-none relative py-2 pl-8 pr-4 hover:bg-gray-50 ${
                    value.includes(option) ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
                  }`}
                  onClick={() => toggleOption(option)}
                >
                  <span className="block truncate capitalize">{option}</span>
                  {value.includes(option) && (
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <FunnelIcon className="h-4 w-4 mr-2" />
        Filters
        {getActiveFilterCount() > 0 && (
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {getActiveFilterCount()}
          </span>
        )}
      </button>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <FunnelIcon className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Project Filters</h3>
          {getActiveFilterCount() > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {getActiveFilterCount()} active
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearAllFilters}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear all
          </button>
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-4" aria-label="Tabs">
          {[
            { id: 'basic', name: 'Basic Filters' },
            { id: 'advanced', name: 'Advanced' },
            { id: 'saved', name: 'Saved Filters' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {activeTab === 'basic' && (
          <div className="space-y-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MagnifyingGlassIcon className="h-4 w-4 inline mr-1" />
                Search
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
                placeholder="Search projects..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status */}
            <MultiSelectFilter
              label="Status"
              value={filters.status}
              options={uniqueValues.statuses}
              onChange={(status) => updateFilters({ status: status as any })}
              icon={<TagIcon className="h-4 w-4" />}
            />

            {/* Priority */}
            <MultiSelectFilter
              label="Priority"
              value={filters.priority}
              options={uniqueValues.priorities}
              onChange={(priority) => updateFilters({ priority: priority as any })}
            />

            {/* Manager */}
            <MultiSelectFilter
              label="Project Manager"
              value={filters.manager}
              options={uniqueValues.managers}
              onChange={(manager) => updateFilters({ manager })}
              icon={<UserIcon className="h-4 w-4" />}
            />

            {/* Department */}
            <MultiSelectFilter
              label="Department"
              value={filters.department}
              options={uniqueValues.departments.filter(Boolean) as string[]}
              onChange={(department) => updateFilters({ department })}
            />
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="space-y-4">
            {/* Health Status */}
            <MultiSelectFilter
              label="Health Status"
              value={filters.health}
              options={uniqueValues.healthStatuses}
              onChange={(health) => updateFilters({ health })}
            />

            {/* Tags */}
            <MultiSelectFilter
              label="Tags"
              value={filters.tags}
              options={uniqueValues.tags}
              onChange={(tags) => updateFilters({ tags })}
              icon={<TagIcon className="h-4 w-4" />}
            />

            {/* Budget Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <CurrencyDollarIcon className="h-4 w-4 inline mr-1" />
                Budget Range (NGN)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.budgetRange.min || ''}
                  onChange={(e) => updateFilters({
                    budgetRange: {
                      ...filters.budgetRange,
                      min: e.target.value ? Number(e.target.value) : undefined
                    }
                  })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.budgetRange.max || ''}
                  onChange={(e) => updateFilters({
                    budgetRange: {
                      ...filters.budgetRange,
                      max: e.target.value ? Number(e.target.value) : undefined
                    }
                  })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Progress Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Progress Range (%)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min %"
                  min="0"
                  max="100"
                  value={filters.progressRange.min || ''}
                  onChange={(e) => updateFilters({
                    progressRange: {
                      ...filters.progressRange,
                      min: e.target.value ? Number(e.target.value) : undefined
                    }
                  })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="number"
                  placeholder="Max %"
                  min="0"
                  max="100"
                  value={filters.progressRange.max || ''}
                  onChange={(e) => updateFilters({
                    progressRange: {
                      ...filters.progressRange,
                      max: e.target.value ? Number(e.target.value) : undefined
                    }
                  })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <CalendarIcon className="h-4 w-4 inline mr-1" />
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={filters.dateRange.start || ''}
                  onChange={(e) => updateFilters({
                    dateRange: {
                      ...filters.dateRange,
                      start: e.target.value || undefined
                    }
                  })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="date"
                  value={filters.dateRange.end || ''}
                  onChange={(e) => updateFilters({
                    dateRange: {
                      ...filters.dateRange,
                      end: e.target.value || undefined
                    }
                  })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Quick Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quick Filters</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.showOverdue}
                    onChange={(e) => updateFilters({ showOverdue: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Show overdue projects</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.showUpcoming}
                    onChange={(e) => updateFilters({ showUpcoming: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Show upcoming deadlines</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="space-y-4">
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No saved filters</h3>
              <p className="text-gray-500 mb-4">
                Save your current filter configuration for quick access.
              </p>
              <button
                onClick={() => {
                  // Handle save current filters
                  console.log('Save current filters:', filters)
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Save Current Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-4 py-3 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {projects.length} total projects
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Reset
            </button>
            <button
              onClick={onToggle}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectFiltersComponent
