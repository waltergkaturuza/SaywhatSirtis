"use client"

import { ModulePage } from "@/components/layout/enhanced-layout"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { toast } from "@/hooks/use-toast"
import {
  UserGroupIcon,
  PlusIcon,
  PencilIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  UserIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon
} from "@heroicons/react/24/outline"

interface Supervisor {
  id: string
  firstName: string
  lastName: string
  email: string
  position: string
  department: string
  isSupervisor: boolean
  isReviewer: boolean
  subordinatesCount?: number
  createdAt: string
}

export default function SupervisorManagementPage() {
  const { data: session } = useSession()
  const [supervisors, setSupervisors] = useState<Supervisor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingSupervisor, setEditingSupervisor] = useState<Supervisor | null>(null)

  useEffect(() => {
    fetchSupervisors()
  }, [])

  const fetchSupervisors = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/hr/employees/supervisors')
      
      if (!response.ok) {
        throw new Error('Failed to fetch supervisors')
      }

      const result = await response.json()
      setSupervisors(result.data || [])
    } catch (error) {
      console.error('Error fetching supervisors:', error)
      toast({
        title: "Error",
        description: "Failed to load supervisors. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleSupervisor = async (employeeId: string, isSupervisor: boolean) => {
    try {
      const response = await fetch(`/api/hr/employees/${employeeId}/supervisor`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isSupervisor })
      })

      if (!response.ok) {
        throw new Error('Failed to update supervisor status')
      }

      toast({
        title: "Success",
        description: `Employee ${isSupervisor ? 'promoted to' : 'removed from'} supervisor role`,
      })

      await fetchSupervisors()
    } catch (error) {
      console.error('Error updating supervisor status:', error)
      toast({
        title: "Error",
        description: "Failed to update supervisor status. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleToggleReviewer = async (employeeId: string, isReviewer: boolean) => {
    try {
      const response = await fetch(`/api/hr/employees/${employeeId}/reviewer`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isReviewer })
      })

      if (!response.ok) {
        throw new Error('Failed to update reviewer status')
      }

      toast({
        title: "Success",
        description: `Employee ${isReviewer ? 'assigned as' : 'removed from'} reviewer role`,
      })

      await fetchSupervisors()
    } catch (error) {
      console.error('Error updating reviewer status:', error)
      toast({
        title: "Error",
        description: "Failed to update reviewer status. Please try again.",
        variant: "destructive"
      })
    }
  }

  const filteredSupervisors = supervisors.filter(supervisor =>
    supervisor.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supervisor.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supervisor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supervisor.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supervisor.department.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const actions = [
    {
      name: "Add Supervisor",
      href: "/hr/employees/add?role=supervisor",
      icon: PlusIcon,
      description: "Create new employee with supervisor role"
    }
  ]

  if (loading) {
    return (
      <ModulePage
        metadata={{
          title: "Supervisor Management",
          description: "Manage supervisors and reviewers",
          breadcrumbs: [
            { name: "HR", href: "/hr" },
            { name: "Supervisors", href: "/hr/supervisors" }
          ]
        }}
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </ModulePage>
    )
  }

  return (
    <ModulePage
      metadata={{
        title: "Supervisor Management",
        description: "Manage supervisors and performance reviewers",
        breadcrumbs: [
          { name: "HR", href: "/hr" },
          { name: "Supervisors", href: "/hr/supervisors" }
        ]
      }}
    >
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search supervisors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Supervisors</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {supervisors.filter(s => s.isSupervisor).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <StarIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Performance Reviewers</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {supervisors.filter(s => s.isReviewer).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Dual Role</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {supervisors.filter(s => s.isSupervisor && s.isReviewer).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Supervisors</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {supervisors.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Supervisors List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Supervisors & Reviewers ({filteredSupervisors.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supervisor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reviewer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSupervisors.map((supervisor) => (
                  <tr key={supervisor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-indigo-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {supervisor.firstName} {supervisor.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {supervisor.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {supervisor.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {supervisor.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleSupervisor(supervisor.id, !supervisor.isSupervisor)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          supervisor.isSupervisor
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800 hover:bg-green-100 hover:text-green-800'
                        }`}
                      >
                        {supervisor.isSupervisor ? (
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                        ) : (
                          <XCircleIcon className="h-4 w-4 mr-1" />
                        )}
                        {supervisor.isSupervisor ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleReviewer(supervisor.id, !supervisor.isReviewer)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          supervisor.isReviewer
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800 hover:bg-yellow-100 hover:text-yellow-800'
                        }`}
                      >
                        {supervisor.isReviewer ? (
                          <StarIcon className="h-4 w-4 mr-1" />
                        ) : (
                          <XCircleIcon className="h-4 w-4 mr-1" />
                        )}
                        {supervisor.isReviewer ? 'Reviewer' : 'Not Reviewer'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => window.open(`/hr/employees/${supervisor.id}`, '_blank')}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingSupervisor(supervisor)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSupervisors.length === 0 && (
            <div className="text-center py-12">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No supervisors found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery ? 'Try adjusting your search criteria.' : 'Get started by adding a new supervisor.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </ModulePage>
  )
}
