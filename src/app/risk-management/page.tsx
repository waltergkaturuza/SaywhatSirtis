"use client"

import React, { useState, useEffect } from 'react'
import { useSession } from "next-auth/react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Shield,
  Target,
  FileText,
  Plus,
  Filter,
  Download,
  Eye,
  Edit,
  Trash,
  Clock,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

const SAYWHAT_COLORS = {
  orange: '#ff6b35',
  red: '#dc2626', 
  grey: '#6b7280',
  dark: '#1f2937',
  lightGrey: '#f3f4f6'
}

interface Risk {
  id: string
  title: string
  description: string
  category: 'Operational' | 'Strategic' | 'Financial' | 'Compliance' | 'Reputational' | 'Environmental' | 'Cybersecurity' | 'HR/Personnel'
  department: string
  probability: 'Low' | 'Medium' | 'High'
  impact: 'Low' | 'Medium' | 'High'
  riskScore: number
  status: 'Open' | 'Mitigated' | 'Escalated' | 'Closed'
  dateIdentified: string
  owner: string
  mitigationPlan?: string
  documents?: string[]
  lastReviewed?: string
  createdBy: string
}

interface Department {
  id: string
  name: string
  code: string
  level: number
  parentId: string | null
  status: string
}

interface Employee {
  id: string
  employeeId: string
  name: string
  email: string
  department: string
  position: string
  fullName: string
}

interface RiskStats {
  totalRisks: number
  openRisks: number
  highRisks: number
  overdueMitigations: number
  risksByCategory: Record<string, number>
  risksByDepartment: Record<string, number>
}

const riskCategories = [
  'Operational',
  'Strategic', 
  'Financial',
  'Compliance',
  'Reputational',
  'Environmental',
  'Cybersecurity',
  'HR/Personnel'
]

const probabilityLevels = ['Low', 'Medium', 'High']
const impactLevels = ['Low', 'Medium', 'High']
const statusOptions = ['Open', 'Mitigated', 'Escalated', 'Closed']

export default function RiskManagementPage() {
  const { data: session, status } = useSession()
  const [risks, setRisks] = useState<Risk[]>([])
  const [stats, setStats] = useState<RiskStats | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedDepartmentEmployees, setSelectedDepartmentEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingDepartments, setLoadingDepartments] = useState(false)
  const [loadingEmployees, setLoadingEmployees] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null)
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    category: 'all',
    department: 'all',
    status: 'all',
    probability: 'all',
    impact: 'all'
  })

  const [newRisk, setNewRisk] = useState({
    title: '',
    description: '',
    category: '',
    department: '',
    departmentId: '',
    probability: '',
    impact: '',
    owner: ''
  })

  // Initialize data on component mount
  useEffect(() => {
    fetchRisks()
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      setLoadingDepartments(true)
      const response = await fetch('/api/hr/department/list')
      
      if (!response.ok) {
        throw new Error('Failed to fetch departments')
      }
      
      const data = await response.json()
      setDepartments(data.data || [])
      
    } catch (error) {
      console.error('Error fetching departments:', error)
      // No fallback data - rely entirely on backend
      setDepartments([])
    } finally {
      setLoadingDepartments(false)
    }
  }

  const fetchEmployeesByDepartment = async (departmentName: string) => {
    try {
      setLoadingEmployees(true)
      const response = await fetch(`/api/hr/employees/by-department?department=${encodeURIComponent(departmentName)}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch employees')
      }
      
      const data = await response.json()
      setSelectedDepartmentEmployees(data.employees || [])
      
    } catch (error) {
      console.error('Error fetching employees:', error)
      // Fallback to empty array
      setSelectedDepartmentEmployees([])
    } finally {
      setLoadingEmployees(false)
    }
  }

  const fetchRisks = async () => {
    try {
      setLoading(true)
      console.log('Fetching risks...')
      
      const response = await fetch('/api/risk-management')
      console.log('Risk API response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Risk API error response:', errorText)
        throw new Error(`Failed to fetch risks: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('Risk API data:', data)
      setRisks(data.risks || [])
      
      // Calculate stats from real data
      const openRisks = data.risks?.filter((r: Risk) => r.status === 'Open').length || 0
      const highRisks = data.risks?.filter((r: Risk) => r.riskScore >= 7).length || 0
      const overdueMitigations = data.risks?.filter((r: Risk) => 
        r.status === 'Open' && !r.mitigationPlan
      ).length || 0
      
      const risksByCategory: Record<string, number> = {}
      const risksByDepartment: Record<string, number> = {}
      
      data.risks?.forEach((risk: Risk) => {
        risksByCategory[risk.category] = (risksByCategory[risk.category] || 0) + 1
        risksByDepartment[risk.department] = (risksByDepartment[risk.department] || 0) + 1
      })
      
      setStats({
        totalRisks: data.risks?.length || 0,
        openRisks,
        highRisks,
        overdueMitigations,
        risksByCategory,
        risksByDepartment
      })
      
    } catch (error) {
      console.error('Error fetching risks:', error)
      
      // Check session status
      try {
        const sessionResponse = await fetch('/api/debug/session')
        const sessionData = await sessionResponse.json()
        console.log('Session debug info:', sessionData)
      } catch (sessionError) {
        console.error('Session debug error:', sessionError)
      }
      
      // Fallback to empty state
      setRisks([])
      setStats({
        totalRisks: 0,
        openRisks: 0,
        highRisks: 0,
        overdueMitigations: 0,
        risksByCategory: {},
        risksByDepartment: {}
      })
    } finally {
      setLoading(false)
    }
  }

  // Action handlers for Risk Register
  const handleViewRisk = (risk: Risk) => {
    setSelectedRisk(risk)
    setShowViewModal(true)
  }

  const handleEditRisk = (risk: Risk) => {
    setEditingRisk(risk)
    setShowEditModal(true)
  }

  const handleDepartmentChange = (departmentName: string) => {
    setNewRisk(prev => ({
      ...prev,
      department: departmentName,
      departmentId: departments.find(d => d.name === departmentName)?.id || '',
      owner: '' // Reset owner when department changes
    }))
    
    // Fetch employees for the selected department
    if (departmentName && departmentName !== 'all') {
      fetchEmployeesByDepartment(departmentName)
    } else {
      setSelectedDepartmentEmployees([])
    }
  }

  const handleDeleteRisk = async (riskId: string) => {
    if (window.confirm('Are you sure you want to delete this risk? This action cannot be undone.')) {
      setIsDeleting(riskId)
      try {
        const response = await fetch(`/api/risk-management/${riskId}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to delete risk')
        }

        // Refresh data from server
        await fetchRisks()
        
        alert('Risk deleted successfully!')
        
      } catch (error) {
        console.error('Error deleting risk:', error)
        alert(error instanceof Error ? error.message : 'Failed to delete risk. Please try again.')
      } finally {
        setIsDeleting(null)
      }
    }
  }

  const handleUpdateRisk = async (updatedRisk: Risk) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/risk-management/${updatedRisk.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: updatedRisk.title,
          description: updatedRisk.description,
          category: updatedRisk.category,
          department: updatedRisk.department,
          probability: updatedRisk.probability,
          impact: updatedRisk.impact,
          status: updatedRisk.status,
          owner: updatedRisk.owner,
          mitigationPlan: updatedRisk.mitigationPlan
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update risk')
      }

      setShowEditModal(false)
      setEditingRisk(null)
      
      // Refresh data from server
      await fetchRisks()
      
      alert('Risk updated successfully!')
      
    } catch (error) {
      console.error('Error updating risk:', error)
      alert(error instanceof Error ? error.message : 'Failed to update risk. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  // Generate Risk Matrix data
  const generateRiskMatrix = () => {
    const matrix = {
      'High-Low': [] as Risk[],
      'High-Medium': [] as Risk[],
      'High-High': [] as Risk[],
      'Medium-Low': [] as Risk[],
      'Medium-Medium': [] as Risk[],
      'Medium-High': [] as Risk[],
      'Low-Low': [] as Risk[],
      'Low-Medium': [] as Risk[],
      'Low-High': [] as Risk[]
    }

    risks.forEach(risk => {
      const key = `${risk.probability}-${risk.impact}` as keyof typeof matrix
      if (matrix[key]) {
        matrix[key].push(risk)
      }
    })

    return matrix
  }

  const getRiskScoreColor = (score: number) => {
    if (score >= 7) return 'text-red-600 bg-red-100'
    if (score >= 4) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'text-red-600 bg-red-100'
      case 'Mitigated': return 'text-green-600 bg-green-100'
      case 'Escalated': return 'text-orange-600 bg-orange-100'
      case 'Closed': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const handleCreateRisk = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!newRisk.title || !newRisk.description || !newRisk.category || !newRisk.department || !newRisk.probability || !newRisk.impact || !newRisk.owner) {
      alert('Please fill in all required fields')
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch('/api/risk-management', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRisk)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create risk')
      }

      const data = await response.json()
      
      // Reset form and close modal
      setNewRisk({
        title: '',
        description: '',
        category: '',
        department: '',
        departmentId: '',
        probability: '',
        impact: '',
        owner: ''
      })
      setSelectedDepartmentEmployees([])
      setShowCreateModal(false)
      
      // Refresh data from server
      await fetchRisks()
      
      alert('Risk registered successfully!')
      
    } catch (error) {
      console.error('Error creating risk:', error)
      alert(error instanceof Error ? error.message : 'Failed to create risk. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saywhat-orange mx-auto"></div>
          <p className="mt-4 text-saywhat-grey">Loading Risk Management...</p>
        </div>
      </div>
    )
  }

  const filteredRisks = risks.filter(risk => {
    return (filters.category === 'all' || risk.category === filters.category) &&
           (filters.department === 'all' || risk.department === filters.department) &&
           (filters.status === 'all' || risk.status === filters.status) &&
           (filters.probability === 'all' || risk.probability === filters.probability) &&
           (filters.impact === 'all' || risk.impact === filters.impact)
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Risk Management</h1>
            <p className="text-gray-600">Monitor, assess, and mitigate organizational risks</p>
          </div>
          <div className="flex space-x-3">
            <Button 
              onClick={fetchRisks}
              variant="outline"
              disabled={loading}
              className="border-saywhat-orange text-saywhat-orange hover:bg-orange-50"
            >
              {loading ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-saywhat-orange border-t-transparent mr-2" />
              ) : (
                <TrendingUp className="w-4 h-4 mr-2" />
              )}
              Refresh
            </Button>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-saywhat-orange hover:bg-orange-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Register New Risk
            </Button>
          </div>
        </div>

        {/* Dashboard Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Shield className="h-8 w-8 text-saywhat-orange" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Risks</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalRisks}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Open Risks</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.openRisks}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">High Priority</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.highRisks}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Overdue Actions</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.overdueMitigations}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="register">Risk Register</TabsTrigger>
            <TabsTrigger value="matrix">Risk Matrix</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Risk Categories Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Risks by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats && Object.entries(stats.risksByCategory).map(([category, count]) => (
                    <div key={category} className="flex justify-between items-center py-2">
                      <span className="text-sm font-medium">{category}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Risks */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Risks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {risks.slice(0, 3).map(risk => (
                      <div key={risk.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{risk.title}</p>
                          <p className="text-sm text-gray-600">{risk.department}</p>
                        </div>
                        <Badge className={getRiskScoreColor(risk.riskScore)}>
                          Score: {risk.riskScore}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="register" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-sm bg-white/95 border shadow-lg">
                      <SelectItem value="all">All Categories</SelectItem>
                      {riskCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filters.department} onValueChange={(value) => setFilters({...filters, department: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-sm bg-white/95 border shadow-lg">
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map(dept => (
                        <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-sm bg-white/95 border shadow-lg">
                      <SelectItem value="all">All Status</SelectItem>
                      {statusOptions.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button variant="outline" onClick={() => setFilters({category: 'all', department: 'all', status: 'all', probability: 'all', impact: 'all'})}>
                    <Filter className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>

                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Risk Register Table */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Register ({filteredRisks.length} risks)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Risk ID</th>
                        <th className="text-left p-3">Title</th>
                        <th className="text-left p-3">Category</th>
                        <th className="text-left p-3">Department</th>
                        <th className="text-left p-3">Risk Score</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Owner</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRisks.map(risk => (
                        <tr key={risk.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">#{risk.id}</td>
                          <td className="p-3">
                            <div>
                              <p className="font-medium">{risk.title}</p>
                              <p className="text-sm text-gray-600 truncate max-w-xs">{risk.description}</p>
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline">{risk.category}</Badge>
                          </td>
                          <td className="p-3">{risk.department}</td>
                          <td className="p-3">
                            <Badge className={getRiskScoreColor(risk.riskScore)}>
                              {risk.riskScore}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge className={getStatusColor(risk.status)}>
                              {risk.status}
                            </Badge>
                          </td>
                          <td className="p-3">{risk.owner}</td>
                          <td className="p-3">
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleViewRisk(risk)}
                                className="hover:bg-blue-50"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEditRisk(risk)}
                                className="hover:bg-green-50"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDeleteRisk(risk.id)}
                                disabled={isDeleting === risk.id}
                                className="hover:bg-red-50 text-red-600"
                              >
                                {isDeleting === risk.id ? (
                                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                                ) : (
                                  <Trash className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="matrix" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Heat Matrix</CardTitle>
                <p className="text-gray-600">Visual representation of risks by probability and impact</p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <div className="grid grid-cols-4 gap-4 min-w-[800px]">
                    <div className="p-4 text-base font-semibold">Impact →</div>
                    <div className="p-4 text-base font-semibold text-center bg-gray-100 rounded">Low</div>
                    <div className="p-4 text-base font-semibold text-center bg-gray-100 rounded">Medium</div>
                    <div className="p-4 text-base font-semibold text-center bg-gray-100 rounded">High</div>
                    
                    <div className="p-4 text-base font-semibold bg-gray-100 rounded">High Probability</div>
                    <div className="p-6 bg-yellow-200 border-2 border-yellow-300 rounded-lg min-h-[120px]">
                      <div className="text-center font-semibold text-yellow-800 mb-2">
                        Score: 3 ({generateRiskMatrix()['High-Low'].length})
                      </div>
                      {generateRiskMatrix()['High-Low'].map(risk => (
                        <div key={risk.id} className="text-xs bg-white p-1 rounded mb-1 truncate">
                          #{risk.id}: {risk.title}
                        </div>
                      ))}
                    </div>
                    <div className="p-6 bg-orange-200 border-2 border-orange-300 rounded-lg min-h-[120px]">
                      <div className="text-center font-semibold text-orange-800 mb-2">
                        Score: 6 ({generateRiskMatrix()['High-Medium'].length})
                      </div>
                      {generateRiskMatrix()['High-Medium'].map(risk => (
                        <div key={risk.id} className="text-xs bg-white p-1 rounded mb-1 truncate">
                          #{risk.id}: {risk.title}
                        </div>
                      ))}
                    </div>
                    <div className="p-6 bg-red-200 border-2 border-red-300 rounded-lg min-h-[120px]">
                      <div className="text-center font-semibold text-red-800 mb-2">
                        Score: 9 ({generateRiskMatrix()['High-High'].length})
                      </div>
                      {generateRiskMatrix()['High-High'].map(risk => (
                        <div key={risk.id} className="text-xs bg-white p-1 rounded mb-1 truncate">
                          #{risk.id}: {risk.title}
                        </div>
                      ))}
                    </div>
                    
                    <div className="p-4 text-base font-semibold bg-gray-100 rounded">Medium Probability</div>
                    <div className="p-6 bg-green-200 border-2 border-green-300 rounded-lg min-h-[120px]">
                      <div className="text-center font-semibold text-green-800 mb-2">
                        Score: 2 ({generateRiskMatrix()['Medium-Low'].length})
                      </div>
                      {generateRiskMatrix()['Medium-Low'].map(risk => (
                        <div key={risk.id} className="text-xs bg-white p-1 rounded mb-1 truncate">
                          #{risk.id}: {risk.title}
                        </div>
                      ))}
                    </div>
                    <div className="p-6 bg-yellow-200 border-2 border-yellow-300 rounded-lg min-h-[120px]">
                      <div className="text-center font-semibold text-yellow-800 mb-2">
                        Score: 4 ({generateRiskMatrix()['Medium-Medium'].length})
                      </div>
                      {generateRiskMatrix()['Medium-Medium'].map(risk => (
                        <div key={risk.id} className="text-xs bg-white p-1 rounded mb-1 truncate">
                          #{risk.id}: {risk.title}
                        </div>
                      ))}
                    </div>
                    <div className="p-6 bg-orange-200 border-2 border-orange-300 rounded-lg min-h-[120px]">
                      <div className="text-center font-semibold text-orange-800 mb-2">
                        Score: 6 ({generateRiskMatrix()['Medium-High'].length})
                      </div>
                      {generateRiskMatrix()['Medium-High'].map(risk => (
                        <div key={risk.id} className="text-xs bg-white p-1 rounded mb-1 truncate">
                          #{risk.id}: {risk.title}
                        </div>
                      ))}
                    </div>
                    
                    <div className="p-4 text-base font-semibold bg-gray-100 rounded">Low Probability</div>
                    <div className="p-6 bg-green-100 border-2 border-green-200 rounded-lg min-h-[120px]">
                      <div className="text-center font-semibold text-green-700 mb-2">
                        Score: 1 ({generateRiskMatrix()['Low-Low'].length})
                      </div>
                      {generateRiskMatrix()['Low-Low'].map(risk => (
                        <div key={risk.id} className="text-xs bg-white p-1 rounded mb-1 truncate">
                          #{risk.id}: {risk.title}
                        </div>
                      ))}
                    </div>
                    <div className="p-6 bg-green-200 border-2 border-green-300 rounded-lg min-h-[120px]">
                      <div className="text-center font-semibold text-green-800 mb-2">
                        Score: 2 ({generateRiskMatrix()['Low-Medium'].length})
                      </div>
                      {generateRiskMatrix()['Low-Medium'].map(risk => (
                        <div key={risk.id} className="text-xs bg-white p-1 rounded mb-1 truncate">
                          #{risk.id}: {risk.title}
                        </div>
                      ))}
                    </div>
                    <div className="p-6 bg-yellow-200 border-2 border-yellow-300 rounded-lg min-h-[120px]">
                      <div className="text-center font-semibold text-yellow-800 mb-2">
                        Score: 3 ({generateRiskMatrix()['Low-High'].length})
                      </div>
                      {generateRiskMatrix()['Low-High'].map(risk => (
                        <div key={risk.id} className="text-xs bg-white p-1 rounded mb-1 truncate">
                          #{risk.id}: {risk.title}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-200 border border-green-300 rounded"></div>
                    <span className="text-sm">Low Risk (1-2)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-200 border border-yellow-300 rounded"></div>
                    <span className="text-sm">Medium Risk (3-4)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-orange-200 border border-orange-300 rounded"></div>
                    <span className="text-sm">High Risk (6)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-200 border border-red-300 rounded"></div>
                    <span className="text-sm">Critical Risk (9)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-saywhat-orange mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Risk Register Report</h3>
                    <p className="text-sm text-gray-600 mb-4">Complete list of all registered risks</p>
                    <Button variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <Target className="h-12 w-12 text-saywhat-orange mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Quarterly Review</h3>
                    <p className="text-sm text-gray-600 mb-4">Risk assessment quarterly summary</p>
                    <Button variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download Excel
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-saywhat-orange mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Risk Trends</h3>
                    <p className="text-sm text-gray-600 mb-4">Historical risk analysis and trends</p>
                    <Button variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add New Risk Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">Register New Risk</DialogTitle>
            <p className="text-gray-600">Fill in the details below to register a new organizational risk</p>
          </DialogHeader>
          <form onSubmit={handleCreateRisk} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="title" className="text-base font-semibold">Risk Title *</Label>
                <Input
                  id="title"
                  value={newRisk.title}
                  onChange={(e) => setNewRisk({...newRisk, title: e.target.value})}
                  placeholder="Enter a clear and descriptive risk title"
                  required
                  className="mt-2 h-12 text-base"
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="description" className="text-base font-semibold">Risk Description *</Label>
                <Textarea
                  id="description"
                  value={newRisk.description}
                  onChange={(e) => setNewRisk({...newRisk, description: e.target.value})}
                  placeholder="Provide a detailed description of the risk, including potential causes and consequences"
                  rows={4}
                  required
                  className="mt-2 text-base"
                />
              </div>

              <div>
                <Label htmlFor="category" className="text-base font-semibold">Risk Category *</Label>
                <Select value={newRisk.category} onValueChange={(value) => setNewRisk({...newRisk, category: value})}>
                  <SelectTrigger className="mt-2 h-12 text-base">
                    <SelectValue placeholder="Select risk category" />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-sm bg-white/95 border shadow-lg">
                    {riskCategories.map(cat => (
                      <SelectItem key={cat} value={cat} className="text-base py-3 cursor-pointer hover:bg-orange-50">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

                <div>
                  <Label htmlFor="department" className="text-base font-semibold">Department *</Label>
                  <Select value={newRisk.department} onValueChange={handleDepartmentChange}>
                    <SelectTrigger className="mt-2 h-12 text-base">
                      <SelectValue placeholder="Select responsible department" />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-sm bg-white/95 border shadow-lg">
                      {loadingDepartments ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="w-4 h-4 animate-spin rounded-full border-2 border-saywhat-orange border-t-transparent mr-2" />
                          <span className="text-sm text-gray-600">Loading departments...</span>
                        </div>
                      ) : (
                        departments.map(dept => (
                          <SelectItem key={dept.id} value={dept.name} className="text-base py-3 cursor-pointer hover:bg-orange-50">
                            {dept.name} ({dept.code})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>              <div>
                <Label htmlFor="probability" className="text-base font-semibold">Probability *</Label>
                <Select value={newRisk.probability} onValueChange={(value) => setNewRisk({...newRisk, probability: value})}>
                  <SelectTrigger className="mt-2 h-12 text-base">
                    <SelectValue placeholder="Select probability level" />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-sm bg-white/95 border shadow-lg">
                    {probabilityLevels.map(level => (
                      <SelectItem key={level} value={level} className="text-base py-3 cursor-pointer hover:bg-orange-50">
                        {level} - {level === 'Low' ? 'Unlikely to occur' : level === 'Medium' ? 'Possible occurrence' : 'Likely to occur'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="impact" className="text-base font-semibold">Impact Level *</Label>
                <Select value={newRisk.impact} onValueChange={(value) => setNewRisk({...newRisk, impact: value})}>
                  <SelectTrigger className="mt-2 h-12 text-base">
                    <SelectValue placeholder="Select impact level" />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-sm bg-white/95 border shadow-lg">
                    {impactLevels.map(level => (
                      <SelectItem key={level} value={level} className="text-base py-3 cursor-pointer hover:bg-orange-50">
                        {level} - {level === 'Low' ? 'Minor impact' : level === 'Medium' ? 'Moderate impact' : 'Major impact'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="owner" className="text-base font-semibold">Risk Owner *</Label>
                {newRisk.department ? (
                  <Select value={newRisk.owner} onValueChange={(value) => setNewRisk({...newRisk, owner: value})}>
                    <SelectTrigger className="mt-2 h-12 text-base">
                      <SelectValue placeholder={`Select employee from ${newRisk.department}`} />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-sm bg-white/95 border shadow-lg max-h-60">
                      {loadingEmployees ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="w-4 h-4 animate-spin rounded-full border-2 border-saywhat-orange border-t-transparent mr-2" />
                          <span className="text-sm text-gray-600">Loading employees...</span>
                        </div>
                      ) : selectedDepartmentEmployees.length > 0 ? (
                        selectedDepartmentEmployees.map(emp => (
                          <SelectItem key={emp.id} value={emp.fullName} className="text-base py-3 cursor-pointer hover:bg-orange-50">
                            <div className="flex flex-col">
                              <span className="font-medium">{emp.name}</span>
                              <span className="text-sm text-gray-500">{emp.position} • {emp.email}</span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <div className="flex items-center justify-center py-4 text-gray-500">
                          <span className="text-sm">No employees found in {newRisk.department}</span>
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="owner"
                    value={newRisk.owner}
                    onChange={(e) => setNewRisk({...newRisk, owner: e.target.value})}
                    placeholder="Please select a department first to see available employees"
                    disabled
                    className="mt-2 h-12 text-base bg-gray-50"
                  />
                )}
                <p className="mt-1 text-sm text-gray-500">
                  {newRisk.department 
                    ? `Choose from ${selectedDepartmentEmployees.length} employee(s) in ${newRisk.department}` 
                    : 'Select a department first to see available employees'
                  }
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)} className="px-8 py-3 text-base">
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating} className="bg-saywhat-orange hover:bg-orange-600 px-8 py-3 text-base">
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                    Registering...
                  </>
                ) : (
                  'Register Risk'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Risk Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">Risk Details</DialogTitle>
          </DialogHeader>
          {selectedRisk && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Risk Title</h3>
                  <p className="text-gray-900">{selectedRisk.title}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Risk ID</h3>
                  <p className="text-gray-900">#{selectedRisk.id}</p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-900">{selectedRisk.description}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Category</h3>
                  <Badge variant="outline" className="text-base py-1 px-3">{selectedRisk.category}</Badge>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Department</h3>
                  <p className="text-gray-900">{selectedRisk.department}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Probability</h3>
                  <Badge variant="outline" className="text-base py-1 px-3">{selectedRisk.probability}</Badge>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Impact</h3>
                  <Badge variant="outline" className="text-base py-1 px-3">{selectedRisk.impact}</Badge>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Risk Score</h3>
                  <Badge className={getRiskScoreColor(selectedRisk.riskScore)} variant="outline">
                    {selectedRisk.riskScore}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Status</h3>
                  <Badge className={getStatusColor(selectedRisk.status)}>
                    {selectedRisk.status}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Risk Owner</h3>
                  <p className="text-gray-900">{selectedRisk.owner}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Date Identified</h3>
                  <p className="text-gray-900">{selectedRisk.dateIdentified}</p>
                </div>
                {selectedRisk.mitigationPlan && (
                  <div className="md:col-span-2">
                    <h3 className="font-semibold text-gray-700 mb-2">Mitigation Plan</h3>
                    <p className="text-gray-900">{selectedRisk.mitigationPlan}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button variant="outline" onClick={() => setShowViewModal(false)}>
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setShowViewModal(false)
                    handleEditRisk(selectedRisk)
                  }}
                  className="bg-saywhat-orange hover:bg-orange-600"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Risk
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Risk Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">Edit Risk</DialogTitle>
            <p className="text-gray-600">Update the risk details below</p>
          </DialogHeader>
          {editingRisk && (
            <form onSubmit={(e) => {
              e.preventDefault()
              handleUpdateRisk(editingRisk)
            }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label htmlFor="edit-title" className="text-base font-semibold">Risk Title *</Label>
                  <Input
                    id="edit-title"
                    value={editingRisk.title}
                    onChange={(e) => setEditingRisk({...editingRisk, title: e.target.value})}
                    placeholder="Enter a clear, descriptive title for the risk"
                    required
                    className="mt-2 h-12 text-base"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="edit-description" className="text-base font-semibold">Risk Description *</Label>
                  <Textarea
                    id="edit-description"
                    value={editingRisk.description}
                    onChange={(e) => setEditingRisk({...editingRisk, description: e.target.value})}
                    placeholder="Provide a detailed description of the risk, including potential causes and consequences"
                    required
                    className="mt-2 min-h-[100px] text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-category" className="text-base font-semibold">Risk Category *</Label>
                  <Select value={editingRisk.category} onValueChange={(value) => setEditingRisk({...editingRisk, category: value as any})}>
                    <SelectTrigger className="mt-2 h-12 text-base">
                      <SelectValue placeholder="Select risk category" />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-sm bg-white/95 border shadow-lg">
                      {riskCategories.map(cat => (
                        <SelectItem key={cat} value={cat} className="text-base py-3 cursor-pointer hover:bg-orange-50">{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit-department" className="text-base font-semibold">Department *</Label>
                  <Select value={editingRisk.department} onValueChange={(value) => setEditingRisk({...editingRisk, department: value})}>
                    <SelectTrigger className="mt-2 h-12 text-base">
                      <SelectValue placeholder="Select responsible department" />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-sm bg-white/95 border shadow-lg">
                      {departments.map(dept => (
                        <SelectItem key={dept.id} value={dept.name} className="text-base py-3 cursor-pointer hover:bg-orange-50">
                          {dept.name} ({dept.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit-probability" className="text-base font-semibold">Probability *</Label>
                  <Select value={editingRisk.probability} onValueChange={(value) => setEditingRisk({...editingRisk, probability: value as any})}>
                    <SelectTrigger className="mt-2 h-12 text-base">
                      <SelectValue placeholder="Select probability level" />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-sm bg-white/95 border shadow-lg">
                      {probabilityLevels.map(level => (
                        <SelectItem key={level} value={level} className="text-base py-3 cursor-pointer hover:bg-orange-50">
                          {level} - {level === 'Low' ? 'Unlikely to occur' : level === 'Medium' ? 'Possible occurrence' : 'Likely to occur'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit-impact" className="text-base font-semibold">Impact Level *</Label>
                  <Select value={editingRisk.impact} onValueChange={(value) => setEditingRisk({...editingRisk, impact: value as any})}>
                    <SelectTrigger className="mt-2 h-12 text-base">
                      <SelectValue placeholder="Select impact level" />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-sm bg-white/95 border shadow-lg">
                      {impactLevels.map(level => (
                        <SelectItem key={level} value={level} className="text-base py-3 cursor-pointer hover:bg-orange-50">
                          {level} - {level === 'Low' ? 'Minor impact' : level === 'Medium' ? 'Moderate impact' : 'Major impact'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit-status" className="text-base font-semibold">Status *</Label>
                  <Select value={editingRisk.status} onValueChange={(value) => setEditingRisk({...editingRisk, status: value as any})}>
                    <SelectTrigger className="mt-2 h-12 text-base">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-sm bg-white/95 border shadow-lg">
                      {statusOptions.map(status => (
                        <SelectItem key={status} value={status} className="text-base py-3 cursor-pointer hover:bg-orange-50">{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit-owner" className="text-base font-semibold">Risk Owner *</Label>
                  <Input
                    id="edit-owner"
                    value={editingRisk.owner}
                    onChange={(e) => setEditingRisk({...editingRisk, owner: e.target.value})}
                    placeholder="Enter the name of the person responsible for managing this risk"
                    required
                    className="mt-2 h-12 text-base"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="edit-mitigation" className="text-base font-semibold">Mitigation Plan</Label>
                  <Textarea
                    id="edit-mitigation"
                    value={editingRisk.mitigationPlan || ''}
                    onChange={(e) => setEditingRisk({...editingRisk, mitigationPlan: e.target.value})}
                    placeholder="Describe the plan to mitigate or manage this risk"
                    className="mt-2 min-h-[100px] text-base"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button type="button" variant="outline" onClick={() => setShowEditModal(false)} className="px-8 py-3 text-base">
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdating} className="bg-saywhat-orange hover:bg-orange-600 px-8 py-3 text-base">
                  {isUpdating ? (
                    <>
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                      Updating...
                    </>
                  ) : (
                    'Update Risk'
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}