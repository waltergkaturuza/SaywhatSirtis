"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeftIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
  AcademicCapIcon,
  UserGroupIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline"

interface Employee {
  id: string
  name: string
  department: string
  position: string
  email: string
  enrolledPrograms: string[]
}

interface TrainingProgram {
  id: string
  title: string
  category: string
  duration: string
  format: string
  capacity: number
  enrolled: number
  startDate: string
  status: string
}

export default function EnrollEmployeesPage() {
  const [selectedProgram, setSelectedProgram] = useState<string>("")
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sample data - replace with actual API calls
  const trainingPrograms: TrainingProgram[] = [
    {
      id: "1",
      title: "Leadership Development Program",
      category: "Leadership",
      duration: "6 weeks",
      format: "Blended",
      capacity: 30,
      enrolled: 25,
      startDate: "2024-02-01",
      status: "active"
    },
    {
      id: "2",
      title: "Data Analysis with Python",
      category: "Technical Skills",
      duration: "4 weeks",
      format: "Online",
      capacity: 25,
      enrolled: 18,
      startDate: "2024-01-15",
      status: "active"
    },
    {
      id: "4",
      title: "Financial Management Basics",
      category: "Professional Development",
      duration: "3 weeks",
      format: "Hybrid",
      capacity: 20,
      enrolled: 12,
      startDate: "2024-02-05",
      status: "upcoming"
    }
  ]

  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/hr/employees')
      if (!response.ok) {
        throw new Error('Failed to load employees')
      }
      const data = await response.json()
      setEmployees(data.map((emp: any) => ({
        id: emp.id.toString(),
        name: `${emp.firstName} ${emp.lastName}`,
        department: emp.department,
        position: emp.position || 'Employee',
        email: emp.email,
        enrolledPrograms: emp.enrolledPrograms || []
      })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load employees')
    } finally {
      setLoading(false)
    }
  }

  const departments = [...new Set(employees.map(emp => emp.department))]

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = !departmentFilter || employee.department === departmentFilter
    return matchesSearch && matchesDepartment
  })

  const handleEmployeeToggle = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    )
  }

  const handleSelectAll = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([])
    } else {
      setSelectedEmployees(filteredEmployees.map(emp => emp.id))
    }
  }

  const handleEnrollment = async () => {
    if (!selectedProgram || selectedEmployees.length === 0) {
      alert('Please select a program and at least one employee.')
      return
    }

    setIsSubmitting(true)
    
    try {
      // TODO: Implement API call to enroll employees
      console.log('Enrolling employees:', {
        programId: selectedProgram,
        employeeIds: selectedEmployees
      })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      alert(`Successfully enrolled ${selectedEmployees.length} employee(s) in the training program!`)
      
      // Reset selections
      setSelectedEmployees([])
      setSelectedProgram("")
    } catch (error) {
      console.error('Error enrolling employees:', error)
      alert('Error enrolling employees. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedProgramData = trainingPrograms.find(p => p.id === selectedProgram)
  const availableSpots = selectedProgramData ? selectedProgramData.capacity - selectedProgramData.enrolled : 0

  const sidebarContent = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Guidelines</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <AcademicCapIcon className="h-4 w-4 mt-0.5 text-blue-500" />
            <div>
              <p className="font-medium">Check Prerequisites</p>
              <p>Ensure employees meet program requirements</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <UserGroupIcon className="h-4 w-4 mt-0.5 text-green-500" />
            <div>
              <p className="font-medium">Capacity Limits</p>
              <p>Monitor available spots in each program</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircleIcon className="h-4 w-4 mt-0.5 text-purple-500" />
            <div>
              <p className="font-medium">Confirm Availability</p>
              <p>Verify employee schedule compatibility</p>
            </div>
          </div>
        </div>
      </div>

      {selectedProgramData && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Details</h3>
          <div className="bg-blue-50 p-4 rounded-lg space-y-2 text-sm">
            <p><span className="font-medium">Available Spots:</span> {availableSpots}</p>
            <p><span className="font-medium">Duration:</span> {selectedProgramData.duration}</p>
            <p><span className="font-medium">Format:</span> {selectedProgramData.format}</p>
            <p><span className="font-medium">Start Date:</span> {new Date(selectedProgramData.startDate).toLocaleDateString()}</p>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Total Employees:</span>
            <span className="font-medium">{employees.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Filtered Results:</span>
            <span className="font-medium">{filteredEmployees.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Selected:</span>
            <span className="font-medium text-blue-600">{selectedEmployees.length}</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <ModulePage
      metadata={{
        title: "Enroll Employees",
        description: "Enroll employees in training programs",
        breadcrumbs: [
          { name: "HR", href: "/hr" },
          { name: "Training", href: "/hr/training" },
          { name: "Enroll" }
        ]
      }}
      sidebar={sidebarContent}
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/hr/training" 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Training Programs
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Program Selection */}
          <div className="bg-white shadow-sm border rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Training Program</h3>
            <div className="space-y-3">
              {trainingPrograms.map(program => (
                <div
                  key={program.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors $${
                    selectedProgram === program.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedProgram(program.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{program.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{program.category}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>{program.duration}</span>
                        <span>{program.format}</span>
                        <span>{program.enrolled}/{program.capacity} enrolled</span>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium $${
                      program.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : program.status === 'upcoming'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {program.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Employee Selection */}
          <div className="bg-white shadow-sm border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Select Employees</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSelectAll}
                disabled={filteredEmployees.length === 0}
              >
                {selectedEmployees.length === filteredEmployees.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            {/* Filters */}
            <div className="space-y-3 mb-4">
              <div className="relative">
                <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Employee List */}
            <div className="max-h-96 overflow-y-auto space-y-2">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading employees...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-red-800 mb-1">Error Loading Employees</h3>
                    <p className="text-red-600 text-sm mb-3">{error}</p>
                    <button 
                      onClick={fetchEmployees} 
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : filteredEmployees.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No employees found matching your criteria.</p>
                </div>
              ) : (
                filteredEmployees.map(employee => {
                const isAlreadyEnrolled = selectedProgramData && 
                  employee.enrolledPrograms.includes(selectedProgram)
                
                return (
                  <div
                    key={employee.id}
                    className={`p-3 border rounded-lg $${
                      isAlreadyEnrolled 
                        ? 'border-yellow-200 bg-yellow-50'
                        : selectedEmployees.includes(employee.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(employee.id)}
                        onChange={() => handleEmployeeToggle(employee.id)}
                        disabled={isAlreadyEnrolled}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">{employee.name}</p>
                          {isAlreadyEnrolled && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                              Already Enrolled
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">{employee.position}</p>
                        <p className="text-xs text-gray-500">{employee.department} • {employee.email}</p>
                      </div>
                    </label>
                  </div>
                )
              })
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end space-x-4">
          <Link href="/hr/training">
            <Button variant="outline">
              Cancel
            </Button>
          </Link>
          <Button 
            onClick={handleEnrollment}
            disabled={!selectedProgram || selectedEmployees.length === 0 || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting 
              ? 'Enrolling...' 
              : `Enroll ${selectedEmployees.length} Employee${selectedEmployees.length !== 1 ? 's' : ''}`
            }
          </Button>
        </div>

        {/* Summary */}
        {selectedProgram && selectedEmployees.length > 0 && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-900">Enrollment Summary</h4>
            <p className="text-sm text-green-700 mt-1">
              Ready to enroll {selectedEmployees.length} employee(s) in "{selectedProgramData?.title}"
              {availableSpots < selectedEmployees.length && (
                <span className="text-red-600 ml-2">
                  Warning: Only {availableSpots} spots available
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </ModulePage>
  )
}
